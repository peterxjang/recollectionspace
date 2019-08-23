const ModalNewSession = {
  props: null,
  $modal: document.getElementById("modal-new-session"),
  $errors: document.querySelector("#modal-new-session .errors"),
  $buttonSave: document.getElementById("modal-new-session-save"),
  $buttonCancel: document.getElementById("modal-new-session-cancel"),
  $buttonLogout: document.getElementById("modal-new-session-logout"),
  $inputEmail: document.getElementById("modal-new-session-email"),
  $inputPassword: document.getElementById("modal-new-session-password"),
  // $buttonSignup: document.getElementById("modal-new-session-signup"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputEmail.value = "";
    this.$inputPassword.value = "";
    this.$errors.innerHTML = "";
    this.visible = false;
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
      this.props.onCancel();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      this.props.onLogin(this.$inputEmail.value, this.$inputPassword.value);
    };
    this.$buttonLogout.onclick = event => {
      event.preventDefault();
      this.props.onLogout();
    };
    // this.$buttonSignup.onclick = event => {
    //   event.preventDefault();
    //   this.props.onShowSignup();
    // };
  }
};

export default ModalNewSession.initialize();
