import { createStore } from "redux";
import rootReducer from "src/reducers";
import {
  addItem,
  replaceItem,
  removeItem,
  selectItem,
  translateItem,
  translateItemGroup,
  transformItem,
  transformItemGroup,
  updateItemCharacteristics,
  loadItems,
  translateCanvas,
  scaleCanvas,
  changeRouteRequest,
  changeRouteFailure,
  changeRouteSuccess,
  refreshCanvas,
} from "src/actions";
import Record from "src/components/record";

let props;
let store;
let state;
let canvas;
let ctx;

let lastInputX;
let lastInputY;
let dragStartX;
let dragStartY;
let lastInputX2;
let lastInputY2;
let lastCanvasScale;
let draggingItem;
let draggingItemType;
let draggingItemGroup;
let draggingCanvas;
let touchScaling;
let currentItemId;
let lastDoubleClickedItem;

let pressTimer;
let clickTimer = null;

let isScrolling;
let isDragging;
let isAnimating = false;
let lockScrolling = false;
let lastScrollTime = 0;
let lastScrollDelta = 0;
let wasSelecting = false;
let wasPinching = false;
let wasOnModal = false;
let wasLongPressing = false;
let numFingers = 0;

function initialize(inputCanvas, inputProps) {
  store = createStore(rootReducer);

  canvas = inputCanvas;
  props = inputProps;
  if (canvas.getContext) {
    ctx = canvas.getContext("2d");
    Record.init(ctx);
    store.subscribe(() => render());
    bindEvents(canvas);
  } else {
    console.warn("canvas not supported");
  }
  return store;
}

function render() {
  state = store.getState();
  resetCanvas();
  const isZooming = isScrolling || touchScaling || isAnimating;
  let redraw = false;
  state.items.forEach((item) => {
    const alpha = Record.render(getRecordProps(item), isZooming);
    if (alpha < 1) {
      redraw = true;
    }
  });
  if (redraw && !isScrolling && !isDragging) {
    smoothDispatch(refreshCanvas());
  }
}

function smoothDispatch(action, callback) {
  window.requestAnimationFrame(function () {
    store.dispatch(action);
    if (callback) {
      callback();
    }
  });
}

function loadVisibleImages() {
  state.items.forEach((item) => {
    const visibility = Record.getVisibleOpacity(item.width, item.scale, state.canvas.scale);
    const isInViewport = Record.isRecordInViewport(
      item,
      state.canvas,
      0,
      0,
      canvas.width / state.canvas.scale,
      canvas.height / state.canvas.scale
    );
    if (visibility > 0.9 && isInViewport) {
      Record.loadImage(getRecordProps(item));
    }
  });
}

function changeBackground() {
  document.querySelector("html").style.background = `${state.canvas.color || "#000"} url('${
    state.canvas.src
  }') no-repeat center center fixed`;
  document.querySelector("html").style.backgroundSize = "cover";
}

function checkTransition(delta) {
  const totalVisibleWidth = state.items.reduce((sum, item) => sum + item.width * item.scale * state.canvas.scale, 0);
  if (delta < 0 && totalVisibleWidth < 100) {
    return props.onTransition(-1, state.canvas, state.isOwner);
  } else if (delta > 0) {
    let item;
    for (let i = 0; i < state.items.length; i++) {
      item = state.items[i];
      if (
        !item.pinBack &&
        Record.isRecordEnclosed(
          item,
          state.canvas,
          0,
          0,
          canvas.width / state.canvas.scale,
          canvas.height / state.canvas.scale
        )
      ) {
        lastDoubleClickedItem = item;
        return props.onTransition(1, item, state.isOwner);
      }
    }
  }
  if (props.isModalInfoVisible()) {
    wasOnModal = true;
  }
  props.onHideModalInfo();
  return false;
}

function getRecordProps(item) {
  return {
    ...item,
    canvasScale: state.canvas.scale,
    selected: item.id === state.selectedItem,
    onGetItemProps: handleGetItemProps,
    onUpdateItemProps: handleUpdateItemProps,
  };
}

