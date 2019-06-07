export default function initializeTabs($parent, callback) {
  const element = $parent.querySelector(".nav");
  element.addEventListener(
    "click",
    function(event) {
      event.preventDefault();
      let activeTabs = $parent.querySelectorAll(".active");
      activeTabs.forEach(function(tab) {
        tab.className = tab.className.replace("active", "");
      });
      event.target.parentElement.className += " active";
      $parent.querySelector("#" + event.target.href.split("#")[1]).className +=
        " active";
      callback();
    },
    false
  );
}
