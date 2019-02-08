const ModalInfo = {
  props: null,
  $modal: document.getElementById("modal-info"),
  $caption: document.querySelector("#modal-info .caption"),
  $body: document.querySelector("#modal-info .body"),
  $buttonClose: document.querySelector("#modal-info-close"),
  $buttonEdit: document.querySelector("#modal-info-edit"),
  $buttonDelete: document.querySelector("#modal-info-delete"),
  visible: false,
  initialize: function() {
    this.isSolid = false;
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$caption.style.pointerEvents = "none";
    this.$body.style.pointerEvents = "none";
    this.$modal.style.opacity = 0;
    this.$caption.innerHTML = "";
    this.$body.innerHTML = "";
    this.$buttonEdit.style.display = "none";
    this.$buttonDelete.style.display = "none";
    this.visible = false;
    this.isSolid = false;
  },
  show: function(props) {
    this.props = props;
    this.$caption.style.pointerEvents = "auto";
    this.$modal.style.opacity = 0.8;
    this.$caption.innerHTML = this.props.item.caption;
    this.$body.innerHTML =
      this.props.item.body !== undefined ? this.props.item.body : "Loading...";
    if (this.props.item.id && this.props.item.body !== undefined) {
      this.$buttonEdit.style.display = "inline";
      this.$buttonDelete.style.display = "inline";
    }
    this.visible = true;
  },
  bindEvents: function() {
    this.$caption.onmousedown = event => {
      event.preventDefault();
      this.isSolid = !this.isSolid;
      if (this.isSolid) {
        this.$modal.style.opacity = 1.0;
        this.$modal.style.pointerEvents = "auto";
        this.$body.style.pointerEvents = "auto";
      } else {
        this.$modal.style.opacity = 0.8;
        this.$modal.style.pointerEvents = "none";
        this.$body.style.pointerEvents = "none";
      }
    };
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.hide();
    };
    this.$buttonEdit.onclick = event => {
      event.preventDefault();
      this.props.onEdit(this.props.item);
      this.hide();
    };
    this.$buttonDelete.onclick = event => {
      event.preventDefault();
      this.props.onDelete(this.props.item);
      this.hide();
    };
  }
};

export default ModalInfo.initialize();