function handleGetItemProps(id) {
  return getRecordProps(state.items.filter((item) => item.id === id)[0]);
}

function handleUpdateItemProps(id, options) {
  smoothDispatch(updateItemCharacteristics(id, options));
}

function resetCanvas() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(state.canvas.scale, 0, 0, state.canvas.scale, state.canvas.x, state.canvas.y);
}

function setDraggingItemGroup() {
  const { xMin, yMin, xMax, yMax } = Record.computeTransformedDimensions(draggingItem, state.canvas);
  if (draggingItem.pinBack) {
    draggingItemGroup = state.items.filter(
      (item) =>
        item.id !== draggingItem.id &&
        !item.pinBack &&
        Record.isRecordInViewport(item, state.canvas, xMin, yMin, xMax - xMin, yMax - yMin)
    );
  } else {
    draggingItemGroup = null;
  }
}

function translateItemStart(x, y, item) {
  draggingItem = item;
  setDraggingItemGroup();
  lastInputX = x !== null ? x : lastInputX;
  lastInputY = y !== null ? y : lastInputY;
  canvas.style.cursor = "pointer";
  smoothDispatch(selectItem(draggingItem.id, draggingItem.pinBack));
}

function translateItemMove(deltaMouseX, deltaMouseY) {
  if (draggingItemGroup) {
    const transforms = [...draggingItemGroup, draggingItem].map((item) => ({
      id: item.id,
      x: item.x + deltaMouseX,
      y: item.y + deltaMouseY,
    }));
    smoothDispatch(translateItemGroup(transforms));
  } else {
    smoothDispatch(translateItem(draggingItem.id, draggingItem.x + deltaMouseX, draggingItem.y + deltaMouseY));
  }
}

function transformItemStart(x, y, item) {
  draggingItem = item;
  setDraggingItemGroup();
  lastInputX = x;
  lastInputY = y;
  canvas.style.cursor = "crosshair";
}

function transformItemMove(deltaMouseX, deltaMouseY) {
  const { fullWidth, fullHeight } = Record.computeBorderSize(draggingItem);
  const newWidth = 2 * deltaMouseX + fullWidth * draggingItem.scale;
  const newHeight = 2 * deltaMouseY + fullHeight * draggingItem.scale;
  const originalDiagonal = Math.sqrt(Math.pow(fullWidth, 2) + Math.pow(fullHeight, 2));
  const newDiagonal = Math.sqrt(Math.pow(newWidth, 2) + Math.pow(newHeight, 2));
  const scale = newDiagonal / originalDiagonal;
  const angle = calculateAngle(fullWidth, fullHeight, newWidth, newHeight);
  transformItemWithGroup(draggingItem, draggingItemGroup, scale, angle);
}

function transformItemWithGroup(draggingItem, draggingItemGroup, scale, angle) {
  if (draggingItemGroup) {
    const transforms = [...draggingItemGroup, draggingItem].map((item) => {
      let xDelta = item.x - draggingItem.x;
      let yDelta = item.y - draggingItem.y;
      let diag = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
      let angleItem = Math.atan2(yDelta, xDelta);
      return {
        id: item.id,
        x: draggingItem.x + (diag * Math.cos(angleItem + angle - draggingItem.angle) * scale) / draggingItem.scale,
        y: draggingItem.y + (diag * Math.sin(angleItem + angle - draggingItem.angle) * scale) / draggingItem.scale,
        scale: item.scale * (scale / draggingItem.scale),
        angle: item.angle + angle - draggingItem.angle,
      };
    });
    smoothDispatch(transformItemGroup(transforms));
  } else {
    smoothDispatch(transformItem(draggingItem.id, draggingItem.x, draggingItem.y, scale, angle));
  }
}

function translateCanvasStart(x, y) {
  draggingCanvas = true;
  lastInputX = x;
  lastInputY = y;
  draggingItem = null;
  draggingItemGroup = null;
  draggingItemType = null;
  if (state.selectedItem !== -1) {
    smoothDispatch(selectItem(-1));
    wasSelecting = true;
  }
}

