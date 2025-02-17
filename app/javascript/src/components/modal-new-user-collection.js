import initializeTabs from "src/components/ui-tabs";

const ModalNewUserCollection = {
  props: null,
  $modal: document.getElementById("modal-new-user-collection"),
  $errors: document.querySelector("#modal-new-user-collection .errors"),
  $inputSearch: document.getElementById("modal-new-user-collection-search"),
  $inputName: document.getElementById("modal-new-user-collection-name"),
  $inputList: document.getElementById("modal-new-user-collection-list"),
  $inputImage: document.getElementById("modal-new-user-collection-image"),
  $form: document.querySelector("#modal-new-user-collection > form"),
  $buttonCancel: document.getElementById("modal-new-user-collection-cancel"),
  visible: false,
  collections: [],
  initialize: function () {
    this.bindEvents();
    initializeTabs(this.$modal, this.resetValues.bind(this));
    return this;
  },
  hide: function () {
    this.$modal.style.display = "none";
    this.resetValues();
    this.visible = false;
  },
  resetValues: function () {
    this.$inputSearch.value = "";
    this.$inputName.value = "";
    this.$inputImage.value = "";
    this.$errors.innerHTML = "";
  },
  show: function (props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.visible = true;
    this.endTyping();
    this.$inputSearch.focus();
  },
  startTyping: function () {
    this.$inputList.disabled = true;
  },
  endTyping: function () {
    this.$inputList.disabled = false;
    if (this.props.onSearch) {
      this.props.onSearch(this.$inputSearch.value, this.showSearchResults.bind(this));
    }
  },
  showSearchResults: function (collections) {
    this.collections = collections;
    const invalidHTML = `<div class="form-group">No matching collections.</div>`;
    const validHTML = collections
      .map(
        (collection) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="collectionId" id="radio-collection-${collection.id}" value="${collection.id}">
            <label class="form-check-label" for="radio-collection-${collection.id}">${collection.name}</label>
          </div>
        `
      )
      .join("");
    this.$inputList.innerHTML = collections.length === 0 ? invalidHTML : validHTML;
  },
  bindEvents: function () {
    this.$form.onsubmit = (event) => {
      event.preventDefault();
      let image, caption, body, id, width, height;
      const $selected = this.$modal.querySelector(`input[name="collectionId"]:checked`);
      if ($selected) {
        id = parseInt($selected.value);
        const collection = this.collections.filter((category) => category.id === id)[0];
        image = collection.src;
        caption = collection.name;
        width = collection.width;
        height = collection.height;
      } else {
        id = null;
        image = this.$inputImage.files[0];
        caption = this.$inputName.value;
      }
      body = "";
      this.props.onSaveUserCollection(image, caption, body, {
        collection_id: id,
        width: width,
        height: height,
      });
    };
    this.$buttonCancel.onclick = (event) => {
      event.preventDefault();
      this.props.onCancel();
    };
    this.$inputSearch.oninput = (event) => {
      clearTimeout(this.typingTimer);
      this.typingTimer = setTimeout(this.endTyping.bind(this), 500);
      this.startTyping();
    };
  },
};

export default ModalNewUserCollection.initialize();
