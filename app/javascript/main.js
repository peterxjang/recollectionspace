import Canvas from "./components/canvas-redux";
import Modal from "./components/modal";
import Navbar from "./components/navbar";
import RecordContent from "./components/record-content";
import Router from "./router";

const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

const Application = {
  initialize: function() {
    this.initializeCanvas();
    Modal.onClose = this.handleHideModal.bind(this);
    Navbar.initialize({
      onNew: this.handleNavbarNew.bind(this),
      onBack: this.handleNavbarBack.bind(this)
    });
    this.loadRouteData();
  },
  handleNavbarNew: function() {
    if (RecordContent.visible) {
      this.handleNavbarBack();
    } else {
      Canvas.onNewRecord();
    }
  },
  handleNavbarBack: function() {
    RecordContent.hide({
      onHide: this.handleRecordContentHide.bind(this)
    });
  },
  handleRecordContentHide: function() {
    Canvas.zoomOut();
    Router.matchUrl("/:username/:collection_name/:id", params => {
      Router.setUrl(`/${params.username}/${params.collection_name}`);
    });
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
      apiUrl = `/api/user_collections/search?username=${
        params.username
      }&collection_name=${params.collection_name}`;
    });
    Router.matchUrl("/:username/:collection_name/:id", params => {
      apiUrl = `/api/user_collections/search?username=${
        params.username
      }&collection_name=${params.collection_name}`;
      modalId = params.id;
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
      onHideModalInfo: this.handleHideModal.bind(this),
      onShowModalEdit: this.handleEditRecord.bind(this),
      onShowModalDestroy: this.handleConfirmDeleteRecord.bind(this),
      isModalInfoVisible: () => Modal.visible
    });
  },
  loadCanvasData: function(url, delta, item, modalId) {
    document.getElementById("loading").style.opacity = 1;
    Canvas.transitionRouteRequest();
    fetch(url, {
      headers: { "X-CSRF-Token": csrfToken }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(json => {
        document.getElementById("loading").style.opacity = 0;
        const modalItem = modalId
          ? json.items.filter(child => child.id === modalId)[0]
          : null;
        Canvas.transitionRouteSuccess(json, delta, item, modalItem);
        Navbar.show(json.isOwner, json.canvas.type, modalId);
        if (modalId) {
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
          if (url === "/api/follows") {
            window.location.href = "/";
          } else {
            this.handleShowLogin(false);
          }
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
      this.handleShowLogin(false);
    }
    return false;
  },
  transitionIn: function(delta, item) {
    if (item.type === "collection") {
      this.loadCanvasData("/api/user_collections/" + item.id, delta, item);
      return true;
    } else if (item.type === "follow") {
      this.loadCanvasData("/api/follows/" + item.id, delta, item);
      return true;
    }
    return false;
  },
  handleShowSignup: function() {
    Modal.hide();
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
      body: params,
      headers: { "X-CSRF-Token": csrfToken }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        this.handleLogin(email, password);
        Modal.hide();
      })
      .catch(error => {
        error.json().then(data => Modal.setErrors(data.errors));
      });
  },
  handleShowLogin: function(userClick = true) {
    if (userClick) {
      Modal.hide();
    }
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
      body: params,
      headers: { "X-CSRF-Token": csrfToken }
    })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(data => {
        this.loadRouteData();
        Modal.hide();
      })
      .catch(error => {
        Modal.setErrors(["Invalid email or password"]);
      });
  },
  handleLoginCancel: function() {
    Canvas.zoomToFitAll();
    Modal.hide();
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
      } else if (url.endsWith("music")) {
        searchFunction = this.handleSearchMusic.bind(this);
      }
      Modal.showNewRecord({
        onSaveRecord: Canvas.createItem,
        onSearch: searchFunction,
        onCancel: Modal.hide.bind(Modal)
      });
    } else if (state.canvas.type === "follow") {
      Modal.showNewUserCollection({
        onSaveUserCollection: Canvas.createItem,
        onSearch: this.handleGetCollections.bind(this),
        onCancel: Modal.hide.bind(Modal)
      });
    } else if (state.canvas.type === "root") {
      Modal.showNewFollow({
        onSearchUsers: this.handleSearchUsers,
        onSaveFollow: Canvas.createItem,
        onCancel: Modal.hide.bind(Modal)
      });
    }
  },
  handleGetCollections: function(searchText, callback) {
    fetch("/api/collections?name=" + searchText, {
      headers: { "X-CSRF-Token": csrfToken }
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
      headers: { "X-CSRF-Token": csrfToken }
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
  handleSearchMusic: function(searchText, callback) {
    fetch("/api/music?q=" + searchText)
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
    params = new FormData();
    Object.keys(item).forEach(key => {
      if (item[key] || item[key] === 0) {
        params.append(key, item[key]);
      }
    });
    if (parent.type === "collection") {
      url = "/api/user_records";
      params.append("user_collection_id", parent.id);
      params.append("name", item.caption);
      params.append("description", item.body);
      if (options.api_id) {
        params.append("api_id", options.api_id);
      }
      if (image) {
        params.append("image", image);
      }
    } else if (parent.type === "follow") {
      url = "/api/user_collections";
      if (options.collection_id) {
        params.append("collection_id", options.collection_id);
      }
      if (image) {
        params.append("image", image);
      }
    } else if (parent.type === "root") {
      url = "/api/follows";
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
      headers: { "X-CSRF-Token": csrfToken }
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
          width: data.width,
          height: data.height,
          scale: data.scale,
          caption: data.name,
          body: data.description,
          type: data.type
        };
        Canvas.replaceItemProperties(item, itemNew);
        URL.revokeObjectURL(item.src);
        Modal.hide();
      })
      .catch(error => {
        Canvas.deleteItem(item);
        error.json().then(data => Modal.setErrors(data.errors));
      });
  },
  handleEditRecord: function(item) {
    let fullEditLink;
    Router.matchUrl("/:username/:collection_name/:id", params => {
      fullEditLink = `/${params.username}/${params.collection_name}/${
        params.id
      }/edit`;
    });
    Router.matchUrl("/:username/:collection_name", params => {
      fullEditLink = `/${params.username}/${params.collection_name}/${
        item.id
      }/edit`;
    });
    if (fullEditLink) {
      window.location.href = fullEditLink;
    }
  },
  handleUpdateRecord: function(item) {
    let url, params;
    if (item.type === "record") {
      url = "/api/user_records/" + item.id;
      params = {
        ...item,
        name: item.caption
      };
    } else if (item.type === "collection") {
      url = "/api/user_collections/" + item.id;
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
        "X-CSRF-Token": csrfToken
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
      .catch(error => {
        console.error(error);
      });
  },
  handleConfirmDeleteRecord: function(item) {
    Modal.hide();
    Modal.showDelete({
      item: item,
      onDelete: this.handleDeleteRecord.bind(this),
      onCancel: Modal.hide.bind(Modal)
    });
  },
  handleDeleteRecord: function(item) {
    let url, params;
    if (item.type === "record") {
      url = "/api/user_records/" + item.id;
    } else if (item.type === "collection") {
      url = "/api/user_collections/" + item.id;
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
        "X-CSRF-Token": csrfToken
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
        Modal.hide();
      })
      .catch(error => {
        error.json().then(data => Modal.setErrors(data.errors));
      });
  },
  handleShowModalInfo: function(item, isOwner) {
    if (item.type === "record") {
      RecordContent.show(item);
    } else {
      Modal.showInfo({
        item: item,
        onEdit: this.handleEditRecord.bind(this),
        onDelete: this.handleConfirmDeleteRecord.bind(this),
        isOwner: isOwner
      });
    }
    Router.matchUrl("/:username/:collection_name", params => {
      Router.setUrl(`/${params.username}/${params.collection_name}/${item.id}`);
    });
    Navbar.show(isOwner, "record", item.id);
  },
  handleHideModal: function() {
    if (Modal.visible) {
      Modal.hide();
      Router.matchUrl("/:username/:collection_name/:id", params => {
        Router.setUrl(`/${params.username}/${params.collection_name}`);
        Canvas.zoomToFitAll();
      });
      Router.matchUrl("/", params => {
        Canvas.zoomToFitAll();
      });
    }
  }
};

// Application.initialize();
export default Application.initialize();
