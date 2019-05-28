import { combineReducers } from "redux";
import {
  SELECT_ITEM,
  ADD_ITEM,
  REPLACE_ITEM,
  REMOVE_ITEM,
  TRANSLATE_ITEM,
  TRANSLATE_ITEM_GROUP,
  SCALE_ITEM,
  TRANSFORM_ITEM,
  TRANSFORM_ITEM_GROUP,
  TRANSLATE_CANVAS,
  SCALE_CANVAS,
  UPDATE_ITEM_CHARACTERISTICS,
  LOAD_ITEMS,
  CHANGE_ROUTE_REQUEST,
  CHANGE_ROUTE_FAILURE,
  CHANGE_ROUTE_SUCCESS
} from "./actions";

const initialState = {
  canvas: {
    x: 0,
    y: 0,
    scale: 1,
    src: "root.jpg"
  },
  items: [],
  selectedItem: -1,
  loadingItems: false,
  isChangingRoute: false,
  isOwner: false
};

function canvas(state = initialState.canvas, action) {
  switch (action.type) {
    case TRANSLATE_CANVAS:
      return {
        ...state,
        x: state.x + action.x * state.scale,
        y: state.y + action.y * state.scale
      };
    case SCALE_CANVAS:
      return {
        ...state,
        x: action.x,
        y: action.y,
        scale: action.scale
      };
    default:
      return state;
  }
}

function selectedItem(state = initialState.selectedItem, action) {
  switch (action.type) {
    case SELECT_ITEM:
      return action.id;
    default:
      return state;
  }
}

function items(state = initialState.items, action) {
  switch (action.type) {
    case ADD_ITEM:
      return [...state, action.item];
    case REPLACE_ITEM:
      return state.map(item => {
        if (item.id === action.itemOld.id) {
          return action.itemNew;
        }
        return item;
      });
    case REMOVE_ITEM:
      return state.filter(item => item.id !== action.item.id);
    case TRANSLATE_ITEM:
      return state.map(item => {
        if (item.id === action.id) {
          return {
            ...item,
            x: action.x,
            y: action.y
          };
        } else {
          return item;
        }
      });
    case TRANSLATE_ITEM_GROUP:
      return state.map(item => {
        for (var i = 0; i < action.transforms.length; i++) {
          if (item.id === action.transforms[i].id) {
            return {
              ...item,
              x: action.transforms[i].x,
              y: action.transforms[i].y
            };
          }
        }
        return item;
      });
    case SCALE_ITEM:
      return state.map(item => {
        if (item.id === action.id) {
          return {
            ...item,
            scale: action.scale
          };
        } else {
          return item;
        }
      });
    case TRANSFORM_ITEM:
      return state.map(item => {
        if (item.id === action.id) {
          return {
            ...item,
            x: action.x,
            y: action.y,
            scale: action.scale,
            angle: action.angle
          };
        } else {
          return item;
        }
      });
    case TRANSFORM_ITEM_GROUP:
      return state.map(item => {
        for (var i = 0; i < action.transforms.length; i++) {
          if (item.id === action.transforms[i].id) {
            return {
              ...item,
              x: action.transforms[i].x,
              y: action.transforms[i].y,
              scale: action.transforms[i].scale,
              angle: action.transforms[i].angle
            };
          }
        }
        return item;
      });
    case UPDATE_ITEM_CHARACTERISTICS:
      return state.map(item => {
        if (item.id === action.id) {
          return { ...item, ...action.options };
        } else {
          return item;
        }
      });
    case SELECT_ITEM:
      var otherItems = state.filter(item => item.id !== action.id);
      var item = state.filter(item => item.id === action.id);
      return action.pinBack ? item.concat(otherItems) : otherItems.concat(item);
    default:
      return state;
  }
}

function parent(state = null, action) {
  return state;
}

function loadingItems(state = initialState.loadingItems, action) {
  return state;
}

function isChangingRoute(state = initialState.isChangingRoute, action) {
  return state;
}

function isOwner(state = initialState.isOwner, action) {
  return state;
}

const appReducer = combineReducers({
  canvas,
  selectedItem,
  loadingItems,
  isChangingRoute,
  isOwner,
  items,
  parent
});

const rootReducer = (state, action) => {
  if (action.type === CHANGE_ROUTE_REQUEST) {
    state = {
      ...state,
      isChangingRoute: true
    };
  } else if (action.type === CHANGE_ROUTE_FAILURE) {
    state = {
      ...state,
      isChangingRoute: false
    };
  } else if (action.type === CHANGE_ROUTE_SUCCESS) {
    state = {
      ...state,
      canvas: action.canvas,
      items: action.items,
      isChangingRoute: action.isChangingRoute,
      isOwner: action.isOwner
    };
  } else if (action.type === LOAD_ITEMS) {
    state = {
      ...state,
      items: action.items,
      loadingItems: false
    };
  }
  return appReducer(state, action);
};

export default rootReducer;
