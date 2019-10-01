const ModalList = {
  props: null,
  $modal: document.getElementById("modal-list"),
  $links: document.getElementById("modal-list-links"),
  $buttonSortSize: document.getElementById("modal-list-sort-size"),
  $buttonSortDate: document.getElementById("modal-list-sort-date"),
  visible: false,
  sortAttribute: "size",
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.sortAttribute = "size";
    this.visible = false;
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.setLinks();
    this.visible = true;
  },
  setLinks: function() {
    this.$links.innerHTML = `<ul>${this.props.items
      .sort((a, b) => b[this.sortAttribute] - a[this.sortAttribute])
      .map(item => `<li><a href="${item.href}">${item.caption}</a></li>`)
      .join("")}</ul>`;
  },
  bindEvents: function() {
    this.$buttonSortSize.onclick = event => {
      event.preventDefault();
      this.sortAttribute = "size";
      this.setLinks();
    };
    this.$buttonSortDate.onclick = event => {
      event.preventDefault();
      this.sortAttribute = "date";
      this.setLinks();
    };
  }
};

export default ModalList.initialize();
