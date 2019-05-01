import { createStore } from "redux";
import rootReducer from "./reducers";
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
  refreshCanvas
} from "./actions";
import Record from "./components/record";

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

let pressTimer;
let clickTimer = null;

let wheeling;
let isScrolling;
let isDragging;

function render() {
  state = store.getState();
  resetCanvas();
  let redraw = false;
  state.items.forEach(item => {
    const isZooming = isScrolling || touchScaling;
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
  window.requestAnimationFrame(function() {
    store.dispatch(action);
    if (callback) {
      callback();
    }
  });
}

function loadVisibleImages() {
  state.items.forEach(item => {
    const visibility = Record.getVisibleOpacity(
      item.width,
      item.scale,
      state.canvas.scale
    );
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
  const imageUrl = state.canvas.src.startsWith("http")
    ? state.canvas.src
    : "/images/" + state.canvas.src;
  document.querySelector("html").style.background = `${
    state.canvas.color
  } url('${imageUrl}') no-repeat center center fixed`;
  document.querySelector("html").style.backgroundSize = "cover";
}

function checkTransition(delta) {
  const totalVisibleWidth = state.items.reduce(
    (sum, item) => sum + item.width * item.scale * state.canvas.scale,
    0
  );
  if (delta < 0 && totalVisibleWidth < 10) {
    return props.onTransition(-1, state.canvas);
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
        return props.onTransition(1, item);
      }
    }
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
    onUpdateItemProps: handleUpdateItemProps
  };
}

function handleGetItemProps(id) {
  return getRecordProps(state.items.filter(item => item.id === id)[0]);
}

function handleUpdateItemProps(id, options) {
  smoothDispatch(updateItemCharacteristics(id, options));
}

function resetCanvas() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(
    state.canvas.scale,
    0,
    0,
    state.canvas.scale,
    state.canvas.x,
    state.canvas.y
  );
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
    ctx.scale(
      state.canvas.scale * window.devicePixelRatio,
      state.canvas.scale * window.devicePixelRatio
    );
  }
}

function setDraggingItemGroup() {
  const { xMin, yMin, xMax, yMax } = Record.computeTransformedDimensions(
    draggingItem,
    state.canvas
  );
  if (draggingItem.pinBack) {
    draggingItemGroup = state.items.filter(
      item =>
        item.id !== draggingItem.id &&
        !item.pinBack &&
        Record.isRecordInViewport(
          item,
          state.canvas,
          xMin,
          yMin,
          xMax - xMin,
          yMax - yMin
        )
    );
  } else {
    draggingItemGroup = null;
  }
}

function translateItemStart(x, y, item) {
  draggingItem = item;
  setDraggingItemGroup();
  lastInputX = x;
  lastInputY = y;
  canvas.style.cursor = "pointer";
  smoothDispatch(selectItem(draggingItem.id, draggingItem.pinBack));
}

