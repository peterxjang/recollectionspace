const ModalNewFollow = {
  props: null,
  $modal: document.getElementById("modal-new-follow"),
  $errors: document.querySelector("#modal-new-follow .errors"),
  $inputSearch: document.getElementById("modal-new-follow-search"),
  $inputList: document.getElementById("modal-new-follow-list"),
  $buttonSave: document.getElementById("modal-new-follow-save"),
  $buttonCancel: document.getElementById("modal-new-follow-cancel"),
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
    this.$errors.innerHTML = "";
    this.visible = false;
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.visible = true;
    this.endTyping();
  },
  startTyping: function() {
    this.$inputList.disabled = true;
  },
  endTyping: function() {
    this.$inputList.disabled = false;
    this.props.onSearchUsers(
      this.$inputSearch.value,
      this.showSearchResults.bind(this)
    );
  },
  showSearchResults: function(users) {
    this.users = users;
    this.$inputList.innerHTML =
      users.length === 0
        ? `<div class="form-group">No matching users.</div>`
        : users
            .map(
              user => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="userId" id="radio-user-${
              user.id
            }" value="${user.id}">
            <label class="form-check-label" for="radio-user-${user.id}">${
                user.username
              }</label>
          </div>
            `
            )
            .join("");
  },
  bindEvents: function() {
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.props.onCancel();
    };
    this.$inputSearch.oninput = event => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.endTyping.bind(this), 500);
      this.startTyping();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      const $selected = this.$modal.querySelector(
        `input[name="userId"]:checked`
      );
      if ($selected) {
        const user = this.users.filter(
          user => user.id === parseInt($selected.value)
        )[0];
        this.props.onSaveFollow(user.src, user.username, "", {
          following_id: user.id,
          width: user.width,
          height: user.height
        });
      }
    };
  }
};

export default ModalNewFollow.initialize();
