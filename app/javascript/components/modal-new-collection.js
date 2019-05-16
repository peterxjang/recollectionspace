const ModalNewCollection = {
  props: null,
  $modal: document.getElementById("modal-new-collection"),
  $inputCollectionCategories: document.getElementById(
    "modal-new-collection-categories"
  ),
  $inputImage: document.getElementById("modal-new-collection-image"),
  $buttonSave: document.getElementById("modal-new-collection-save"),
  $buttonCancel: document.getElementById("modal-new-collection-cancel"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputCollectionCategories.value = "";
    this.$inputImage.value = "";
    this.visible = false;
    if (this.props) {
      this.props.onHide();
    }
  },
  show: function(props) {
    this.props = props;
    this.showCollectionCategories(this.props.collectionCategories);
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.visible = true;
  },
  showCollectionCategories: function(collectionCategories) {
    this.$inputCollectionCategories.innerHTML = collectionCategories
      .map(category => `<option value=${category.id}>${category.name}</option>`)
      .join();
  },
  bindEvents: function() {
    this.$buttonCancel.onclick = event => {
      event.preventDefault();
      this.hide();
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      const id = parseInt(this.$inputCollectionCategories.value);
      const image = this.$inputImage.files[0];
      const caption = this.props.collectionCategories.filter(
        category => category.id === id
      )[0].name;
      const body = "";
      this.props.onSaveCollection(image, caption, body, {
        collection_category_id: id
      });
      this.hide();
    };
  }
};

export default ModalNewCollection.initialize();
