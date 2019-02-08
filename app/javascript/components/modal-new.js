const ModalNew = {
  props: null,
  $modal: document.getElementById("modal-new"),
  $buttonSave: document.querySelector("#modal-new-save"),
  $buttonCancel: document.querySelector("#modal-new-cancel"),
  $inputImage: document.querySelector("#modal-new-image"),
  $inputCaption: document.querySelector("#modal-new-caption"),
  $inputBody: document.querySelector("#modal-new-body"),
  $buttonClose: document.querySelector("#modal-new-close"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputImage.value = "";
    this.$inputCaption.value = "";
    this.$inputBody.value = "";
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
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.hide();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      this.props.onSaveRecord(
        this.$inputImage.value,
        this.$inputCaption.value,
        this.$inputBody.value
      );
      this.hide();
    };
  }
};

export default ModalNew.initialize();