function translateCanvasMove(deltaMouseX, deltaMouseY, inputX, inputY) {
  smoothDispatch(translateCanvas(deltaMouseX, deltaMouseY));
  lastInputX = inputX;
  lastInputY = inputY;
}

function scaleCanvasMoveInitial() {
  clearTimeout(isScrolling);
  isScrolling = setTimeout(() => {
    isScrolling = undefined;
    scaleCanvasMoveFinal();
  }, 250);
}

function scaleCanvasMoveFinal() {
  isScrolling = undefined;
  loadVisibleImages();
  render();
}

function scaleCanvasMove(inputX, inputY, delta) {
  const zoom = Math.exp(delta * 0.2);
  const scale = state.canvas.scale * zoom;
  const x = inputX - (inputX - state.canvas.x) * zoom;
  const y = inputY - (inputY - state.canvas.y) * zoom;
  const transitioned = checkTransition(delta);
  if (!transitioned) {
    smoothDispatch(scaleCanvas(scale, x, y));
  }
}

function allTransformEnd() {
  draggingItem = null;
  draggingItemGroup = null;
  draggingItemType = null;
  draggingCanvas = null;
  if (touchScaling && numFingers <= 0) {
    touchScaling = false;
  } else if (touchScaling) {
    wasPinching = true;
  } else {
    wasPinching = false;
  }
  isDragging = false;
  wasSelecting = false;
  if (props.isModalInfoVisible()) {
    wasOnModal = true;
  } else {
    wasOnModal = false;
  }
  wasLongPressing = false;
  canvas.style.cursor = "";
  loadVisibleImages();
  render();
}

function onNewRecord() {
  props.onNewRecord(state);
}

function zoomOut() {
  if (lastDoubleClickedItem) {
    zoomToFitAll();
  } else {
    zoomOutToNextLevel();
  }
}

function zoomIntoItem(item) {
  const { x, y, width, height } = Record.getTransformedDimensions({
    ...item,
    width: item.width / 4,
    height: item.height / 4,
  });
  zoomToFit(x, y, width, height);
}

function zoomOutToNextLevel() {
  if (state.items.length === 0) {
    return props.onTransition(-1, state.canvas, state.isOwner);
  }
  const { inputX, inputY } = getInputPos({
    clientX: window.innerWidth / 2,
    clientY: window.innerHeight / 2,
  });
  let starttime;
  let duration = 300;
  let draw = function (timestamp) {
    scaleCanvasMove(inputX, inputY, -0.5);
    let runtime = timestamp - starttime;
    if (runtime < duration) {
      requestAnimationFrame(draw);
    } else {
      isAnimating = false;
      return props.onTransition(-1, state.canvas, state.isOwner);
    }
  };
  isAnimating = true;
  requestAnimationFrame(function (timestamp) {
    starttime = timestamp;
    draw(timestamp);
  });
}

function getZoomToFitProperties(x, y, width, height, padding = 0.05) {
  const xscale = (canvas.width - 2 * padding * canvas.width) / width;
  const yscale = (canvas.height - 2 * padding * canvas.height) / height;
  if (!xscale || !yscale) {
    return {};
  }
  let canvasScale, canvasX, canvasY, xOffset, yOffset;
  if (xscale < yscale) {
    yOffset = (canvas.height - height * xscale) / 2;
    canvasScale = xscale;
    canvasX = -x * xscale + padding * canvas.width;
    canvasY = -y * xscale + yOffset;
  } else {
    xOffset = (canvas.width - width * yscale) / 2;
    canvasScale = yscale;
    canvasX = -x * yscale + xOffset;
    canvasY = -y * yscale + padding * canvas.height;
  }
  return { canvasScale, canvasX, canvasY };
}

