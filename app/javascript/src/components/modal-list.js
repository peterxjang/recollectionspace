const ModalList = {
  props: null,
  $modal: document.getElementById("modal-list"),
  $header: document.getElementById("modal-list-header"),
  $links: document.getElementById("modal-list-links"),
  $selectSort: document.getElementById("modal-list-sort"),
  visible: false,
  sortAttribute: "size",
  initialize: function() {
    this.bindEvents();
    return this;
  },
  hide: function() {
    this.$modal.style.display = "none";
    this.visible = false;
  },
  show: function(props) {
    this.props = props;
    this.$modal.style.display = "block";
    this.$modal.scrollTo(0, 0);
    this.$header.innerText = props.headerText || "Items";
    this.sortAttribute = "size";
    this.$selectSort.value = "size";
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
    this.$selectSort.onchange = event => {
      event.preventDefault();
      console.log("select change", event.target.value);
      this.sortAttribute = event.target.value;
      this.setLinks();
    };
  }
};

export default ModalList.initialize();
