import ModalInfo from "./modal-info";
import ModalNewRecord from "./modal-new-record";
import ModalNewFollow from "./modal-new-follow";
import ModalNewUserCollection from "./modal-new-user-collection";
import ModalNewSession from "./modal-new-session";
import ModalNewUser from "./modal-new-user";
import ModalEdit from "./modal-edit";
import ModalDelete from "./modal-delete";

const Modal = {
  $modal: document.getElementById("modal"),
  $buttonClose: document.querySelector("#modal-close"),
  visible: false,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    ModalInfo.hide();
    ModalNewRecord.hide();
    ModalNewFollow.hide();
    ModalNewUserCollection.hide();
    ModalNewSession.hide();
    ModalNewUser.hide();
    ModalEdit.hide();
    ModalDelete.hide();
    this.makeInvisible();
  },
  makeInvisible: function() {
    this.$modal.style.opacity = 0;
    this.visible = false;
  },
  makeVisible: function() {
    setTimeout(() => {
      this.$modal.style.opacity = 1;
      this.visible = true;
    }, 0);
  },
  showInfo: function(props) {
    this.makeVisible();
    ModalInfo.show({ ...props, onHide: this.makeInvisible.bind(this) });
  },
  showNewRecord: function(props) {
    this.makeVisible();
    ModalNewRecord.show({ ...props, onHide: this.makeInvisible.bind(this) });
  },
  showNewFollow: function(props) {
    this.makeVisible();
    ModalNewFollow.show({ ...props, onHide: this.makeInvisible.bind(this) });
  },
  showNewUserCollection: function(props) {
    this.makeVisible();
    ModalNewUserCollection.show({
      ...props,
      onHide: this.makeInvisible.bind(this)
    });
  },
  showNewSession: function(props) {
    this.makeVisible();
    ModalNewSession.show({ ...props, onHide: this.makeInvisible.bind(this) });
  },
  showNewUser: function(props) {
    this.makeVisible();
    ModalNewUser.show({ ...props, onHide: this.makeInvisible.bind(this) });
  },
  showEdit: function(props) {
    this.makeVisible();
    ModalEdit.show({ ...props, onHide: this.makeInvisible.bind(this) });
  },
  showDelete: function(props) {
    this.makeVisible();
    ModalDelete.show({ ...props, onHide: this.makeInvisible.bind(this) });
  },
  bindEvents: function() {
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.hide();
    };
  }
};

export default Modal.initialize();
