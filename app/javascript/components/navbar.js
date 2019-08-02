const Navbar = {
  props: null,
  $navbar: document.querySelector("nav"),
  $navbarHome: document.querySelector("#nav-home"),
  $navbarNew: document.querySelector("#nav-new"),
  $navbarBack: document.querySelector("#nav-back"),
  initialize: function(props) {
    this.props = props;
    this.bindEvents();
    return this;
  },
  bindEvents: function() {
    this.$navbarNew.onclick = event => {
      event.preventDefault();
      this.props.onNew();
    };
    this.$navbarBack.onclick = event => {
      event.preventDefault();
      this.props.onBack();
    };
  }
};

export default Navbar;
