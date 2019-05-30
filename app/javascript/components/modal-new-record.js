const ModalNewRecord = {
  props: null,
  $modal: document.getElementById("modal-new-record"),
  $buttonSave: document.getElementById("modal-new-record-save"),
  $buttonCancel: document.getElementById("modal-new-record-cancel"),
  $inputSearch: document.getElementById("modal-new-record-search"),
  $inputSearchResults: document.getElementById(
    "modal-new-record-search-results"
  ),
  $inputImage: document.getElementById("modal-new-record-image"),
  $inputCaption: document.getElementById("modal-new-record-caption"),
  $inputBody: document.getElementById("modal-new-record-body"),
  imageUrl: null,
  imageWidth: null,
  imageHeight: null,
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$inputSearch.value = "";
    this.$inputSearchResults.innerHTML = "";
    this.$inputImage.value = "";
    this.$inputCaption.value = "";
    this.$inputBody.value = "";
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
  startTyping: function() {
    // this.$inputUsers.disabled = true;
  },
  endTyping: function() {
    // this.$inputUsers.disabled = false;
    if (this.props.onSearch) {
      this.props.onSearch(
        this.$inputSearch.value,
        this.showSearchResults.bind(this)
      );
    }
  },
  showSearchResults: function(books) {
    this.$inputSearchResults.innerHTML = books
      .map(
        book =>
          `<img src="${book.thumbnailImage}" alt="${
            book.caption
          }" data-image="${book.fullImage}" data-caption="${book.caption}">`
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
    this.$inputSearchResults.onclick = event => {
      if (event.target.matches("img")) {
        this.$inputCaption.value = event.target.dataset.caption;
        this.imageUrl = event.target.src;
        this.imageWidth = event.target.width;
        this.imageHeight = event.target.height;
      }
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      const image = this.imageUrl || this.$inputImage.files[0];
      this.props.onSaveRecord(
        image,
        this.$inputCaption.value,
        this.$inputBody.value,
        { width: this.imageWidth, height: this.imageHeight }
      );
      this.hide();
    };
  }
};

export default ModalNewRecord.initialize();
