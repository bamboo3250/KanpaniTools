(function(){
  "use strict";

  function openGoogleTranslate(text) {
    text = text.trim();
    if (text.length > 0) {
      window.open('https://translate.google.com/#ja/en/' + text);
    }
  }

  $(document).ready(function() {
    GA.pageView();

    Kanpani.init();

    var clipboardBtn = new Clipboard('.copy-btn');
    clipboardBtn.on('success', function(e) {
      var oldValue = $('#copy-quest-log-btn').text();
      $('#copy-quest-log-btn').text('Copied!');
      setTimeout(function() {
        $('#copy-quest-log-btn').text(oldValue);
      }, 1000);
      GA.click('Copy Quest Log');
      e.clearSelection();
    });

    $('#clear-quest-log-btn').click(function() {
      $('#quest-log').text('');
      GA.click('Clear Quest Log');
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
      GA.click('Translate Quest Log');
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
      GA.click('Show Quest Log tab');
    });

    $('#employees-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#employees-tab-panel').show();
      GA.click('Show Employees tab');
    });

    $('#teams-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#teams-tab-panel').show();
      GA.click('Show Teams tab');
    });

    $('#battle-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#battle-tab-panel').show();
      GA.click('Show Battle tab');
    });

    $('#settings-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#settings-tab-panel').show();
      GA.click('Show Settings tab');
    });

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
      $('.employee-details').show();
      $('.equipment-details').hide();
      $('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
      $('.employee-thumbnail-container .clickable-thumbnail-overlay').addClass('selected-thumbnail-overlay');
      GA.click('Expand All');
    });

    $('#collapse-btn').click(function() {
      $('.employee-details').hide();
      $('.equipment-details').hide();
      $('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
      GA.click('Collapse All');
    });

    $('.res-raw').click(function(e){
      $('.current-raw').toggle();
      $('.required-raw').toggle();
      e.stopPropagation();
      GA.click('Toggle STR/INT');
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

    $('#strategy-type-select').change(function() {
      $('.employee-policy').hide();
      $('.team-policy').hide();
      var policyType = $(this).val();
      $('.employee-' + policyType + '-policy').show();
      $('.team-' + policyType + '-policy').show();
      KTConfigManager.setPolicyType(policyType);
      KTConfigManager.saveToLocalStorage();
    });
  });
})();