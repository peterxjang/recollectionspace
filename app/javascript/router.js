const Router = {
  mode: "history",
  root: "/",
  initialize: function() {
    this.mode = !!history.pushState ? "history" : "hash";
    return this;
  },
  getUrl: function() {
    var fragment = "";
    if (this.mode === "history") {
      fragment = this.clearSlashes(
        decodeURI(location.pathname + location.search)
      );
      fragment = fragment.replace(/\?(.*)$/, "");
      fragment = this.root !== "/" ? fragment.replace(this.root, "") : fragment;
    } else {
      var match = window.location.href.match(/#(.*)$/);
      fragment = match ? match[1] : "";
    }
    return this.clearSlashes(fragment);
  },
  setUrl: function(url) {
    if (this.mode === "history") {
      history.pushState(null, null, this.root + this.clearSlashes(url));
    } else {
      window.location.href =
        window.location.href.replace(/#(.*)$/, "") + "#" + url;
    }
  },
  matchUrl: function(url, callback) {
    if (url.charAt(0) === "/") {
      url = url.substr(1);
    }
    var routeMatcher = new RegExp(
      "^" + url.replace(/:[^\s/]+/g, "([\\w-]+)") + "$"
    );
    var values = this.getUrl().match(routeMatcher);
    if (values) {
      values.shift();
      const keys = url.match(/:[^\s/]+/g);
      const params = {};
      for (var i = 0; i < keys.length; i++) {
        params[keys[i].substr(1)] = values[i];
      }
      callback(params);
    }
  },
  clearSlashes: function(path) {
    return path
      .toString()
      .replace(/\/$/, "")
      .replace(/^\//, "");
  }
};

export default Router.initialize();
