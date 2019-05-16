const ModalDelete = {
  props: null,
  $modal: document.getElementById("modal-delete"),
  $buttonSave: document.getElementById("modal-delete-save"),
  $buttonCancel: document.getElementById("modal-delete-cancel"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.visible = false;
    if (this.props) {
      this.props.onHide();
    }
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.visible = true;
  },
  bindEvents: function() {
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.hide();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      this.props.onDelete(this.props.item);
      this.hide();
    };
  }
};

export default ModalDelete.initialize();
