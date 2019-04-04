export const ADD_ITEM = "ADD_ITEM";
export const REPLACE_ITEM = "REPLACE_ITEM";
export const REMOVE_ITEM = "REMOVE_ITEM";
export const SELECT_ITEM = "SELECT_ITEM";
export const TRANSLATE_ITEM = "TRANSLATE_ITEM";
export const TRANSLATE_ITEM_GROUP = "TRANSLATE_ITEM_GROUP";
export const SCALE_ITEM = "SCALE_ITEM";
export const TRANSFORM_ITEM = "TRANSFORM_ITEM";
export const TRANSFORM_ITEM_GROUP = "TRANSFORM_ITEM_GROUP";
export const TRANSLATE_CANVAS = "TRANSLATE_CANVAS";
export const SCALE_CANVAS = "SCALE_CANVAS";
export const RESIZE_ITEM = "RESIZE_ITEM";
export const ROTATE_ITEM = "ROTATE_ITEM";
export const UPDATE_ITEM_CHARACTERISTICS = "UPDATE_ITEM_CHARACTERISTICS";
export const LOAD_ITEMS = "LOAD_ITEMS";
export const CHANGE_ROUTE_REQUEST = "CHANGE_ROUTE_REQUEST";
export const CHANGE_ROUTE_FAILURE = "CHANGE_ROUTE_FAILURE";
export const CHANGE_ROUTE_SUCCESS = "CHANGE_ROUTE_SUCCESS";
export const REFRESH_CANVAS = "REFRESH_CANVAS";

export function addItem(item) {
  return { type: ADD_ITEM, item: item };
}

export function replaceItem(itemOld, itemNew) {
  return { type: REPLACE_ITEM, itemOld: itemOld, itemNew: itemNew };
}

export function removeItem(item) {
  return { type: REMOVE_ITEM, item: item };
}

export function selectItem(id, pinBack) {
  return { type: SELECT_ITEM, id: id, pinBack: pinBack };
}

export function translateItem(id, x, y) {
  return { type: TRANSLATE_ITEM, id: id, x: x, y: y };
}

export function translateItemGroup(transforms) {
  return { type: TRANSLATE_ITEM_GROUP, transforms: transforms };
}

export function scaleItem(id, scale) {
  return { type: SCALE_ITEM, id: id, scale: scale };
}

export function transformItem(id, x, y, scale, angle) {
  return {
    type: TRANSFORM_ITEM,
    id: id,
    x: x,
    y: y,
    scale: scale,
    angle: angle
  };
}

export function transformItemGroup(transforms) {
  return { type: TRANSFORM_ITEM_GROUP, transforms: transforms };
}

export function updateItemCharacteristics(id, options) {
  return { type: UPDATE_ITEM_CHARACTERISTICS, id: id, options: options };
}

export function loadItems(items) {
  return { type: LOAD_ITEMS, items: items };
}

export function translateCanvas(x, y) {
  return { type: TRANSLATE_CANVAS, x: x, y: y };
}

export function scaleCanvas(scale, x, y) {
  return { type: SCALE_CANVAS, scale: scale, x: x, y: y };
}

export function changeRouteRequest() {
  return { type: CHANGE_ROUTE_REQUEST };
}

export function changeRouteFailure() {
  return { type: CHANGE_ROUTE_FAILURE };
}

export function changeRouteSuccess(state, isChangingRoute) {
  return {
    type: CHANGE_ROUTE_SUCCESS,
    canvas: state.canvas,
    items: state.items,
    isChangingRoute: isChangingRoute
  };
}

export function refreshCanvas() {
  return { type: REFRESH_CANVAS };
}
