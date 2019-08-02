const RecordContent = {
  $recordContent: document.querySelector("#record-content"),
  $recordContentBody: document.querySelector("#record-content-body"),
  $canvas: document.querySelector("canvas"),
  visible: false,
  initialize: function() {
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
  hide: function(props) {
    this.$recordContent.style.display = "none";
    this.$canvas.style.display = "block";
    this.visible = false;
    props.onHide();
  }
};

export default RecordContent.initialize();
