const Debug = {
  $debug: null,
  initialize: function() {
    document.getElementById('canvas').insertAdjacentHTML('afterend', '<div id="debug"></div>');
    this.$debug = document.getElementById('debug');
    this.$debug.style.position = 'absolute';
    this.$debug.style.left = '0';
    this.$debug.style.top = '0';
    this.$debug.style.width = '100%';
    this.$debug.style.height = '30px';
    this.$debug.style.background = 'rgba(255,255,255,0.5)';
    return this;
  },
  log: function(text) {
    // $debug.insertBefore(document.createTextNode(text + '...'), $debug.firstChild);
    this.$debug.innerHTML = text;
  }
};

export default Debug.initialize();