function translateItemMove(deltaMouseX, deltaMouseY) {
  if (draggingItemGroup) {
    const transforms = [...draggingItemGroup, draggingItem].map(item => ({
      id: item.id,
      x: item.x + deltaMouseX,
      y: item.y + deltaMouseY
    }));
    smoothDispatch(translateItemGroup(transforms));
  } else {
    smoothDispatch(
      translateItem(
        draggingItem.id,
        draggingItem.x + deltaMouseX,
        draggingItem.y + deltaMouseY
      )
    );
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
  const originalDiagonal = Math.sqrt(
    Math.pow(fullWidth, 2) + Math.pow(fullHeight, 2)
  );
  const newDiagonal = Math.sqrt(Math.pow(newWidth, 2) + Math.pow(newHeight, 2));
  const scale = newDiagonal / originalDiagonal;
  const angle = calculateAngle(fullWidth, fullHeight, newWidth, newHeight);
  transformItemWithGroup(draggingItem, draggingItemGroup, scale, angle);
}

function transformItemWithGroup(draggingItem, draggingItemGroup, scale, angle) {
  if (draggingItemGroup) {
    const transforms = [...draggingItemGroup, draggingItem].map(item => {
      let xDelta = item.x - draggingItem.x;
      let yDelta = item.y - draggingItem.y;
      let diag = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
      let angleItem = Math.atan2(yDelta, xDelta);
      return {
        id: item.id,
        x:
          draggingItem.x +
          (diag * Math.cos(angleItem + angle - draggingItem.angle) * scale) /
            draggingItem.scale,
        y:
          draggingItem.y +
          (diag * Math.sin(angleItem + angle - draggingItem.angle) * scale) /
            draggingItem.scale,
        scale: item.scale * (scale / draggingItem.scale),
        angle: item.angle + angle - draggingItem.angle
      };
    });
    smoothDispatch(transformItemGroup(transforms));
  } else {
    smoothDispatch(
      transformItem(
        draggingItem.id,
        draggingItem.x,
        draggingItem.y,
        scale,
        angle
      )
    );
  }
}

function translateCanvasStart(x, y) {
  draggingCanvas = true;
  lastInputX = x;
  lastInputY = y;
  draggingItem = null;
  draggingItemGroup = null;
  draggingItemType = null;
  smoothDispatch(selectItem(-1));
}

function translateCanvasMove(deltaMouseX, deltaMouseY, inputX, inputY) {
  smoothDispatch(translateCanvas(deltaMouseX, deltaMouseY));
  lastInputX = inputX;
  lastInputY = inputY;
}

function scaleCanvasMoveInitial() {
  isScrolling = true;
}

function scaleCanvasMoveFinal() {
  isScrolling = false;
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

function pinchStart(x1, y1, x2, y2) {
  touchScaling = true;
  lastInputX = x1;
  lastInputY = y1;
  lastInputX2 = x2;
  lastInputY2 = y2;
  lastCanvasScale = state.canvas.scale;
}

function pinchMove(inputX, inputY, inputX2, inputY2) {
  const originalDistance = Math.sqrt(
    Math.pow(lastInputX - lastInputX2, 2) +
      Math.pow(lastInputY - lastInputY2, 2)
  );
  const newDistance = Math.sqrt(
    Math.pow(inputX - inputX2, 2) + Math.pow(inputY - inputY2, 2)
  );
  const factor = newDistance / originalDistance;
  if (draggingItem) {
    const angle = calculateAngle(
      lastInputX - lastInputX2,
      lastInputY - lastInputY2,
      inputX - inputX2,
      inputY - inputY2
    );
    transformItemWithGroup(
      draggingItem,
      draggingItemGroup,
      draggingItem.scale * factor,
      angle
    );
  } else if (draggingCanvas) {
    const xCenter = inputX + 0.5 * (inputX2 - inputX);
    const yCenter = inputY + 0.5 * (inputY2 - inputY);
    const x =
      xCenter -
      ((xCenter - state.canvas.x) * lastCanvasScale * factor) /
        state.canvas.scale;
    const y =
      yCenter -
      ((yCenter - state.canvas.y) * lastCanvasScale * factor) /
        state.canvas.scale;
    const delta = factor > 1 ? 1 : -1;
    const transitioned = checkTransition(delta);
    if (!transitioned) {
      smoothDispatch(scaleCanvas(lastCanvasScale * factor, x, y));
    }
  }
}

function allTransformEnd() {
  draggingItem = null;
  draggingItemGroup = null;
  draggingItemType = null;
  draggingCanvas = null;
  touchScaling = false;
  isDragging = false;
  canvas.style.cursor = "";
  loadVisibleImages();
  render();
}

function onInputDown(evt) {
  evt.preventDefault();
  const { inputX, inputY, inputX2, inputY2 } = getInputPos(evt);
  if (clickTimer === null && !props.isModalInfoVisible()) {
    clickTimer = setTimeout(function() {
      clickTimer = null;
    }, 500);
  } else if (clickTimer !== null) {
    clearTimeout(clickTimer);
    clickTimer = null;
    if (
      inputX2 === undefined &&
      inputY2 === undefined &&
      withinMovementThreshold(inputX, inputY)
    ) {
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
    pinchStart(inputX, inputY, inputX2, inputY2);
  }
  const item = state.items.filter(item => item.id === state.selectedItem)[0];
  if (item) {
    draggingItemType = Record.isPointInRecord({
      ...item,
      inputX,
      inputY,
      canvasScale: state.canvas.scale
    });
    if (draggingItemType === "record") {
      translateItemStart(inputX, inputY, item);
    } else if (draggingItemType === "handle") {
      transformItemStart(inputX, inputY, item);
    } else {
      props.onUpdateRecord(item);
      translateCanvasStart(inputX, inputY);
    }
  } else {
    translateCanvasStart(inputX, inputY);
  }
  dragStartX = lastInputX;
  dragStartY = lastInputY;
  checkTransition(1);
}

function withinMovementThreshold(inputX, inputY) {
  return (
    Math.abs(inputX - dragStartX) < 0.02 * canvas.width &&
    Math.abs(inputY - dragStartY) < 0.02 * canvas.height
  );
}

function onLongPress() {
  if (state.loadingItems) {
    props.onShowModalInfo({
      caption: "Loading",
      body: "Items can't be editing during loading."
    });
    return;
  }
  const selectedItem = state.items.filter(
    item => item.id === state.selectedItem
  )[0];
  for (let i = state.items.length - 1; i >= 0; i--) {
    const item = state.items[i];
    draggingItemType = Record.isPointInRecord({
      ...item,
      inputX: lastInputX,
      inputY: lastInputY,
      canvasScale: state.canvas.scale
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
        props.onShowModalInfo(item);
        return;
      }
    } else if (
      draggingItemType === "handle" &&
      item.id === state.selectedItem
    ) {
      transformItemStart(lastInputX, lastInputY, item);
      return;
    }
  }
  props.onMenu(state);
}

function onDoubleClick() {
  for (let i = state.items.length - 1; i >= 0; i--) {
    const item = state.items[i];
    const itemType = Record.isPointInRecord({
      ...item,
      inputX: lastInputX,
      inputY: lastInputY,
      canvasScale: state.canvas.scale,
      skipCheckHandle: true
    });
    if (itemType === "record") {
      if (item.type === "record" || item.type === "collection") {
        props.onShowModalInfo(item);
        return;
      }
      const { x, y, width, height } = Record.getTransformedDimensions(item);
      zoomToFit(x, y, width, height);
      return;
    }
  }
  zoomToFitAll();
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

function zoomToFit(
  x,
  y,
  width,
  height,
  fitAll = false,
  padding = 0.05,
  animate = true
) {
  const xscale = (canvas.width - 2 * padding * canvas.width) / width;
  const yscale = (canvas.height - 2 * padding * canvas.height) / height;
  if (!xscale || !yscale) {
    return;
  }
  let { canvasScale, canvasX, canvasY } = getZoomToFitProperties(
    x,
    y,
    width,
    height,
    padding
  );
  if (
    !fitAll &&
    canvasScale === state.canvas.scale &&
    canvasX === state.canvas.x &&
    canvasY === state.canvas.y
  ) {
    zoomToFitAll();
    return;
  }
  if (animate) {
    let initialCanvasScale = state.canvas.scale;
    let initialCanvasX = state.canvas.x;
    let initialCanvasY = state.canvas.y;
    animateScaleCanvas(
      initialCanvasScale,
      initialCanvasX,
      initialCanvasY,
      canvasScale,
      canvasX,
      canvasY
    );
  } else {
    smoothDispatch(scaleCanvas(canvasScale, canvasX, canvasY));
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
  let draw = function(timestamp) {
    let runtime = timestamp - starttime;
    let progress = runtime / duration;
    progress = Math.min(progress, 1);
    let canvasScale =
      initialCanvasScale + (finalCanvasScale - initialCanvasScale) * progress;
    let canvasX = initialCanvasX + (finalCanvasX - initialCanvasX) * progress;
    let canvasY = initialCanvasY + (finalCanvasY - initialCanvasY) * progress;
    smoothDispatch(scaleCanvas(canvasScale, canvasX, canvasY));
    if (runtime < duration) {
      requestAnimationFrame(draw);
    } else {
      isScrolling = false;
      allTransformEnd();
      store.dispatch(changeRouteFailure());
    }
  };
  isScrolling = true;
  requestAnimationFrame(function(timestamp) {
    starttime = timestamp;
    draw(timestamp);
  });
}

function getAllItemsDimensions(items) {
  let xPoints = [];
  let yPoints = [];
  items.forEach(item => {
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
}

function onInputUp() {
  allTransformEnd();
  clearTimeout(pressTimer);
}

function onInputMove(evt) {
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

function onScroll(evt) {
  if (state.isChangingRoute) {
    isScrolling = false;
    return evt.preventDefault() && false;
  }
  if (!wheeling) {
    scaleCanvasMoveInitial();
  }
  clearTimeout(wheeling);
  wheeling = setTimeout(() => {
    wheeling = undefined;
    scaleCanvasMoveFinal();
  }, 250);
  let delta = evt.wheelDelta
    ? -evt.wheelDelta / 40
    : evt.detail
      ? evt.detail
      : 0;
  if (delta && isScrolling) {
    const { inputX, inputY } = getInputPos(evt);
    scaleCanvasMove(inputX, inputY, delta);
  }
  return evt.preventDefault() && false;
}

function getInputPos(evt) {
  const x = evt.touches
    ? evt.touches[0].clientX
    : null || evt.clientX || evt.pageX;
  const y = evt.touches
    ? evt.touches[0].clientY
    : null || evt.clientY || evt.pageY;
  const bRect = canvas.getBoundingClientRect();
  const inputX = (x - bRect.left) * (canvas.width / bRect.width);
  const inputY = (y - bRect.top) * (canvas.height / bRect.height);

  let inputX2, inputY2;
  if (evt.touches && evt.touches.length > 1) {
    inputX2 =
      (evt.touches[1].clientX - bRect.left) * (canvas.width / bRect.width);
    inputY2 =
      (evt.touches[1].clientY - bRect.top) * (canvas.height / bRect.height);
  }
  return {
    inputX: inputX,
    inputY: inputY,
    inputX2: inputX2,
    inputY2: inputY2
  };
}

function calculateAngle(oldWidth, oldHeight, newWidth, newHeight) {
  const angle1 = Math.atan2(oldHeight, oldWidth);
  const angle2 = Math.atan2(newHeight, newWidth);
  const rawAngle = draggingItem.angle + angle2 - angle1;
  const angle = rawAngle > Math.PI ? rawAngle - 2 * Math.PI : rawAngle;
  return Math.abs(angle) < 0.05 ? 0 : angle;
}

function initialize(inputCanvas, inputProps) {
  store = createStore(rootReducer);

  canvas = inputCanvas;
  props = inputProps;
  if (canvas.getContext) {
    ctx = canvas.getContext("2d");
    Record.init(ctx);

    canvas.addEventListener("mousedown", onInputDown, false);
    canvas.addEventListener("touchstart", onInputDown, false);

    window.addEventListener("mousemove", onInputMove, false);
    window.addEventListener("touchmove", onInputMove, { passive: true });

    window.addEventListener("mouseup", onInputUp, false);
    window.addEventListener("touchend", onInputUp, false);

    canvas.addEventListener("DOMMouseScroll", onScroll, false);
    canvas.addEventListener("mousewheel", onScroll, false);

    window.addEventListener("resize", resizeCanvas, false);

    resizeCanvas();
    store.subscribe(() => render());
  } else {
    console.warn("canvas not supported");
  }
  return store;
}

function transitionRouteRequest() {
  store.dispatch(changeRouteRequest());
}

function transitionRouteFailure() {
  store.dispatch(changeRouteFailure());
}

function transitionRouteSuccess(newState, delta, item) {
  if (delta > 0) {
    // if (item) {
    //   currentItemId = item.id;
    // }
    currentItemId = item ? item.id : newState.canvas.id;
    replaceState(newState);
  } else {
    const currentItem = newState.items.filter(
      item => item.id === currentItemId
    )[0];
    if (currentItem) {
      // animateInItem(newState, currentItem);
      animateState(newState, currentItem);
    } else {
      replaceState(newState);
    }
  }
}

function animateState(newState, currentItem) {
  let dimensions1 = Record.getTransformedDimensions(currentItem);
  let canvasInitial = getZoomToFitProperties(
    dimensions1.x,
    dimensions1.y,
    dimensions1.width,
    dimensions1.height,
    0
  );
  let initialCanvasScale = canvasInitial.canvasScale;
  let initialCanvasX = canvasInitial.canvasX;
  let initialCanvasY = canvasInitial.canvasY;
  let dimensions2 = getAllItemsDimensions(newState.items);
  let canvasFinal = getZoomToFitProperties(
    dimensions2.x,
    dimensions2.y,
    dimensions2.width,
    dimensions2.height
  );
  let finalCanvasScale = canvasFinal.canvasScale;
  let finalCanvasX = canvasFinal.canvasX;
  let finalCanvasY = canvasFinal.canvasY;
  newState.canvas.scale = initialCanvasScale;
  newState.canvas.x = initialCanvasX;
  newState.canvas.y = initialCanvasY;
  // TODO: Chain state changes instead of two async calls...
  replaceState(newState, true);
  animateScaleCanvas(
    initialCanvasScale,
    initialCanvasX,
    initialCanvasY,
    finalCanvasScale,
    finalCanvasX,
    finalCanvasY
  );
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
  let draw = function(timestamp) {
    let runtime = timestamp - starttime;
    let progress = runtime / duration;
    progress = Math.min(progress, 1);
    let itemX = initialItemX + (finalItemX - initialItemX) * progress;
    let itemY = initialItemY + (finalItemY - initialItemY) * progress;
    let itemScale =
      initialItemScale + (finalItemScale - initialItemScale) * progress;
    let itemAngle =
      initialItemAngle + (finalItemAngle - initialItemAngle) * progress;
    smoothDispatch(transformItem(item.id, itemX, itemY, itemScale, itemAngle));
    if (runtime < duration) {
      requestAnimationFrame(draw);
    } else {
      isScrolling = false;
      allTransformEnd();
      store.dispatch(changeRouteFailure());
    }
  };
  isScrolling = true;
  requestAnimationFrame(function(timestamp) {
    starttime = timestamp;
    draw(timestamp);
  });
}

function replaceState(newState, isChangingRoute = false) {
  store.dispatch(changeRouteSuccess(newState, isChangingRoute));
  zoomToFitAll(0.2, false);
  loadVisibleImages();
  changeBackground();
}

function replaceItems(newItems) {
  smoothDispatch(loadItems(newItems));
}

function replaceItemProperties(itemOld, itemNew) {
  smoothDispatch(replaceItem(itemOld, itemNew), allTransformEnd);
}

function createItem(image, caption, body, options = {}) {
  let startingCenter = getVisiblePoint();
  let img = new Image();
  img.crossOrigin = "anonymous";
  const id = Date.now();
  img.onload = function() {
    let height = img.height;
    let width = img.width;
    let item = {
      id: id,
      src: img.src,
      caption: caption,
      body: body,
      angle: 0,
      x: startingCenter.x,
      y: startingCenter.y,
      width: width,
      height: height,
      scale: (0.25 * canvas.width) / state.canvas.scale / width,
      border: true,
      color: Record.getDominantColor(img)
    };
    smoothDispatch(addItem(item));
    props.onSaveRecord(state.canvas, item, image, options);
  };
  img.src =
    image instanceof File
      ? URL.createObjectURL(image)
      : Record.getFullSrc(image, id);
}

function getVisiblePoint() {
  return {
    x: (-state.canvas.x + canvas.width * 0.5) / state.canvas.scale,
    y: (-state.canvas.y + canvas.height * 0.5) / state.canvas.scale
  };
}

function updateItem(id, options) {
  smoothDispatch(updateItemCharacteristics(id, options));
}

function deleteItem(item) {
  smoothDispatch(removeItem(item));
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
  updateItem
};
