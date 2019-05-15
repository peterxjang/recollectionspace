const ModalNewRecord = {
  props: null,
  $modal: document.getElementById("modal-new-record"),
  $buttonSave: document.querySelector("#modal-new-record .save"),
  $buttonCancel: document.querySelector("#modal-new-record .cancel"),
  $inputImage: document.querySelector("#modal-new-record .image"),
  $inputCaption: document.querySelector("#modal-new-record .caption"),
  $inputBody: document.querySelector("#modal-new-record .body"),
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
    if (this.props) {
      this.props.onHide();
    }
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.visible = true;
  },
  bindEvents: function() {
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.hide();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      this.props.onSaveRecord(
        this.$inputImage.files[0],
        this.$inputCaption.value,
        this.$inputBody.value
      );
      this.hide();
    };
  }
};

export default ModalNewRecord.initialize();
