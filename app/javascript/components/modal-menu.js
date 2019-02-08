const ModalMenu = {
  props: null,
  $modal: document.getElementById("modal-menu"),
  $buttonSave: document.querySelector("#modal-menu-save"),
  $buttonReset: document.querySelector("#modal-menu-reset"),
  $buttonClose: document.querySelector("#modal-menu-close"),
  $buttonNew: document.querySelector("#modal-menu-new"),
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
    this.visible = true;
  },
  bindEvents: function() {
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.hide();
    };
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
