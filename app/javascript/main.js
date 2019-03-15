import Canvas from "./canvas-redux";
import ModalInfo from "./components/modal-info";
import ModalMenu from "./components/modal-menu";
import ModalNew from "./components/modal-new";
import ModalEdit from "./components/modal-edit";

const Application = {
  initialize: function() {
    this.initializeCanvas();
    this.loadCanvasData("/api/collections");
    this.hideWebsiteTitle();
  },
  initializeCanvas: function() {
    Canvas.initialize(document.getElementById("canvas"), {
      onTransition: this.handleTransition.bind(this),
      onSave: this.handleSave.bind(this),
      onMenu: this.handleMenu.bind(this),
      onShowModalInfo: this.handleShowModalInfo.bind(this),
      onHideModalInfo: this.handleHideModalInfo.bind(this),
      isModalInfoVisible: () => ModalInfo.visible
    });
  },
  loadCanvasData: function(url) {
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        Canvas.transitionRoute(json);
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
      if (item && item.type === "collection") {
        this.loadCanvasData("/api/collections");
        return true;
      }
      return true;
    } else if (item && item.type === "collection") {
      this.loadCanvasData("/api/collections/" + item.id);
      return true;
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
  handleMenu: function(state) {
    ModalMenu.show({
      onSaveLayout: this.handleSave.bind(null, state),
      onResetLayout: this.handleResetLayout,
      onNewRecord: this.handleNewRecord.bind(this)
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
  handleNewRecord: function() {
    ModalNew.show({
      onSaveRecord: this.handleSaveRecord
    });
  },
  handleSaveRecord: function(image, caption, body) {
    Canvas.createItem(image, caption, body);
  },
  handleEditRecord: function(item) {
    ModalEdit.show({
      item: item,
      onEditRecord: this.handleUpdateRecord.bind(this)
    });
  },
  handleUpdateRecord: function(id, caption, body) {
    Canvas.updateItem(id, { caption, body });
  },
  handleDeleteRecord: function(id) {
    Canvas.deleteItem(id);
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