function zoomToFit(x, y, width, height, fitAll = false, padding = 0.05, animate = true) {
  const xscale = (canvas.width - 2 * padding * canvas.width) / width;
  const yscale = (canvas.height - 2 * padding * canvas.height) / height;
  if (!xscale || !yscale) {
    return;
  }
  let { canvasScale, canvasX, canvasY } = getZoomToFitProperties(x, y, width, height, padding);
  if (!fitAll && canvasScale === state.canvas.scale && canvasX === state.canvas.x && canvasY === state.canvas.y) {
    zoomToFitAll();
    return;
  }
  if (animate) {
    let initialCanvasScale = state.canvas.scale;
    let initialCanvasX = state.canvas.x;
    let initialCanvasY = state.canvas.y;
    animateScaleCanvas(initialCanvasScale, initialCanvasX, initialCanvasY, canvasScale, canvasX, canvasY);
  } else {
    smoothDispatch(scaleCanvas(canvasScale, canvasX, canvasY), function () {
      loadVisibleImages();
    });
  }
}

// TODO: Refactor arguments to two objects, canvasInitial & canvasFinal
function animateScaleCanvas(
  initialCanvasScale,
  initialCanvasX,
  initialCanvasY,
  finalCanvasScale,
  finalCanvasX,
  finalCanvasY
) {
  let starttime;
  let duration = 300;
  let draw = function (timestamp) {
    let runtime = timestamp - starttime;
    let progress = runtime / duration;
    progress = Math.min(progress, 1);
    let canvasScale = initialCanvasScale + (finalCanvasScale - initialCanvasScale) * progress;
    let canvasX = initialCanvasX + (finalCanvasX - initialCanvasX) * progress;
    let canvasY = initialCanvasY + (finalCanvasY - initialCanvasY) * progress;
    smoothDispatch(scaleCanvas(canvasScale, canvasX, canvasY));
    if (runtime < duration) {
      requestAnimationFrame(draw);
    } else {
      isAnimating = false;
      allTransformEnd();
      store.dispatch(changeRouteFailure());
      checkTransition(1);
    }
  };
  isAnimating = true;
  requestAnimationFrame(function (timestamp) {
    starttime = timestamp;
    draw(timestamp);
  });
}

function getAllItemsDimensions(items) {
  let xPoints = [];
  let yPoints = [];
  items.forEach((item) => {
    const { x, y, width, height } = Record.getTransformedDimensions(item);
    xPoints.push(x);
    xPoints.push(x + width);
    yPoints.push(y);
    yPoints.push(y + height);
  });
  const x = Math.min(...xPoints);
  const width = Math.max(...xPoints) - x;
  const y = Math.min(...yPoints);
  const height = Math.max(...yPoints) - y;
  return { x, y, width, height };
}

function zoomToFitAll(padding = 0.1, animate = true) {
  const { x, y, width, height } = getAllItemsDimensions(state.items);
  zoomToFit(x, y, width, height, true, padding, animate);
  lastDoubleClickedItem = null;
}

function getInputPos(evt) {
  const x = evt.touches ? evt.touches[0].clientX : null || evt.clientX || evt.pageX;
  const y = evt.touches ? evt.touches[0].clientY : null || evt.clientY || evt.pageY;
  const bRect = canvas.getBoundingClientRect();
  const inputX = (x - bRect.left) * (canvas.width / bRect.width);
  const inputY = (y - bRect.top) * (canvas.height / bRect.height);

  let inputX2, inputY2;
  if (evt.touches && evt.touches.length > 1) {
    inputX2 = (evt.touches[1].clientX - bRect.left) * (canvas.width / bRect.width);
    inputY2 = (evt.touches[1].clientY - bRect.top) * (canvas.height / bRect.height);
  }
  return {
    inputX: inputX,
    inputY: inputY,
    inputX2: inputX2,
    inputY2: inputY2,
  };
}

function calculateAngle(oldWidth, oldHeight, newWidth, newHeight) {
  const angle1 = Math.atan2(oldHeight, oldWidth);
  const angle2 = Math.atan2(newHeight, newWidth);
  const rawAngle = draggingItem.angle + angle2 - angle1;
  const angle = rawAngle > Math.PI ? rawAngle - 2 * Math.PI : rawAngle;
  return Math.abs(angle) < 0.05 ? 0 : angle;
}

function transitionRouteRequest() {
  lockScrolling = true;
  store.dispatch(changeRouteRequest());
}

function transitionRouteFailure() {
  store.dispatch(changeRouteFailure());
}

