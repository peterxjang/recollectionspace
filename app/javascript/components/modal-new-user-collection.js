const ModalNewUserCollection = {
  props: null,
  $modal: document.getElementById("modal-new-user-collection"),
  $inputCollections: document.getElementById(
    "modal-new-user-collection-collections"
  ),
  $inputImage: document.getElementById("modal-new-user-collection-image"),
  $buttonSave: document.getElementById("modal-new-user-collection-save"),
  $buttonCancel: document.getElementById("modal-new-user-collection-cancel"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputCollections.value = "";
    this.$inputImage.value = "";
    this.visible = false;
    if (this.props) {
      this.props.onHide();
    }
  },
  show: function(props) {
    this.props = props;
    this.showCollections(this.props.collections);
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.visible = true;
  },
  showCollections: function(collections) {
    this.$inputCollections.innerHTML = collections
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
      const id = parseInt(this.$inputCollections.value);
      const collection = this.props.collections.filter(
        category => category.id === id
      )[0];
      const image = this.$inputImage.files[0] || collection.src;
      const caption = collection.name;
      const body = "";
      this.props.onSaveUserCollection(image, caption, body, {
        collection_id: id,
        width: collection.width,
        height: collection.height
      });
      this.hide();
    };
  }
};

export default ModalNewUserCollection.initialize();
