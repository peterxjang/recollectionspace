import Canvas from "./canvas-redux";
import ModalInfo from "./components/modal-info";
import ModalMenu from "./components/modal-menu";
import ModalNew from "./components/modal-new";
import ModalEdit from "./components/modal-edit";

const Application = {
  initialize: function() {
    this.initializeCanvas();
    this.loadCanvasData("/api/collections", 1, null);
    this.hideWebsiteTitle();
  },
  initializeCanvas: function() {
    Canvas.initialize(document.getElementById("canvas"), {
      onTransition: this.handleTransition.bind(this),
      onSave: this.handleSave.bind(this),
      onMenu: this.handleMenu.bind(this),
      onSaveRecord: this.handleSaveRecord.bind(this),
      onUpdateRecord: this.handleUpdateRecord.bind(this),
      onShowModalInfo: this.handleShowModalInfo.bind(this),
      onHideModalInfo: this.handleHideModalInfo.bind(this),
      isModalInfoVisible: () => ModalInfo.visible
    });
  },
  loadCanvasData: function(url, delta, item) {
    Canvas.transitionRouteRequest();
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        Canvas.transitionRouteSuccess(json, delta, item);
      })
      .catch(error => {
        Canvas.transitionRouteFailure();
      });
  },
  hideWebsiteTitle: function() {
    setTimeout(function() {
      document.querySelector("#title h1").style.color = "#333";
      document.querySelector("#title p").style.opacity = 0;
    }, 6000);
  },
  handleTransition: function(delta, item) {
    if (delta < 0) {
      return this.transitionOut(delta, item);
    } else if (item && item.type !== "record") {
      return this.transitionIn(delta, item);
    } else if (item) {
      ModalInfo.show({
        item: item,
        onEdit: this.handleEditRecord.bind(this),
        onDelete: this.handleDeleteRecord.bind(this)
      });
      return true;
    }
    return false;
  },
  transitionOut: function(delta, item) {
    if (item && item.type === "collection") {
      this.loadCanvasData("/api/collections", delta, item);
      return true;
    } else if (item && item.type === "follow") {
      console.log("transition out of follow...");
      this.loadCanvasData("/api/follows", delta, item);
      return true;
    }
    return false;
  },
  transitionIn: function(delta, item) {
    if (item.type === "collection") {
      this.loadCanvasData("/api/collections/" + item.id, delta, item);
      return true;
    } else if (item.type === "follow") {
      this.loadCanvasData("/api/follows/" + item.id, delta, item);
      return true;
    }
    return false;
  },
  handleMenu: function(state) {
    ModalMenu.show({
      onSaveLayout: this.handleSave.bind(null, state),
      onResetLayout: this.handleResetLayout,
      onNewRecord: this.handleNewRecord.bind(this, state)
    });
  },
  handleResetLayout: function() {
    localStorage.removeItem("state");
    location.reload();
  },
  handleSave: function(state) {
    console.clear();
    const minState = {
      selectedItem: -1,
      canvas: {
        id: state.canvas.id,
        x: Math.round(state.canvas.x * 10) / 10,
        y: Math.round(state.canvas.y * 10) / 10,
        angle: Math.round(state.canvas.angle * 1000) / 1000,
        scale: Math.round(state.canvas.scale * 100000) / 100000,
        color: state.canvas.color
        // viewportTransform: state.canvas.viewportTransform
      },
      items: state.items
        .map(function(item) {
          const newItem = {
            id: item.id,
            caption: item.caption,
            x: Math.round(item.x * 10) / 10,
            y: Math.round(item.y * 10) / 10,
            width: item.width,
            height: item.height,
            color: item.color,
            angle: Math.round(item.angle * 1000) / 1000,
            scale: Math.round(item.scale * 100000) / 100000,
            body: item.body,
            border: item.border
          };
          if (item.pinBack) {
            newItem.pinBack = item.pinBack;
          }
          if (item.src !== `${item.id}.jpg`) {
            newItem.src = item.src;
          }
          return newItem;
        })
        .sort((a, b) => a.id - b.id)
    };
    const stateString = JSON.stringify(minState, null, 2);
    localStorage.setItem("state", stateString);
    console.log(stateString);
  },
  handleNewRecord: function(state) {
    ModalNew.show({
      onSaveRecord: Canvas.createItem
    });
  },
  handleSaveRecord: function(parent, item, image) {
    let url, params;
    if (parent.type === "collection") {
      url = "/api/records";
      params = new FormData();
      Object.keys(item).forEach(key => params.append(key, item[key]));
      params.append("collection_id", parent.id);
      params.append("name", item.caption);
      params.append("description", item.body);
      params.append("image", image);
    } else {
      return;
    }
    fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrer: "no-referrer",
      body: params
    })
      .then(response => response.json())
      .then(data => {
        const itemNew = {
          ...item,
          id: data.id,
          src: data.src,
          caption: data.name,
          body: data.description,
          type: data.type
        };
        Canvas.replaceItemProperties(item, itemNew);
        URL.revokeObjectURL(item.src);
      })
      .catch(error => console.error(error));
  },
  handleEditRecord: function(item) {
    ModalEdit.show({
      item: item,
      onEditRecord: this.handleUpdateRecordText.bind(this)
    });
  },
  handleUpdateRecordText: function(id, type, caption, body) {
    let url, params;
    if (type === "record") {
      url = "/api/records/" + id;
      params = {
        name: caption,
        description: body
      };
    } else {
      return;
    }
    fetch(url, {
      method: "PATCH",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(params)
    })
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data));
        Canvas.updateItem(id, { caption, body });
      })
      .catch(error => console.error(error));
  },
  handleUpdateRecord: function(item) {
    let url, params;
    if (item.type === "record") {
      url = "/api/records/" + item.id;
      params = {
        ...item,
        name: item.caption,
        description: item.body
      };
    } else {
      return;
    }
    fetch(url, {
      method: "PATCH",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(params)
    })
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data));
      })
      .catch(error => console.error(error));
  },
  handleDeleteRecord: function(item) {
    let url, params;
    if (item.type === "record") {
      url = "/api/records/" + item.id;
    } else {
      return;
    }
    fetch(url, {
      method: "DELETE",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json"
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(params)
    })
      .then(response => response.json())
      .then(data => {
        console.log(JSON.stringify(data));
        Canvas.deleteItem(item);
      })
      .catch(error => console.error(error));
  },
  handleShowModalInfo: function(item) {
    ModalInfo.show({
      item: item,
      onEdit: this.handleEditRecord.bind(this),
      onDelete: this.handleDeleteRecord.bind(this)
    });
  },
  handleHideModalInfo: function() {
    if (ModalInfo.visible) {
      ModalInfo.hide();
    }
  }
};

// Application.initialize();
export default Application.initialize();
