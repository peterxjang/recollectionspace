const ModalEdit = {
  props: null,
  $modal: document.getElementById("modal-edit"),
  $errors: document.querySelector("#modal-edit .errors"),
  $buttonSave: document.getElementById("modal-edit-save"),
  $buttonCancel: document.getElementById("modal-edit-cancel"),
  $inputCaption: document.getElementById("modal-edit-caption"),
  $inputBody: document.getElementById("modal-edit-body"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputCaption.value = "";
    this.$inputBody.value = "";
    this.$errors.innerHTML = "";
    this.visible = false;
    if (this.props) {
      this.props.onHide();
    }
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$inputCaption.value = this.props.item.caption;
    this.$inputBody.value = this.props.item.body;
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
      this.props.onEditRecord(
        this.props.item.id,
        this.props.item.type,
        this.$inputCaption.value,
        this.$inputBody.value
      );
    };
  }
};

export default ModalEdit.initialize();
