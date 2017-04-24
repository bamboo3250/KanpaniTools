(function(){
  "use strict";

  function openGoogleTranslate(text) {
    text = text.trim();
    if (text.length > 0) {
      window.open('https://translate.google.com/#ja/en/' + text);
    }
  }

  $(document).ready(function() {
    _gaq.push(['_trackPageview']);

    Kanpani.init();
    KTNetworkHandler.init();

    var clipboardBtn = new Clipboard('.copy-btn');
    clipboardBtn.on('success', function(e) {
      var oldValue = $('#copy-quest-log-btn').text();
      $('#copy-quest-log-btn').text('Copied!');
      setTimeout(function() {
        $('#copy-quest-log-btn').text(oldValue);
      }, 1000);
      _gaq.push(['_trackEvent', "Copy Quest Log", 'clicked']);
      e.clearSelection();
    });

    $('#clear-quest-log-btn').click(function() {
      $('#quest-log').text('');
      _gaq.push(['_trackEvent', "Clear Quest Log", 'clicked']);
    });

    $('#translate-btn').click(function() {
      var text = $('#quest-log').text();
      if (text[0] == '|') text = text.substring(1);
      text = text.split('|').join('%0D');
      
      const SCENE_SEPARATOR = '=========End of Scene=========';
      var scenes = text.split(SCENE_SEPARATOR);
      var stack = [];
      var length = 0;

      for(var i=0;i<scenes.length;i++) {
        if (length + scenes[i].length > 4500) {
          if (stack.length == 0) {
            openGoogleTranslate(scenes[i]);
          } else {
            openGoogleTranslate(stack.join(SCENE_SEPARATOR));
            stack = [];
            length = 0;
          }
        } else {
          stack.push(scenes[i]);
          length += scenes[i].length;
        }
      }
      if (stack.length > 0) {
        openGoogleTranslate(stack.join(SCENE_SEPARATOR));
      }
      _gaq.push(['_trackEvent', "Translate Quest Log", 'clicked']);
    });
  });
})();