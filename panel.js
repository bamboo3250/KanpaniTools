(function(){
  "use strict";

  function openGoogleTranslate(text) {
    text = text.trim();
    if (text.length > 0) {
      window.open('https://translate.google.com/#ja/en/' + text);
    }
  }

  function logout() {
    window.KTUIManager.logout();
  }

  $(document).ready(function() {
    GA.pageView();

    Kanpani.init(true);
    $(document).tooltip();

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

    $('#news-tab-btn').click(function() {
      $('.tab-btn').removeClass('tab-active-btn');
      $(this).addClass('tab-active-btn');

      $('.tab-content-panel').hide();
      $('#news-tab-panel').show();
      GA.click('Show News tab');
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
      KTConfigManager.setSortBy($(this).val());
      KTConfigManager.saveToLocalStorage();
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
      $('.employee-normal-policy').hide();
      $('.employee-raid-policy').hide();
      $('.team-policy').hide();
      var policyType = $(this).val();
      $('.employee-' + policyType + '-policy').show();
      $('.team-' + policyType + '-policy').show();
      KTConfigManager.setPolicyType(policyType);
      KTConfigManager.saveToLocalStorage();
    });

    $('#additional-info-select').change(function() {
      var type = $(this).val();
      $('.employee-policy').hide();
      $('.employee-current-exp-container').hide();
      $('.employee-remain-exp-container').hide();
      $('.employee-height').hide();

      if (type == 'strategy') {
        $('.employee-policy').show();
      } else if (type == 'current-exp') {
        $('.employee-current-exp-container').show();
      } else if (type == 'remain-exp') {
        $('.employee-remain-exp-container').show();
      } else if (type == 'height') {
        $('.employee-height').show();
      }
      KTConfigManager.setEmployeesTabAdditionalInfo(type);
      KTConfigManager.saveToLocalStorage();
    });

    $('#include-in-news-checkbox').change(function() {
      KTConfigManager.setIncludeInNews($(this).prop('checked'));
      KTConfigManager.saveToLocalStorage();
    });

    $('#news-refresh-select').change(function() {
      KTConfigManager.setNewsRefreshInterval($(this).val());
      KTConfigManager.saveToLocalStorage();
      Kanpani.initFetchGameLog();
    });

    $('#news-order-select').change(function() {
      KTConfigManager.setNewsOrder($(this).val());
      KTConfigManager.saveToLocalStorage();
      KTUIManager.refreshNews();
    });

    $('#language-select').change(function() {
      var lang = $(this).val();
      KTConfigManager.setLanguage(lang);
      KTConfigManager.saveToLocalStorage();
      KTUIManager.changeContentLanguage(lang);
    });

    $('#ui-language-select').change(function() {
      var lang = $(this).val();
      KTConfigManager.setUiLanguage(lang);
      KTConfigManager.saveToLocalStorage();
      KTUIManager.changeUiLanguage(lang);
    });

    $('#clear-storage-btn').click(function() {
      chrome.storage.local.clear(function() {
        chrome.storage.local.get(null, function(items) {
            console.log(items);
        });
      });
    });

    $('#login-btn').click(function() {
      $('#email').prop('disabled', true);
      $('#password').prop('disabled', true);
      $(this).prop('disabled', true);
      $('#login-error').text('');  

      $.post(Kanpani.HOST + '/connect', {
        'email': $('#email').val(),
        'password': $('#password').val()
      }, function(response) {

        if (response.code == 0) {
          $('#login-error').text(response.data);  
        } else {

          var playerId = window.KTPlayerManager.getPlayerId();
          window.KTPlayerManager.k_token[playerId] = response.data.k_token;
          window.KTPlayerManager.k_username[playerId] = response.data.username;
          window.KTPlayerManager.saveToLocalStorage();

          $('#logged-in-user-info').html('You are now logged in as <b>' + response.data.username + '</b>.');
          $('#login-table').hide();
          $('#logged-in-user-section').show();
        }

        $('#email').prop('disabled', false);
        $('#password').prop('disabled', false);
        $(this).prop('disabled', false);
      });
    });

    $('#logout-btn').click(logout);

  });
})();