const ModalList = {
  props: null,
  $modal: document.getElementById("modal-list"),
  $links: document.getElementById("modal-list-links"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.visible = false;
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.$links.innerHTML = `<ul>${this.props.items
      .map(item => `<li><a href="${item.href}">${item.caption}</a></li>`)
      .join("")}</ul>`;
    this.visible = true;
    console.log("modal list show", this.props);
  },
  bindEvents: function() {}
};

export default ModalList.initialize();
