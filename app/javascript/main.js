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
    let modalId = null;
    Router.matchUrl("/", params => {
      apiUrl = "/api/follows";
    });
    Router.matchUrl("/:username", params => {
      apiUrl = "/api/users/" + params.username;
    });
    Router.matchUrl("/:username/:collection_name", params => {
      apiUrl = `/api/collections/search?username=${
        params.username
      }&collection_name=${params.collection_name}`;
    });
    Router.matchUrl("/:username/:collection_name/:id", params => {
      apiUrl = `/api/collections/search?username=${
        params.username
      }&collection_name=${params.collection_name}`;
      modalId = parseInt(params.id);
    });
    if (apiUrl) {
      this.loadCanvasData(apiUrl, 1, null, modalId);
    }
  },
  initializeCanvas: function() {
    Canvas.initialize(document.getElementById("canvas"), {
      onTransition: this.handleTransition.bind(this),
      onNewRecord: this.handleNewRecord.bind(this),
      onSaveRecord: this.handleSaveRecord.bind(this),
      onUpdateRecord: this.handleUpdateRecord.bind(this),
      onShowModalInfo: this.handleShowModalInfo.bind(this),
      onHideModalInfo: this.handleHideModalInfo.bind(this),
      isModalInfoVisible: () => Modal.visible
    });
  },
  loadCanvasData: function(url, delta, item, modalId) {
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
        if (modalId) {
          const modalItem = json.items.filter(child => child.id === modalId)[0];
          if (modalItem) {
            this.handleShowModalInfo(modalItem, json.isOwner);
          }
        } else if (json.clientUrl) {
          Router.setUrl(json.clientUrl);
        }
      })
      .catch(error => {
        document.getElementById("loading").style.opacity = 0;
        console.error(error);
        Canvas.transitionRouteFailure();
        if (error.status === 401) {
          this.handleShowLogin();
        }
      });
  },
  handleTransition: function(delta, item, isOwner) {
    if (delta < 0) {
      return this.transitionOut(delta, item);
    } else if (item && item.type !== "record") {
      return this.transitionIn(delta, item);
    } else if (item) {
      this.handleShowModalInfo(item, isOwner);
      return true;
    }
    return false;
  },
  transitionOut: function(delta, item) {
    if (item && item.type === "collection") {
      let apiUrl;
      Router.matchUrl("/:username/:collection_name", params => {
        apiUrl = `/api/users/${params.username}`;
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
      this.handleShowLogin();
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
  handleShowSignup: function() {
    Modal.showNewUser({
      onSignup: this.handleSignup.bind(this),
      onShowLogin: this.handleShowLogin.bind(this),
      onCancel: this.handleLoginCancel
    });
  },
  handleSignup: function(email, username, password, passwordConfirmation) {
    var params = new FormData();
    params.append("email", email);
    params.append("username", username);
    params.append("password", password);
    params.append("password_confirmation", passwordConfirmation);
    fetch("/api/users", {
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
        this.handleLogin(email, password);
      })
      .catch(error => console.error(error));
  },
  handleShowLogin: function() {
    Modal.showNewSession({
      onLogin: this.handleLogin.bind(this),
      onShowSignup: this.handleShowSignup.bind(this),
      onCancel: this.handleLoginCancel
    });
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
        this.loadRouteData();
      })
      .catch(error => console.error(error));
  },
  handleLoginCancel: function() {
    Canvas.zoomToFitAll();
  },
  handleNewRecord: function(state) {
    if (state.canvas.type === "collection") {
      // TODO: set onSearch to depend on type of collection
      const url = Router.getUrl();
      let searchFunction;
      if (url.endsWith("movies")) {
        searchFunction = this.handleSearchMovies.bind(this);
      } else if (url.endsWith("books")) {
        searchFunction = this.handleSearchBooks.bind(this);
      }
      Modal.showNewRecord({
        onSaveRecord: Canvas.createItem,
        onSearch: searchFunction
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
  handleSearchBooks: function(searchText, callback) {
    fetch("/api/books?q=" + searchText)
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
  handleSearchMovies: function(searchText, callback) {
    fetch("/api/movies?q=" + searchText)
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
      .catch(error => {
        console.error(error);
        Canvas.deleteItem(item);
      });
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
        Router.matchUrl("/:username/:collection_name/:id", params => {
          Router.setUrl(`/${params.username}/${params.collection_name}`);
        });
      })
      .catch(error => console.error(error));
  },
  handleShowModalInfo: function(item, isOwner) {
    Modal.showInfo({
      item: item,
      onEdit: this.handleEditRecord.bind(this),
      onDelete: this.handleConfirmDeleteRecord.bind(this),
      isOwner: isOwner
    });
    Router.matchUrl("/:username/:collection_name", params => {
      Router.setUrl(`/${params.username}/${params.collection_name}/${item.id}`);
    });
  },
  handleHideModalInfo: function() {
    // TODO: Zoom to fit if closing modal info from max zoom in...
    if (Modal.visible) {
      Modal.hide();
      Router.matchUrl("/:username/:collection_name/:id", params => {
        Router.setUrl(`/${params.username}/${params.collection_name}`);
      });
    }
  }
};

// Application.initialize();
export default Application.initialize();
