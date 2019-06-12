const ModalNewUser = {
  props: null,
  $modal: document.getElementById("modal-new-user"),
  $errors: document.querySelector("#modal-new-user .errors"),
  $buttonSave: document.getElementById("modal-new-user-save"),
  $buttonCancel: document.getElementById("modal-new-user-cancel"),
  $inputEmail: document.getElementById("modal-new-user-email"),
  $inputUsername: document.getElementById("modal-new-user-username"),
  $inputPassword: document.getElementById("modal-new-user-password"),
  $inputPasswordConfirmation: document.getElementById(
    "modal-new-user-password-confirmation"
  ),
  $buttonLogin: document.getElementById("modal-new-user-login"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputEmail.value = "";
    this.$inputUsername.value = "";
    this.$inputPassword.value = "";
    this.$inputPasswordConfirmation.value = "";
    this.$errors.innerHTML = "";
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
      this.props.onCancel();
      this.hide();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      this.props.onSignup(
        this.$inputEmail.value,
        this.$inputUsername.value,
        this.$inputPassword.value,
        this.$inputPasswordConfirmation.value
      );
    };
    this.$buttonLogin.onclick = event => {
      event.preventDefault();
      this.props.onShowLogin();
      this.hide();
    };
  }
};

export default ModalNewUser.initialize();
