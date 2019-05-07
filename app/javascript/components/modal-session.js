const ModalSession = {
  props: null,
  $modal: document.getElementById("modal-session"),
  $buttonSave: document.querySelector("#modal-session-save"),
  $buttonCancel: document.querySelector("#modal-session-cancel"),
  $inputEmail: document.querySelector("#modal-session-email"),
  $inputPassword: document.querySelector("#modal-session-password"),
  $buttonClose: document.querySelector("#modal-session-close"),
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
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.visible = true;
  },
  bindEvents: function() {
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.props.onCancel();
      this.hide();
    };
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

export default ModalSession.initialize();
