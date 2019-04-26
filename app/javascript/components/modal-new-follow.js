const ModalNewFollow = {
  props: null,
  $modal: document.getElementById("modal-new-follow"),
  $inputSearch: document.querySelector("#modal-new-follow-search"),
  $buttonSearchSubmit: document.querySelector(
    "#modal-new-follow-search-submit"
  ),
  $divResults: document.querySelector("#modal-new-follow-results"),
  $buttonSave: document.querySelector("#modal-new-follow-save"),
  $buttonCancel: document.querySelector("#modal-new-follow-cancel"),
  $inputUsers: document.querySelector("#modal-new-follow-users"),
  $buttonClose: document.querySelector("#modal-new-follow-close"),
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
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.hide();
    };
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