function transitionRouteSuccess(newState, delta, item, modalItem) {
  if (delta > 0) {
    currentItemId = item ? item.id : newState.canvas.id;
    replaceState(newState, false, modalItem);
  } else {
    const currentItem = newState.items.filter((item) => item.id === currentItemId)[0];
    if (currentItem) {
      animateState(newState, currentItem);
    } else {
      replaceState(newState);
    }
  }
}

function animateState(newState, currentItem) {
  let dimensions1 = Record.getTransformedDimensions(currentItem);
  let canvasInitial = getZoomToFitProperties(dimensions1.x, dimensions1.y, dimensions1.width, dimensions1.height, 0);
  let initialCanvasScale = canvasInitial.canvasScale;
  let initialCanvasX = canvasInitial.canvasX;
  let initialCanvasY = canvasInitial.canvasY;
  let dimensions2 = getAllItemsDimensions(newState.items);
  let canvasFinal = getZoomToFitProperties(dimensions2.x, dimensions2.y, dimensions2.width, dimensions2.height);
  let finalCanvasScale = canvasFinal.canvasScale;
  let finalCanvasX = canvasFinal.canvasX;
  let finalCanvasY = canvasFinal.canvasY;
  newState.canvas.scale = initialCanvasScale;
  newState.canvas.x = initialCanvasX;
  newState.canvas.y = initialCanvasY;
  // TODO: Chain state changes instead of two async calls...
  replaceState(newState, true);
  animateScaleCanvas(initialCanvasScale, initialCanvasX, initialCanvasY, finalCanvasScale, finalCanvasX, finalCanvasY);
}

function animateInItem(newState, item) {
  replaceState(newState, true);
  let initialItemScale = item.scale * 10;
  let initialItemX = item.x;
  let initialItemY = item.x;
  let initialItemAngle = 0;
  let finalItemScale = item.scale;
  let finalItemX = item.x;
  let finalItemY = item.y;
  let finalItemAngle = item.angle;
  let starttime;
  let duration = 3000;
  let draw = function (timestamp) {
    let runtime = timestamp - starttime;
    let progress = runtime / duration;
    progress = Math.min(progress, 1);
    let itemX = initialItemX + (finalItemX - initialItemX) * progress;
    let itemY = initialItemY + (finalItemY - initialItemY) * progress;
    let itemScale = initialItemScale + (finalItemScale - initialItemScale) * progress;
    let itemAngle = initialItemAngle + (finalItemAngle - initialItemAngle) * progress;
    smoothDispatch(transformItem(item.id, itemX, itemY, itemScale, itemAngle));
    if (runtime < duration) {
      requestAnimationFrame(draw);
    } else {
      isAnimating = false;
      allTransformEnd();
      store.dispatch(changeRouteFailure());
    }
  };
  isAnimating = true;
  requestAnimationFrame(function (timestamp) {
    starttime = timestamp;
    draw(timestamp);
  });
}

function replaceState(newState, isChangingRoute = false, modalItem = null) {
  store.dispatch(changeRouteSuccess(stateWithValidDefaults(newState), isChangingRoute));
  if (modalItem) {
    const { x, y, width, height } = Record.getTransformedDimensions(modalItem);
    zoomToFit(x, y, width, height, false, 0.05, false);
    lastDoubleClickedItem = modalItem;
  } else {
    zoomToFitAll(0.2, false);
  }
  changeBackground();
}

function stateWithValidDefaults(newState) {
  let validState = { ...newState };
  if (!validState.canvas.src) {
    validState.canvas.src = "https://res.cloudinary.com/recollectionspace/image/upload/v1558827677/placeholder.jpg";
    validState.canvas.color = "#000";
  }
  validState.items = validState.items.map((item) => {
    if (item.src) {
      return item;
    } else {
      return {
        ...item,
        src: "https://res.cloudinary.com/recollectionspace/image/upload/v1558827677/placeholder.jpg",
        width: 640,
        height: 480,
        color: "#000",
      };
    }
  });
  return validState;
}

function replaceItems(newItems) {
  smoothDispatch(loadItems(newItems));
}

