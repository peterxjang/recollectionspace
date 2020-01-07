const RecordContent = {
  $recordContent: document.querySelector("#record-content"),
  $recordContentHeader: document.querySelector("#record-content-header"),
  $recordContentTitle: document.querySelector("#record-content-header h1"),
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
    this.$recordContentHeader.style.background = `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('${
      item.src
    }') no-repeat center center`;
    this.$recordContentHeader.style.backgroundSize = "cover";
    this.$recordContentTitle.innerHTML = item.caption;
    this.$recordContentBody.innerHTML = item.body;
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
