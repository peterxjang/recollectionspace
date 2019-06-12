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
  currentModal: null,
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    if (this.currentModal) {
      this.currentModal.hide();
      this.currentModal = null;
    } else {
      ModalInfo.hide();
      ModalNewRecord.hide();
      ModalNewFollow.hide();
      ModalNewUserCollection.hide();
      ModalNewSession.hide();
      ModalNewUser.hide();
      ModalEdit.hide();
      ModalDelete.hide();
    }
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
    this.currentModal = ModalInfo;
  },
  showNewRecord: function(props) {
    this.makeVisible();
    ModalNewRecord.show({ ...props, onHide: this.makeInvisible.bind(this) });
    this.currentModal = ModalNewRecord;
  },
  showNewFollow: function(props) {
    this.makeVisible();
    ModalNewFollow.show({ ...props, onHide: this.makeInvisible.bind(this) });
    this.currentModal = ModalNewFollow;
  },
  showNewUserCollection: function(props) {
    this.makeVisible();
    ModalNewUserCollection.show({
      ...props,
      onHide: this.makeInvisible.bind(this)
    });
    this.currentModal = ModalNewUserCollection;
  },
  showNewSession: function(props) {
    this.makeVisible();
    ModalNewSession.show({ ...props, onHide: this.makeInvisible.bind(this) });
    this.currentModal = ModalNewSession;
  },
  showNewUser: function(props) {
    this.makeVisible();
    ModalNewUser.show({ ...props, onHide: this.makeInvisible.bind(this) });
    this.currentModal = ModalNewUser;
  },
  showEdit: function(props) {
    this.makeVisible();
    ModalEdit.show({ ...props, onHide: this.makeInvisible.bind(this) });
    this.currentModal = ModalEdit;
  },
  showDelete: function(props) {
    this.makeVisible();
    ModalDelete.show({ ...props, onHide: this.makeInvisible.bind(this) });
    this.currentModal = ModalDelete;
  },
  setErrors: function(errors) {
    if (this.currentModal && this.currentModal.$errors) {
      if (errors && errors.length === 0) {
        errors = ["Unknown error"];
      }
      this.currentModal.$errors.innerHTML = errors
        .map(error => `<li>${error}</li>`)
        .join("");
    }
  },
  bindEvents: function() {
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.hide();
    };
  }
};

export default Modal.initialize();
