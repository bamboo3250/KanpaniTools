(function(){
  "use strict";

  function openGoogleTranslate(text) {
    text = text.trim();
    if (text.length > 0) {
      window.open('https://translate.google.com/#ja/en/' + text);
    }
  }

  $(document).ready(function() {
    if (!Kanpani.DEBUG) _gaq.push(['_trackPageview']);  

    Kanpani.init();

    var clipboardBtn = new Clipboard('.copy-btn');
    clipboardBtn.on('success', function(e) {
      var oldValue = $('#copy-quest-log-btn').text();
      $('#copy-quest-log-btn').text('Copied!');
      setTimeout(function() {
        $('#copy-quest-log-btn').text(oldValue);
      }, 1000);
      if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Copy Quest Log", 'clicked']);
      e.clearSelection();
    });

    $('#clear-quest-log-btn').click(function() {
      $('#quest-log').text('');
      if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Clear Quest Log", 'clicked']);
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
      if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Translate Quest Log", 'clicked']);
    });

    $('#cookies-hack').click(function() {
      var oldValue = $(this).text();

      postMessageToBackground('hackCookies');

      $('#cookies-hack').text('Applied');
      setTimeout(function() {
        $('#cookies-hack').text('Redirecting...');
        setTimeout(function() {
          $('#cookies-hack').text(oldValue);
        }, 1000);
      }, 1000);
    });

    $('#quest-log-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#quest-log-tab-panel').show();
    });

    $('#employees-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#employees-tab-panel').show();
    });

    $('#teams-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#teams-tab-panel').show();
    })

    $('#sort-select').change(function() {
      KTUIManager.updateEmployeeList();
    });

    $('.class-check').change(function() {
      KTUIManager.updateEmployeeList();
    });

    $('#all-class-check').change(function() {
      $('.class-check').prop('checked', $(this).prop('checked'));
      KTUIManager.updateEmployeeList();
    });    

    $('#expand-btn').click(function() {
      if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Expand All", 'clicked']);
      $('.employee-details').show();
      $('.equipment-details').hide();
      $('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
      $('.employee-thumbnail-container .clickable-thumbnail-overlay').addClass('selected-thumbnail-overlay');
    });

    $('#collapse-btn').click(function() {
      if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Collapse All", 'clicked']);
      $('.employee-details').hide();
      $('.equipment-details').hide();
      $('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
    });

    $('.res-raw').click(function(e){
      $('.current-raw').toggle();
      $('.required-raw').toggle();
      e.stopPropagation();
    });

    function hideOverlay() {
      $('#overlay').animate({
        opacity: 0.0
      }, 100, function() {
        $('#overlay').hide();
      });
    }

    $('#overlay').click(function() {
      hideOverlay();
    });

    $('#overlay-panel').click(function(e) {
      e.stopPropagation();
    });

    $('#overlay-panel-close-btn').click(function() {
      hideOverlay();
    });
  });
})();