import { createStore } from "redux";
import rootReducer from "./reducers";
import {
  addItem,
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
  changeRoute,
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

let pressTimer;
var clickTimer = null;

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

function smoothDispatch(action) {
  window.requestAnimationFrame(function() {
    store.dispatch(action);
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

function checkTransition(delta) {
  const totalVisibleWidth = state.items.reduce(
    (sum, item) => sum + item.width * item.scale * state.canvas.scale,
    0
  );
  if (delta < 0 && totalVisibleWidth < 10) {
    return props.onTransition(-1, state.parent);
  } else if (delta > 0) {
    var item;
    for (var i = 0; i < state.items.length; i++) {
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
      var xDelta = item.x - draggingItem.x;
      var yDelta = item.y - draggingItem.y;
      var diag = Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2));
      var angleItem = Math.atan2(yDelta, xDelta);
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
  for (var i = state.items.length - 1; i >= 0; i--) {
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
  for (var i = state.items.length - 1; i >= 0; i--) {
    const item = state.items[i];
    const itemType = Record.isPointInRecord({
      ...item,
      inputX: lastInputX,
      inputY: lastInputY,
      canvasScale: state.canvas.scale,
      skipCheckHandle: true
    });
    if (itemType === "record") {
      if (!item.pinBack) {
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
    animateScaleCanvas(canvasScale, canvasX, canvasY);
  } else {
    smoothDispatch(scaleCanvas(canvasScale, canvasX, canvasY));
  }
}

function animateScaleCanvas(finalCanvasScale, finalCanvasX, finalCanvasY) {
  var initialCanvasScale = state.canvas.scale;
  var initialCanvasX = state.canvas.x;
  var initialCanvasY = state.canvas.y;
  var starttime;
  var duration = 300;
  var draw = function(timestamp) {
    var runtime = timestamp - starttime;
    var progress = runtime / duration;
    progress = Math.min(progress, 1);
    var canvasScale =
      initialCanvasScale + (finalCanvasScale - initialCanvasScale) * progress;
    var canvasX = initialCanvasX + (finalCanvasX - initialCanvasX) * progress;
    var canvasY = initialCanvasY + (finalCanvasY - initialCanvasY) * progress;
    smoothDispatch(scaleCanvas(canvasScale, canvasX, canvasY));
    if (runtime < duration) {
      requestAnimationFrame(draw);
    } else {
      isScrolling = false;
      allTransformEnd();
    }
  };
  isScrolling = true;
  requestAnimationFrame(function(timestamp) {
    starttime = timestamp;
    draw(timestamp);
  });
}

function zoomToFitAll(padding = 0.1, animate = true) {
  var xPoints = [];
  var yPoints = [];
  state.items.forEach(item => {
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
  if (!wheeling) {
    scaleCanvasMoveInitial();
  }
  clearTimeout(wheeling);
  wheeling = setTimeout(() => {
    wheeling = undefined;
    scaleCanvasMoveFinal();
  }, 250);
  var delta = evt.wheelDelta
    ? -evt.wheelDelta / 40
    : evt.detail
      ? evt.detail
      : 0;
  if (delta) {
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
    console.log("canvas not supported");
  }
  return store;
}

function transitionRoute(newState) {
  store.dispatch(changeRoute(newState));
  zoomToFitAll(0.2, false);
  loadVisibleImages();
}

function replaceItems(newItems) {
  smoothDispatch(loadItems(newItems));
}

function createItem(image, caption, body) {
  var startingCenter = getVisiblePoint();
  var img = new Image();
  img.crossOrigin = "anonymous";
  var id = Date.now();
  img.onload = function() {
    var height = img.height;
    var width = img.width;
    var item = {
      id: id,
      src: image,
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
  };
  img.src = Record.getFullSrc(image, id);
}

function getVisiblePoint() {
  // Change to world position https://stackoverflow.com/questions/34597160/html-canvas-mouse-position-after-scale-and-translate
  var xcoords = state.items.map(item => item.x);
  var ycoords = state.items.map(item => item.y);
  var xmin = Math.min(...xcoords);
  var xmax = Math.max(...xcoords);
  var ymin = Math.min(...ycoords);
  var ymax = Math.max(...ycoords);
  return {
    x: xmin + (xmax - xmin) / 2,
    y: ymin + (ymax - ymin) / 2
  };
}

function updateItem(id, options) {
  smoothDispatch(updateItemCharacteristics(id, options));
}

function deleteItem(id) {
  smoothDispatch(removeItem(id));
}

export default {
  initialize,
  transitionRoute,
  replaceItems,
  createItem,
  deleteItem,
  updateItem
};
