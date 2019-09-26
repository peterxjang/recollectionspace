const Navbar = {
  props: null,
  $navbar: document.querySelector("nav"),
  $navbarHome: document.querySelector("#nav-home"),
  $navbarNew: document.querySelector("#nav-new"),
  $navbarBack: document.querySelector("#nav-back"),
  initialize: function(props) {
    this.props = props;
    this.isOwner = false;
    this.bindEvents();
    return this;
  },
  show: function(isOwner, type, modalId) {
    this.isOwner = isOwner;
    if (isOwner) {
      this.$navbarNew.style.display = "inline";
      let text = "new";
      if (type === "root") {
        text = "new follow";
      } else if (type === "follow") {
        text = "new collection";
      } else if (type === "collection") {
        text = "new record";
      }
      this.$navbarNew.innerText = text;
    } else {
      this.$navbarNew.style.display = "none";
    }
    if (modalId) {
      this.$navbarNew.style.display = "none";
    }
  },
  bindEvents: function() {
    this.$navbarNew.onclick = event => {
      event.preventDefault();
      this.props.onNew();
    };
    this.$navbarBack.onclick = event => {
      event.preventDefault();
      this.show(this.isOwner, "collection", null);
      this.props.onBack();
    };
  }
};

export default Navbar;
