const ModalEdit = {
  props: null,
  $modal: document.getElementById("modal-edit"),
  $errors: document.querySelector("#modal-edit .errors"),
  $buttonSave: document.getElementById("modal-edit-save"),
  $buttonCancel: document.getElementById("modal-edit-cancel"),
  $inputCaption: document.getElementById("modal-edit-caption"),
  $inputBody: document.getElementById("modal-edit-body"),
  $linkFullEditor: document.getElementById(
    "modal-edit-record-full-editor-link"
  ),
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
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$inputCaption.value = this.props.item.caption;
    this.$inputBody.value = this.props.item.body;
    this.$linkFullEditor.href = this.props.fullEditLink;
    this.$modal.scrollTo(0, 0);
    this.visible = true;
  },
  bindEvents: function() {
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.props.onCancel();
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
