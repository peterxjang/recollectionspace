const RecordContent = {
  $recordContent: document.querySelector("#record-content"),
  $recordContentBody: document.querySelector("#record-content-body"),
  $canvas: document.querySelector("canvas"),
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
  }
};

export default RecordContent.initialize();
