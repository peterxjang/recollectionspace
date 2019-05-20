import Canvas from "./canvas-redux";
import Modal from "./components/modal";
import Router from "./router";

const Application = {
  initialize: function() {
    this.initializeCanvas();
    this.loadRouteData();
  },
  loadRouteData: function() {
    let apiUrl = null;
    Router.matchUrl("/", match => {
      apiUrl = "/api/follows";
    });
    Router.matchUrl("/:username", match => {
      apiUrl = "/api/users/" + match[0];
    });
    Router.matchUrl("/:username/:collection_name", match => {
      apiUrl = `/api/collections/search?username=${match[0]}&collection_name=${
        match[1]
      }`;
    });
    if (apiUrl) {
      this.loadCanvasData(apiUrl, 1, null);
    }
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
      isModalInfoVisible: () => Modal.visible
    });
  },
  loadCanvasData: function(url, delta, item) {
    // TODO: Slower due to url routing somehow???
    document.getElementById("loading").style.opacity = 1;
    Canvas.transitionRouteRequest();
    fetch(url, {
      headers: { Authorization: `Bearer ${localStorage.jwt}` }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(json => {
        document.getElementById("loading").style.opacity = 0;
        Canvas.transitionRouteSuccess(json, delta, item);
        if (json.clientUrl) {
          Router.setUrl(json.clientUrl);
        }
      })
      .catch(error => {
        document.getElementById("loading").style.opacity = 0;
        console.error(error);
        Canvas.transitionRouteFailure();
        if (error.status === 401) {
          Modal.showNewSession({
            onLogin: this.handleLogin.bind(this),
            onCancel: this.handleLoginCancel
          });
        }
      });
  },
  handleTransition: function(delta, item) {
    if (delta < 0) {
      return this.transitionOut(delta, item);
    } else if (item && item.type !== "record") {
      return this.transitionIn(delta, item);
    } else if (item) {
      Modal.showInfo({
        item: item,
        onEdit: this.handleEditRecord.bind(this),
        onDelete: this.handleConfirmDeleteRecord.bind(this)
      });
      return true;
    }
    return false;
  },
  transitionOut: function(delta, item) {
    if (item && item.type === "collection") {
      let apiUrl;
      Router.matchUrl("/:username/:collection_name", match => {
        apiUrl = `/api/users/${match[0]}`;
      });
      if (apiUrl) {
        this.loadCanvasData(apiUrl, delta, item);
        return true;
      } else {
        return false;
      }
    } else if (item && item.type === "follow") {
      this.loadCanvasData("/api/follows", delta, item);
      return true;
    } else if (item && item.type === "root") {
      Modal.showNewSession({
        onLogin: this.handleLogin.bind(this),
        onCancel: this.handleLoginCancel
      });
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
  handleLogin: function(email, password) {
    var params = new FormData();
    params.append("email", email);
    params.append("password", password);
    fetch("/api/sessions", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrer: "no-referrer",
      body: params
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        localStorage.setItem("jwt", data.jwt);
        this.loadCanvasData("/api/collections", 1, null);
      })
      .catch(error => console.error(error));
  },
  handleLoginCancel: function() {
    Canvas.zoomToFitAll();
  },
  handleMenu: function(state) {
    let newCaption = "";
    if (state.canvas.type === "collection") {
      newCaption = "New Record";
    } else if (state.canvas.type === "follow") {
      newCaption = "New Collection";
    } else if (state.canvas.type === "root") {
      newCaption = "New Follow";
    }
    Modal.showMenu({
      newCaption: newCaption,
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
  },
  handleNewRecord: function(state) {
    if (state.canvas.type === "collection") {
      Modal.showNewRecord({
        onSaveRecord: Canvas.createItem
      });
    } else if (state.canvas.type === "follow") {
      this.handleGetCollectionCategories(function(data) {
        Modal.showNewCollection({
          collectionCategories: data,
          onSaveCollection: Canvas.createItem
        });
      });
    } else if (state.canvas.type === "root") {
      Modal.showNewFollow({
        onSearchUsers: this.handleSearchUsers,
        onSaveFollow: Canvas.createItem
      });
    }
  },
  handleGetCollectionCategories: function(callback) {
    fetch("/api/collection_categories?public=true", {
      headers: { Authorization: `Bearer ${localStorage.jwt}` }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        callback(data);
      });
  },
  handleSearchUsers: function(searchText, callback) {
    fetch("/api/users?new=true&username=" + searchText, {
      headers: { Authorization: `Bearer ${localStorage.jwt}` }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        callback(data);
      });
  },
  handleSaveRecord: function(parent, item, image, options) {
    let url, params;
    if (parent.type === "collection") {
      url = "/api/records";
      params = new FormData();
      Object.keys(item).forEach(key => params.append(key, item[key]));
      params.append("collection_id", parent.id);
      params.append("name", item.caption);
      params.append("description", item.body);
      params.append("image", image);
    } else if (parent.type === "follow") {
      url = "/api/collections";
      params = new FormData();
      Object.keys(item).forEach(key => params.append(key, item[key]));
      params.append("collection_category_id", options.collection_category_id);
      params.append("image", image);
    } else if (parent.type === "root") {
      url = "/api/follows";
      params = new FormData();
      Object.keys(item).forEach(key => params.append(key, item[key]));
      params.append("following_id", options.following_id);
    } else {
      return;
    }
    fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      redirect: "follow",
      referrer: "no-referrer",
      body: params,
      headers: { Authorization: `Bearer ${localStorage.jwt}` }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
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
    Modal.showEdit({
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.jwt}`
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(params)
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
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
    } else if (item.type === "collection") {
      url = "/api/collections/" + item.id;
      params = {
        ...item
      };
    } else if (item.type === "follow") {
      url = "/api/follows/" + item.id;
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
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.jwt}`
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(params)
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .catch(error => console.error(error));
  },
  handleConfirmDeleteRecord: function(item) {
    Modal.showDelete({
      item,
      onDelete: this.handleDeleteRecord.bind(this)
    });
  },
  handleDeleteRecord: function(item) {
    let url, params;
    if (item.type === "record") {
      url = "/api/records/" + item.id;
    } else if (item.type === "collection") {
      url = "/api/collections/" + item.id;
    } else if (item.type === "follow") {
      url = "/api/follows/" + item.id;
    } else {
      return;
    }
    fetch(url, {
      method: "DELETE",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.jwt}`
      },
      redirect: "follow",
      referrer: "no-referrer",
      body: JSON.stringify(params)
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        Canvas.deleteItem(item);
      })
      .catch(error => console.error(error));
  },
  handleShowModalInfo: function(item) {
    Modal.showInfo({
      item: item,
      onEdit: this.handleEditRecord.bind(this),
      onDelete: this.handleConfirmDeleteRecord.bind(this)
    });
  },
  handleHideModalInfo: function() {
    // TODO: Zoom to fit if closing modal info from max zoom in...
    if (Modal.visible) {
      Modal.hide();
    }
  }
};

// Application.initialize();
export default Application.initialize();