function replaceItemProperties(itemOld, itemNew) {
  itemNew.scale = getNewItemScale(itemNew.width);
  smoothDispatch(replaceItem(itemOld, itemNew), allTransformEnd);
  translateItemStart(lastInputX, lastInputY, itemNew);
}

function getNewItemScale(itemWidth) {
  return (0.25 * canvas.width) / state.canvas.scale / itemWidth;
}

function createItem(image, caption, body, options = {}) {
  let startingCenter = getVisiblePoint();
  let img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = function () {
    let height = img.height;
    let width = img.width;
    let item = {
      id: null,
      src: img.src,
      caption: caption,
      body: body,
      angle: 0,
      x: startingCenter.x,
      y: startingCenter.y,
      width: width,
      height: height,
      scale: getNewItemScale(width),
      border: true,
      color: Record.getDominantColor(img),
    };
    smoothDispatch(addItem({ ...item, caption: "Saving..." }));
    props.onSaveRecord(state.canvas, item, image, options);
  };
  img.onerror = function (error) {
    console.error("Image could not load", image, error);
  };
  if (image instanceof File) {
    img.src = URL.createObjectURL(image);
  } else {
    let item = {
      id: null,
      src: image,
      caption: caption,
      body: body,
      angle: 0,
      x: startingCenter.x,
      y: startingCenter.y,
      width: options.width,
      height: options.height,
      scale: getNewItemScale(options.width),
      border: true,
      color: null,
    };
    smoothDispatch(addItem({ ...item, caption: "Saving..." }));
    props.onSaveRecord(state.canvas, item, image, options);
  }
}

function getVisiblePoint() {
  return {
    x: (-state.canvas.x + canvas.width * 0.5) / state.canvas.scale,
    y: (-state.canvas.y + canvas.height * 0.5) / state.canvas.scale,
  };
}

function updateItem(id, options) {
  smoothDispatch(updateItemCharacteristics(id, options));
}

function deleteItem(item) {
  smoothDispatch(removeItem(item));
}

function onClickCanvas(inputX, inputY) {
  const item = state.items.find((item) => item.id === state.selectedItem);
  if (item && item.id !== null) {
    draggingItemType = Record.isPointInRecord({
      ...item,
      inputX,
      inputY,
      selected: item.id === state.selectedItem,
    });
    if (draggingItemType === "record") {
      translateItemStart(inputX, inputY, item);
    } else if (draggingItemType === "handle") {
      transformItemStart(inputX, inputY, item);
    } else if (draggingItemType === "edit-button") {
      props.onShowModalEdit(item);
    } else if (draggingItemType === "destroy-button") {
      props.onShowModalDestroy(item);
    } else {
      props.onUpdateRecord(item);
      translateCanvasStart(inputX, inputY);
    }
  } else {
    translateCanvasStart(inputX, inputY);
  }
  checkTransition(1);
}

function getItems() {
  return state.items.map((item) => ({
    id: item.id,
    caption: item.caption,
    size: item.width * item.height * item.scale * item.scale,
    date: new Date(item.created),
  }));
}

