import ModalList from "./modal-list";
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
  onClose: null,
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
      ModalList.hide();
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
    this.$modal.style.zIndex = -1;
    this.visible = false;
    this.$buttonClose.style.display = "none";
  },
  makeVisible: function() {
    setTimeout(() => {
      this.$modal.style.opacity = 1;
      this.$modal.style.zIndex = 10;
      this.visible = true;
      this.$buttonClose.style.display = "inherit";
    }, 0);
  },
  showList: function(props) {
    this.makeVisible();
    ModalList.show(props);
    this.currentModal = ModalList;
  },
  showInfo: function(props) {
    this.makeVisible();
    ModalInfo.show(props);
    this.currentModal = ModalInfo;
  },
  showNewRecord: function(props) {
    this.makeVisible();
    ModalNewRecord.show(props);
    this.currentModal = ModalNewRecord;
  },
  showNewFollow: function(props) {
    this.makeVisible();
    ModalNewFollow.show(props);
    this.currentModal = ModalNewFollow;
  },
  showNewUserCollection: function(props) {
    this.makeVisible();
    ModalNewUserCollection.show(props);
    this.currentModal = ModalNewUserCollection;
  },
  showNewSession: function(props) {
    this.makeVisible();
    ModalNewSession.show(props);
    this.currentModal = ModalNewSession;
  },
  showNewUser: function(props) {
    this.makeVisible();
    ModalNewUser.show(props);
    this.currentModal = ModalNewUser;
  },
  showEdit: function(props) {
    this.makeVisible();
    ModalEdit.show(props);
    this.currentModal = ModalEdit;
  },
  showDelete: function(props) {
    this.makeVisible();
    ModalDelete.show(props);
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
      if (this.currentModal.enableInputs) {
        this.currentModal.enableInputs();
      }
    }
  },
  bindEvents: function() {
    this.$buttonClose.onclick = event => {
      event.preventDefault();
      this.onClose();
    };
  }
};

export default Modal.initialize();
