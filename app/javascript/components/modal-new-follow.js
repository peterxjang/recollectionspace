const ModalNewFollow = {
  props: null,
  $modal: document.getElementById("modal-new-follow"),
  $inputSearch: document.getElementById("modal-new-follow-search"),
  $buttonSearchSubmit: document.getElementById(
    "modal-new-follow-search-submit"
  ),
  $divResults: document.getElementById("modal-new-follow-results"),
  $buttonSave: document.getElementById("modal-new-follow-save"),
  $buttonCancel: document.getElementById("modal-new-follow-cancel"),
  $inputUsers: document.getElementById("modal-new-follow-users"),
  visible: false,
  users: [],
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$divResults.style.display = "none";
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
    this.visible = true;
  },
  showSearchResults: function(users) {
    console.log("showSearchResults", users);
    this.users = users;
    this.$inputUsers.innerHTML = users
      .map(user => `<option value=${user.id}>${user.username}</option>`)
      .join();
    this.$divResults.style.display = "block";
  },
  bindEvents: function() {
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.hide();
    };
    this.$buttonSearchSubmit.onclick = event => {
      event.preventDefault();
      this.props.onSearchUsers(
        this.$inputSearch.value,
        this.showSearchResults.bind(this)
      );
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
