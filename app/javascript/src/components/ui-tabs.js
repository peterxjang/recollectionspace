export default function initializeTabs($parent, callback) {
  const element = $parent.querySelector(".nav");

  function selectTab($anchor) {
    let activeTabs = $parent.querySelectorAll(".active");
    activeTabs.forEach(function(tab) {
      tab.className = tab.className.replace("active", "");
    });
    $anchor.parentElement.className += " active";
    $parent.querySelector("#" + $anchor.href.split("#")[1]).className +=
      " active";
    callback();
  }

  element.addEventListener(
    "click",
    function(event) {
      event.preventDefault();
      if (event.target.href) {
        selectTab(event.target);
      }
    },
    false
  );

  $parent.disableTab = function(selector) {
    $parent.querySelector(`a[href^="${selector}"]`).parentElement.className +=
      " hidden-tab";
    $parent.querySelector(selector).className += " hidden-tab";
    selectTab($parent.querySelector(`a:not([href='${selector}'])`));
  };

  $parent.resetTabs = function() {
    $parent.querySelectorAll(".hidden-tab").forEach(function(tab) {
      tab.className = tab.className.replace("hidden-tab", "");
    });
    selectTab(element.querySelector("a"));
  };
}
