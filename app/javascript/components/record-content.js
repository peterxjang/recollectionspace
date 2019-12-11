const RecordContent = {
  $recordContent: document.querySelector("#record-content"),
  $recordContentBody: document.querySelector("#record-content-body"),
  $canvas: document.querySelector("canvas"),
  visible: false,
  props: null,
  initialize: function(props) {
    this.props = props;
    this.bindEvents();
    return this;
  },
  show: function(item) {
    this.$recordContentBody.innerHTML = `
      <h1>${item.caption}</h1>
      <p><img src="${item.src}" alt="primary image"></p>
      ${item.body}
    `;
    this.$recordContent.style.display = "block";
    this.$canvas.style.display = "none";
    this.visible = true;
  },
  hide: function() {
    this.$recordContent.style.display = "none";
    this.$canvas.style.display = "block";
    this.visible = false;
    this.props.onHide();
  },
  bindEvents: function() {
    this.$recordContent.onclick = event => {
      if (event.target === this.$recordContent) {
        this.hide();
      }
    };
  }
};

export default RecordContent;
