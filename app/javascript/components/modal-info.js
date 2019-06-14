const ModalInfo = {
  props: null,
  $modal: document.getElementById("modal-info"),
  $caption: document.getElementById("modal-info-caption"),
  $body: document.getElementById("modal-info-body"),
  $buttonEdit: document.getElementById("modal-info-edit"),
  $buttonDelete: document.getElementById("modal-info-delete"),
  visible: false,
  initialize: function() {
    this.$buttonEdit.style.display = "none";
    this.$buttonDelete.style.display = "none";
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.$caption.innerHTML = "";
    this.$body.innerHTML = "";
    this.$buttonEdit.style.display = "none";
    this.$buttonDelete.style.display = "none";
    this.visible = false;
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$caption.innerHTML = this.props.item.caption;
    this.$body.innerText =
      this.props.item.body !== undefined ? this.props.item.body : "Loading...";
    if (
      this.props.item.id &&
      this.props.item.body !== undefined &&
      this.props.isOwner
    ) {
      this.$buttonEdit.style.display = "inline";
      this.$buttonDelete.style.display = "inline";
    }
    this.$modal.scrollTo(0, 0);
    this.visible = true;
  },
  bindEvents: function() {
    this.$buttonEdit.onclick = event => {
      event.preventDefault();
      this.props.onEdit(this.props.item);
    };
    this.$buttonDelete.onclick = event => {
      event.preventDefault();
      this.props.onDelete(this.props.item);
    };
  }
};

export default ModalInfo.initialize();
