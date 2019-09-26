const ModalList = {
  props: null,
  $modal: document.getElementById("modal-list"),
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
    this.visible = true;
  },
  bindEvents: function() {}
};

export default ModalList.initialize();
