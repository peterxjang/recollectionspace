const Navbar = {
  props: null,
  $navbar: document.querySelector("nav"),
  $navbarHome: document.querySelector("#nav-home"),
  $navbarList: document.querySelector("#nav-list"),
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
    this.type = type;
    if (isOwner) {
      this.$navbarNew.style.display = "inline";
    } else {
      this.$navbarNew.style.display = "none";
    }
    if (modalId) {
      this.$navbarNew.style.display = "none";
      this.$navbarList.style.display = "none";
    } else {
      this.$navbarList.style.display = "inline";
    }
    let text = "";
    if (type === "root") {
      text = "follows";
    } else if (type === "follow") {
      text = "collections";
    } else if (type === "collection" || type === "record") {
      text = "records";
    }
    this.$navbarList.innerText = text;
  },
  bindEvents: function() {
    this.$navbarList.onclick = event => {
      event.preventDefault();
      this.props.onList();
    };
    this.$navbarNew.onclick = event => {
      event.preventDefault();
      this.props.onNew();
    };
    this.$navbarBack.onclick = event => {
      event.preventDefault();
      this.show(this.isOwner, this.type, null);
      this.props.onBack();
    };
  }
};

export default Navbar;
