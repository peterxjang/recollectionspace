import initializeTabs from "src/components/ui-tabs";

const ModalNewRecord = {
  props: null,
  $modal: document.getElementById("modal-new-record"),
  $form: document.querySelector("#modal-new-record form"),
  $errors: document.querySelector("#modal-new-record .errors"),
  $buttonCancel: document.getElementById("modal-new-record-cancel"),
  $inputSearch: document.getElementById("modal-new-record-search"),
  $inputSearchResults: document.getElementById("modal-new-record-search-results"),
  $inputImage: document.getElementById("modal-new-record-image"),
  $inputImagePreview: document.getElementById("modal-new-record-image-preview"),
  $inputCaption: document.getElementById("modal-new-record-caption"),
  $inputBody: document.getElementById("modal-new-record-body"),
  $linkFullEditor: document.getElementById("modal-new-record-full-editor-link"),
  imageUrl: null,
  imageWidth: null,
  imageHeight: null,
  apiId: null,
  visible: false,
  initialize: function () {
    this.bindEvents();
    initializeTabs(this.$modal, this.resetValues.bind(this));
    return this;
  },
  hide: function () {
    this.$modal.style.display = "none";
    this.$modal.resetTabs();
    this.resetValues();
    this.visible = false;
  },
  resetValues: function () {
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
  show: function (props) {
    this.props = props;
    if (!this.props.onSearch) {
      this.$modal.disableTab("#modal-new-record-search-tab");
    }
    this.$linkFullEditor.href = `${window.location.href}/new`;
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.enableInputs();
    this.visible = true;
    this.$inputSearch.focus();
  },
  startTyping: function () {
    // this.$inputUsers.disabled = true;
  },
  endTyping: function () {
    // this.$inputUsers.disabled = false;
    if (this.props.onSearch) {
      this.props.onSearch(this.$inputSearch.value, this.showSearchResults.bind(this));
    }
  },
  showSearchResults: function (items) {
    this.$inputSearchResults.innerHTML = items
      .map(
        (item) =>
          `<img src="${item.image}" alt="${item.caption}" data-body="${item.body}" data-caption="${item.caption}" data-id="${item.id}">`
      )
      .join("");
  },
  highlightImage: function (image) {
    this.$inputSearchResults.querySelectorAll("img").forEach((item) => {
      item.style.opacity = 0.25;
    });
    image.style.opacity = 1.0;
  },
  disableInputs: function () {
    [...this.$form.elements].forEach((element) => (element.disabled = true));
  },
  enableInputs: function () {
    [...this.$form.elements].forEach((element) => (element.disabled = false));
  },
  bindEvents: function () {
    this.$form.onsubmit = (event) => {
      event.preventDefault();
      this.disableInputs();
      const image = this.imageUrl || this.$inputImage.files[0];
      this.props.onSaveRecord(image, this.$inputCaption.value, this.$inputBody.value, {
        width: this.imageWidth,
        height: this.imageHeight,
        api_id: this.apiId,
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
    this.$inputSearchResults.onclick = (event) => {
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
    this.$inputImage.onchange = (event) => {
      URL.revokeObjectURL(this.$inputImagePreview.src);
      this.$inputImagePreview.src = URL.createObjectURL(event.target.files[0]);
    };
  },
};

export default ModalNewRecord.initialize();
