const ModalEdit = {
  props: null,
  $modal: document.getElementById("modal-edit"),
  $buttonSave: document.querySelector("#modal-edit .save"),
  $buttonCancel: document.querySelector("#modal-edit .cancel"),
  $inputCaption: document.querySelector("#modal-edit .caption"),
  $inputBody: document.querySelector("#modal-edit .body"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputCaption.value = "";
    this.$inputBody.value = "";
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
      this.hide();
    };
  }
};

export default ModalEdit.initialize();
