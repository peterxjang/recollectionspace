const ModalNewFollow = {
  props: null,
  $modal: document.getElementById("modal-new-follow"),
  $inputSearch: document.getElementById("modal-new-follow-search"),
  $buttonSave: document.getElementById("modal-new-follow-save"),
  $buttonCancel: document.getElementById("modal-new-follow-cancel"),
  $inputUsers: document.getElementById("modal-new-follow-users"),
  visible: false,
  users: [],
  typingTimer: null,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputSearch.value = "";
    this.$inputUsers.value = "";
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
    this.endTyping();
  },
  startTyping: function() {
    this.$inputUsers.disabled = true;
  },
  endTyping: function() {
    this.$inputUsers.disabled = false;
    this.props.onSearchUsers(
      this.$inputSearch.value,
      this.showSearchResults.bind(this)
    );
  },
  showSearchResults: function(users) {
    this.users = users;
    this.$inputUsers.innerHTML = users
      .map(user => `<option value=${user.id}>${user.username}</option>`)
      .join();
  },
  bindEvents: function() {
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.hide();
    };
    this.$inputSearch.oninput = event => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.endTyping.bind(this), 500);
      this.startTyping();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      const user = this.users.filter(
        user => user.id === parseInt(this.$inputUsers.value)
      )[0];
      if (user) {
        this.props.onSaveFollow(user.src, user.username, "", {
          following_id: user.id
        });
      }
      this.hide();
    };
  }
};

export default ModalNewFollow.initialize();
