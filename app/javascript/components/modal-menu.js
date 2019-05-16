const ModalMenu = {
  props: null,
  $modal: document.getElementById("modal-menu"),
  $buttonSave: document.querySelector("#modal-menu .save"),
  $buttonReset: document.querySelector("#modal-menu .reset"),
  $buttonNew: document.querySelector("#modal-menu .new"),
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
  bindEvents: function() {
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      this.props.onSaveLayout();
      this.hide();
    };
    this.$buttonReset.onclick = event => {
      event.preventDefault();
      this.props.onResetLayout();
      this.hide();
    };
    this.$buttonNew.onclick = event => {
      event.preventDefault();
      this.props.onNewRecord();
      this.hide();
    };
  }
};

export default ModalMenu.initialize();
