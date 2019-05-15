const ModalNewSession = {
  props: null,
  $modal: document.getElementById("modal-new-session"),
  $buttonSave: document.querySelector("#modal-new-session .save"),
  $buttonCancel: document.querySelector("#modal-new-session .cancel"),
  $inputEmail: document.querySelector("#modal-new-session .email"),
  $inputPassword: document.querySelector("#modal-new-session .password"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputEmail.value = "";
    this.$inputPassword.value = "";
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
      this.props.onCancel();
      this.hide();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      this.props.onLogin(this.$inputEmail.value, this.$inputPassword.value);
      this.hide();
    };
  }
};

export default ModalNewSession.initialize();
