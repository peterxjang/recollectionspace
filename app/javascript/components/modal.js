import ModalInfo from "./modal-info";
import ModalMenu from "./modal-menu";
import ModalNewRecord from "./modal-new-record";
import ModalNewFollow from "./modal-new-follow";
import ModalNewCollection from "./modal-new-collection";
import ModalNewSession from "./modal-new-session";
import ModalEdit from "./modal-edit";

const Modal = {
  $modal: document.getElementById("modal"),
  $buttonClose: document.querySelector("#modal-close"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.opacity = 0;
    this.visible = false;
  },
  reset: function() {
    ModalInfo.hide();
    ModalMenu.hide();
    ModalNewRecord.hide();
    ModalNewFollow.hide();
    ModalNewCollection.hide();
    ModalNewSession.hide();
    ModalEdit.hide();
    setTimeout(() => {
      this.$modal.style.opacity = 1;
      this.visible = true;
    }, 0);
  },
  showInfo: function(props) {
    this.reset();
    ModalInfo.show({ ...props, onHide: this.hide.bind(this) });
  },
  showMenu: function(props) {
    this.reset();
    ModalMenu.show({ ...props, onHide: this.hide.bind(this) });
  },
  showNewRecord: function(props) {
    this.reset();
    ModalNewRecord.show({ ...props, onHide: this.hide.bind(this) });
  },
  showNewFollow: function(props) {
    this.reset();
    ModalNewFollow.show({ ...props, onHide: this.hide.bind(this) });
  },
  showNewCollection: function(props) {
    this.reset();
    ModalNewCollection.show({ ...props, onHide: this.hide.bind(this) });
  },
  showNewSession: function(props) {
    this.reset();
    ModalNewSession.show({ ...props, onHide: this.hide.bind(this) });
  },
  showEdit: function(props) {
    this.reset();
    ModalEdit.show({ ...props, onHide: this.hide.bind(this) });
  },
  bindEvents: function() {
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.hide();
    };
  }
};

export default Modal.initialize();