function bindEvents(canvas) {
  function onInputDown(evt) {
    evt.preventDefault();
    lockScrolling = false;
    const { inputX, inputY, inputX2, inputY2 } = getInputPos(evt);
    if (clickTimer === null && !props.isModalInfoVisible()) {
      clickTimer = setTimeout(function () {
        clickTimer = null;
      }, 500);
    } else if (clickTimer !== null) {
      clearTimeout(clickTimer);
      clickTimer = null;
      if (inputX2 === undefined && inputY2 === undefined && withinMovementThreshold(inputX, inputY)) {
        onDoubleClick();
        return;
      }
    }
    isDragging = true;
    if (inputX2 === undefined && inputY2 === undefined) {
      pressTimer = setTimeout(onLongPress, 1000);
    } else {
      clearTimeout(pressTimer);
    }
    if (inputX2 && inputY2) {
      numFingers = 2;
      pinchStart(inputX, inputY, inputX2, inputY2);
    } else {
      numFingers = 1;
    }
    onClickCanvas(inputX, inputY);
    dragStartX = lastInputX;
    dragStartY = lastInputY;
  }

  function onLongPress() {
    if (!state.isOwner) {
      return;
    }
    if (props.isModalInfoVisible()) {
      return;
    }
    if (state.loadingItems) {
      props.onShowModalInfo(
        {
          caption: "Loading",
          body: "Items can't be editing during loading.",
        },
        state.isOwner
      );
      return;
    }
    wasLongPressing = true;
    const selectedItem = state.items.find((item) => item.id === state.selectedItem);
    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      draggingItemType = Record.isPointInRecord({
        ...item,
        inputX: lastInputX,
        inputY: lastInputY,
        selected: item.id === state.selectedItem,
      });
      if (draggingItemType === "record") {
        if (
          Record.isRecordEnclosed(
            item,
            state.canvas,
            0,
            0,
            canvas.width / state.canvas.scale,
            canvas.height / state.canvas.scale
          )
        ) {
          return;
        } else if (item !== selectedItem) {
          translateItemStart(lastInputX, lastInputY, item);
          return;
        } else {
          props.onShowModalInfo(item, state.isOwner);
          return;
        }
      } else if (draggingItemType === "handle" && item.id === state.selectedItem) {
        transformItemStart(lastInputX, lastInputY, item);
        return;
      }
    }
    onNewRecord();
  }

  function onInputMove(evt) {
    if (props.isModalInfoVisible()) {
      return;
    }
    const { inputX, inputY, inputX2, inputY2 } = getInputPos(evt);
    const scaledInputX = inputX / state.canvas.scale;
    const scaledInputY = inputY / state.canvas.scale;
    const lastScaledInputX = lastInputX / state.canvas.scale;
    const lastScaledInputY = lastInputY / state.canvas.scale;
    const deltaMouseX = scaledInputX - lastScaledInputX;
    const deltaMouseY = scaledInputY - lastScaledInputY;
    if (touchScaling) {
      pinchMove(inputX, inputY, inputX2, inputY2);
    } else if (draggingItemType === "handle") {
      transformItemMove(deltaMouseX, deltaMouseY);
    } else if (draggingItem) {
      translateItemMove(deltaMouseX, deltaMouseY);
    } else if (draggingCanvas) {
      translateCanvasMove(deltaMouseX, deltaMouseY, inputX, inputY);
    }
    if (isDragging && !withinMovementThreshold(inputX, inputY)) {
      clearTimeout(pressTimer);
    }
  }

  function onInputUp(evt) {
    numFingers -= 1;
    clearTimeout(pressTimer);
    focusOnItem();
    allTransformEnd();
  }

  function focusOnItem() {
    if (!withinMovementThreshold(lastInputX, lastInputY)) {
      return;
    }
    if (state.selectedItem !== -1) {
      return;
    }
    if (isAnimating) {
      return;
    }
    if (wasSelecting) {
      return;
    }
    if (touchScaling) {
      return;
    }
    if (wasPinching) {
      return;
    }
    if (wasOnModal) {
      return;
    }
    if (wasLongPressing) {
      return;
    }
    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      draggingItemType = Record.isPointInRecord({
        ...item,
        inputX: lastInputX,
        inputY: lastInputY,
        selected: true,
      });
      if (draggingItemType === "record") {
        if (item === lastDoubleClickedItem) {
          if (item.type === "record") {
            props.onShowModalInfo(item, state.isOwner);
          } else {
            zoomIntoItem(item);
          }
          lastDoubleClickedItem = item;
          return;
        }
        const { x, y, width, height } = Record.getTransformedDimensions(item);
        zoomToFit(x, y, width, height);
        lastDoubleClickedItem = item;
        return;
      }
    }
    zoomOut();
  }

  function onScroll(evt) {
    if (isHumanScroll(evt) && !state.isChangingRoute) {
      lockScrolling = false;
    }
    if (state.isChangingRoute || lockScrolling) {
      isScrolling = undefined;
      return evt.preventDefault() && false;
    }
    if (!isScrolling) {
      scaleCanvasMoveInitial();
    }
    const delta = evt.deltaMode === 1 ? evt.deltaY / 3 : evt.deltaY / 40;
    if (delta && isScrolling) {
      const { inputX, inputY } = getInputPos(evt);
      scaleCanvasMove(inputX, inputY, delta);
    }
    return evt.preventDefault() && false;
  }

  function onDoubleClick() {
    return;
  }

  function pinchStart(x1, y1, x2, y2) {
    touchScaling = true;
    lastInputX = x1;
    lastInputY = y1;
    lastInputX2 = x2;
    lastInputY2 = y2;
    lastCanvasScale = state.canvas.scale;
  }

  function pinchMove(inputX, inputY, inputX2, inputY2) {
    if (state.isChangingRoute) {
      return;
    }
    const originalDistance = Math.sqrt(Math.pow(lastInputX - lastInputX2, 2) + Math.pow(lastInputY - lastInputY2, 2));
    const newDistance = Math.sqrt(Math.pow(inputX - inputX2, 2) + Math.pow(inputY - inputY2, 2));
    const factor = newDistance / originalDistance;
    if (draggingItem) {
      const angle = calculateAngle(
        lastInputX - lastInputX2,
        lastInputY - lastInputY2,
        inputX - inputX2,
        inputY - inputY2
      );
      transformItemWithGroup(draggingItem, draggingItemGroup, draggingItem.scale * factor, angle);
    } else if (draggingCanvas) {
      const xCenter = inputX + 0.5 * (inputX2 - inputX);
      const yCenter = inputY + 0.5 * (inputY2 - inputY);
      const x = xCenter - ((xCenter - state.canvas.x) * lastCanvasScale * factor) / state.canvas.scale;
      const y = yCenter - ((yCenter - state.canvas.y) * lastCanvasScale * factor) / state.canvas.scale;
      const delta = factor > 1 ? 1 : -1;
      const transitioned = checkTransition(delta);
      if (!transitioned) {
        smoothDispatch(scaleCanvas(lastCanvasScale * factor, x, y));
      }
    }
  }

  function withinMovementThreshold(inputX, inputY) {
    return Math.abs(inputX - dragStartX) < 0.02 * canvas.width && Math.abs(inputY - dragStartY) < 0.02 * canvas.height;
  }

  function isHumanScroll(evt) {
    const now = Date.now();
    const delta = evt.deltaY;
    const rapidSuccession = now - lastScrollTime < 100;
    const otherDirection = lastScrollDelta > 0 !== delta > 0;
    const speedDecrease = Math.abs(delta) <= Math.abs(lastScrollDelta);
    const isHuman = otherDirection || !rapidSuccession || !speedDecrease;
    lastScrollTime = now;
    lastScrollDelta = delta;
    return isHuman;
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    adjustForRetinaDisplays();
    render();
  }

  function adjustForRetinaDisplays() {
    if (window.devicePixelRatio !== 1) {
      canvas.width = canvas.width * window.devicePixelRatio;
      canvas.height = canvas.height * window.devicePixelRatio;
      if (!state) {
        state = store.getState();
      }
      ctx.scale(state.canvas.scale * window.devicePixelRatio, state.canvas.scale * window.devicePixelRatio);
    }
  }

  canvas.addEventListener("mousedown", onInputDown, false);
  canvas.addEventListener("touchstart", onInputDown, false);

  canvas.addEventListener("mousemove", onInputMove, false);
  canvas.addEventListener("touchmove", onInputMove, { passive: true });

  canvas.addEventListener("mouseup", onInputUp, false);
  canvas.addEventListener("touchend", onInputUp, false);

  canvas.addEventListener("wheel", onScroll, false);

  window.addEventListener("resize", resizeCanvas, false);

  resizeCanvas();
}

export default {
  initialize,
  transitionRouteRequest,
  transitionRouteFailure,
  transitionRouteSuccess,
  replaceItems,
  replaceItemProperties,
  createItem,
  deleteItem,
  updateItem,
  zoomToFitAll,
  zoomOut,
  onNewRecord,
  getItems,
};
