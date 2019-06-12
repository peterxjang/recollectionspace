import initializeTabs from "./ui-tabs";

const ModalNewRecord = {
  props: null,
  $modal: document.getElementById("modal-new-record"),
  $errors: document.querySelector("#modal-new-record .errors"),
  $buttonSave: document.getElementById("modal-new-record-save"),
  $buttonCancel: document.getElementById("modal-new-record-cancel"),
  $inputSearch: document.getElementById("modal-new-record-search"),
  $inputSearchResults: document.getElementById(
    "modal-new-record-search-results"
  ),
  $inputImage: document.getElementById("modal-new-record-image"),
  $inputImagePreview: document.getElementById("modal-new-record-image-preview"),
  $inputCaption: document.getElementById("modal-new-record-caption"),
  $inputBody: document.getElementById("modal-new-record-body"),
  imageUrl: null,
  imageWidth: null,
  imageHeight: null,
  apiId: null,
  visible: false,
  initialize: function() {
    this.bindEvents();
    initializeTabs(this.$modal, this.resetValues.bind(this));
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$modal.resetTabs();
    this.resetValues();
    this.visible = false;
    if (this.props) {
      this.props.onHide();
    }
  },
  resetValues: function() {
    this.$inputSearch.value = "";
    this.$inputSearchResults.innerHTML = "";
    this.$inputImage.value = "";
    const url = this.$inputImagePreview.src;
    this.$inputImagePreview.src = "";
    URL.revokeObjectURL(url);
    this.$inputCaption.value = "";
    this.$inputBody.value = "";
    this.$errors.innerHTML = "";
  },
  show: function(props) {
    this.props = props;
    if (!this.props.onSearch) {
      this.$modal.disableTab("#modal-new-record-search-tab");
    }
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
  showSearchResults: function(items) {
    this.$inputSearchResults.innerHTML = items
      .map(
        item =>
          `<img src="${item.image}" alt="${item.caption}" data-body="${
            item.body
          }" data-caption="${item.caption}" data-id="${item.id}">`
      )
      .join("");
  },
  highlightImage: function(image) {
    this.$inputSearchResults.querySelectorAll("img").forEach(item => {
      item.style.opacity = 0.25;
    });
    image.style.opacity = 1.0;
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
        this.$inputBody.value = event.target.dataset.body;
        this.apiId = event.target.dataset.id;
        this.imageUrl = event.target.src;
        this.imageWidth = event.target.width;
        this.imageHeight = event.target.height;
        this.highlightImage(event.target);
      }
    };
    this.$inputImage.onchange = event => {
      URL.revokeObjectURL(this.$inputImagePreview.src);
      this.$inputImagePreview.src = URL.createObjectURL(event.target.files[0]);
    };
    this.$buttonSave.onclick = event => {
      event.preventDefault();
      const image = this.imageUrl || this.$inputImage.files[0];
      this.props.onSaveRecord(
        image,
        this.$inputCaption.value,
        this.$inputBody.value,
        { width: this.imageWidth, height: this.imageHeight, api_id: this.apiId }
      );
    };
  }
};

export default ModalNewRecord.initialize();
