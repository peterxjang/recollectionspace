import initializeTabs from "./ui-tabs";

const ModalNewUserCollection = {
  props: null,
  $modal: document.getElementById("modal-new-user-collection"),
  $inputSearch: document.getElementById("modal-new-user-collection-search"),
  $inputName: document.getElementById("modal-new-user-collection-name"),
  $inputList: document.getElementById("modal-new-user-collection-list"),
  $inputImage: document.getElementById("modal-new-user-collection-image"),
  $buttonSave: document.getElementById("modal-new-user-collection-save"),
  $buttonCancel: document.getElementById("modal-new-user-collection-cancel"),
  visible: false,
  collections: [],
  initialize: function() {
    this.bindEvents();
    initializeTabs(this.$modal, this.resetValues.bind(this));
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.resetValues();
    this.visible = false;
    if (this.props) {
      this.props.onHide();
    }
  },
  resetValues: function() {
    this.$inputSearch.value = "";
    this.$inputName.value = "";
    this.$inputImage.value = "";
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
    if (this.props.onSearch) {
      this.props.onSearch(
        this.$inputSearch.value,
        this.showSearchResults.bind(this)
      );
    }
  },
  showSearchResults: function(collections) {
    this.collections = collections;
    this.$inputList.innerHTML =
      collections.length === 0
        ? `<div class="form-group">No matching collections.</div>`
        : collections
            .map(
              collection => `
            <div class="form-check">
              <input class="form-check-input" type="radio" name="collectionId" id="radio-collection-${
                collection.id
              }" value="${collection.id}">
              <label class="form-check-label" for="radio-collection-${
                collection.id
              }">${collection.name}</label>
            </div>
            `
            )
            .join("");
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
      let image, caption, body, id, width, height;
      const $selected = this.$modal.querySelector(
        `input[name="collectionId"]:checked`
      );
      if ($selected) {
        id = parseInt($selected.value);
        const collection = this.collections.filter(
          category => category.id === id
        )[0];
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
        height: height
      });
      this.hide();
    };
  }
};

export default ModalNewUserCollection.initialize();
