(function(){
  "use strict";

  function classIdToClassName(classId) {
    switch(classId) {
      case '1':
        return 'fighter';
      case '2':
        return 'ronin';
      case '3':
        return 'archer';
      case '4':
        return 'soldier';
      case '5':
        return 'warrior';
      case '6':
        return 'cleric';
      case '7':
        return 'rogue';
      default:
        return 'magician';
    }
  }

  function hasVoiceStone(chara) {
    if (typeof chara.voices == 'undefined') return false;
    for(var i=0;i<chara.voices.length;i++) {
      if (chara.voices[i] == 'v016') return true;
    }
    return false;
  }

  function initCatalog() {
    var characterDict = KTGameDataManager.charaLibrary;
    var getCount = 0;
    var player = KTPlayerManager.getPlayer();
    if (!player) return;

    for(var charaId in characterDict) {
      var id = charaId;
      var characterClass = classIdToClassName(id.charAt(2));
      var characterRarity = id.charAt(3);
      var name = KTGameDataManager.getEmployeeName(id);
      
      var imageClass = '';
      var hasVS = false;
      if (typeof player.cardBook[id] == 'undefined') {
        imageClass = 'class="gray-image"';
      } else {
        getCount++;
        hasVS = hasVoiceStone(player.cardBook[id]);
      }
        
      var image = '<div class="catalogs-character"><img ' + imageClass + ' src="http://67.205.150.236/storage/thumbnail/' + id + '.png" title="' + name + '"><img class="catalogs-vs" src="./assets/voice_stone.png" ' + (hasVS?'':'hidden') + '></div>';
      $('#catalog-' + characterClass + '-' + characterRarity).append(image);
    }
    $('#catalog-total').text('Total: ' + getCount + '/' + Object.keys(characterDict).length);
  }

  function trim(text, maxLength) {
    if (text.length > maxLength) {
      return text.substr(0, maxLength) + '...';
    }
    return text;
  }

  function loadEmployeePanelRecursively(cards, index, type, callback) {
    if (index >= cards.length) {
      if (typeof callback == 'function') callback();
      return;
    }
    loadEmployeePanel(cards[index], type, function() {
      if ((index%100) == 99) {
        setTimeout(function() {
          loadEmployeePanelRecursively(cards, index+1, type, callback);    
        }, 0);
      } else {
        loadEmployeePanelRecursively(cards, index+1, type, callback);
      }
      
    });
  }

  function loadEmployeePanel(card, type, callback) {
    var employeePanel = $('#employee-panel-template').clone();
    var id = card.img_dir;
    var name = card.card_name;
    var engName = KTGameDataManager.getEmployeeName(id);
    if (engName) name = engName;
    name = trim(name, 8);

    employeePanel.find('.employee-thumbnail').attr('src', 'http://67.205.150.236/storage/thumbnail/' + id + '.png');
    employeePanel.find('.employee-name').text(name);
    
    var awakenPoint = parseInt(card.extension_count);
    var maxAwakenPoint = parseInt(card.max_extension_count);
    var awakenText = '';
    for(var j=0;j<maxAwakenPoint;j++) {
      if (j < awakenPoint) {
         awakenText += '<img src="assets/awakening_on.png">';
      } else {
        awakenText += '<img src="assets/awakening_off.png">';
      }
    }
    employeePanel.find('.employee-awaken').html(awakenText);

    var promo = parseInt(card.transmigration_count);
    if (promo > 0) {
      employeePanel.find('.employee-level').html('<img height="12px" src="./assets/promo' + promo + '.png"> Lv' + card.level);
    } else {
      employeePanel.find('.employee-level').html('Lv' + card.level);
    }

    var weaponIconId = null;
    var armorIconId = null;
    var accessoryIconId = null;

    for(var j=0;j<card.equipments.length;j++) {
      var equip = card.equipments[j];
      if (equip.part == 0) { // weapon
        weaponIconId = equip.icon_id;

      } else if (equip.part == 1) { // armor
        armorIconId = equip.icon_id;

      } else if (equip.part == 2) { // acc
        accessoryIconId = equip.icon_id;

      } else if (equip.part == 3) { // mirror

      }
    }

    window.KTUIManager.fetchCharaThumbnail(id, function(url) {
        employeePanel.find('.employee-thumbnail').attr('src', url);

        KTUIManager.fetchEquipThumbnail(weaponIconId, function(url) {
            if (url) employeePanel.find('.employee-weapon').attr('src', url);

            KTUIManager.fetchEquipThumbnail(armorIconId, function(url) {
                if (url) {
                    employeePanel.find('.employee-armor').attr('src', url);
                } else {
                    employeePanel.find('.employee-armor').attr('src', 'assets/item_holder.png');
                }

                KTUIManager.fetchEquipThumbnail(accessoryIconId, function(url) {
                    if (url) {
                        employeePanel.find('.employee-accessory').attr('src', url);
                    } else {
                        employeePanel.find('.employee-accessory').attr('src', 'assets/item_holder.png');
                    }
                    
                    if (type == 'rarity') {
                      var rarity = id.charAt(3);
                      $('#employees-by-rarity-' + rarity).append(employeePanel);
                      if ($('#employees-by-rarity-equipment').prop('checked')) {
                        employeePanel.find('.employee-equipment').show();
                      }

                    } else if (type == 'class') {
                      var classId = id.charAt(2);
                      $('#employees-by-class-' + classId).append(employeePanel);  
                      if ($('#employees-by-class-equipment').prop('checked')) {
                        employeePanel.find('.employee-equipment').show();
                      }
                    }
                    
                    employeePanel.show();
                    if (typeof callback == 'function') callback();
                });
            });
        });
    });
  }

  function idSort(a, b) {
    return parseInt(a.img_dir) - parseInt(b.img_dir);
  }

  function loadEmployeesByRarity() {
    $('#employees-by-rarity-1').empty();
    $('#employees-by-rarity-2').empty();
    $('#employees-by-rarity-3').empty();
    $('#employees-by-rarity-4').empty();
    $('#employees-by-rarity-5').empty();

    var player = KTPlayerManager.getPlayer();
    if (!player) return;

    var cards = player.getCardList();
    //console.log(cards);
    var filteredCards = [];
    for(var i=0;i<cards.length;i++) {
      var card = cards[i];
      var classId = card.img_dir.charAt(2);
      var promo = card.transmigration_count;
      var level = card.level;

      if (!$('#employees-by-rarity-class-' + classId).prop('checked')) continue;
      if (promo > 0) {
        if (!$('#employees-by-rarity-promo-' + promo).prop('checked')) continue;
      } else {
        if (level > 1) {
          if (!$('#employees-by-rarity-promo-0').prop('checked')) continue;
        } else {
          if (!$('#employees-by-rarity-level-1').prop('checked')) continue;
        }
      }
      filteredCards.push(cards[i]);
    }

    filteredCards.sort(idSort);

    loadEmployeePanelRecursively(filteredCards, 0, 'rarity', function() {
      // $('.employee-panel').click(function() {
      //   $(this).find('.employee-equipment').toggle();
      // });
    });
  }

  function initEmployeesByRarity() {
    loadEmployeesByRarity();
    
    $('.employees-by-rarity-filter').change(function() {
      loadEmployeesByRarity();
    });

    $('#employees-by-rarity-equipment').change(function() {
      if ($(this).prop('checked')) {
        $('#main-tab-content-employees-by-rarity .employee-equipment').show();
      } else {
        $('#main-tab-content-employees-by-rarity .employee-equipment').hide();
      }
    });

    $('#employees-by-rarity-class-all').change(function() {
      $('.employees-by-rarity-class').prop('checked', $(this).prop('checked'));
      loadEmployeesByRarity();
    });

    $('#employees-by-class-rarity-all').change(function() {
      $('.employees-by-class-rarity').prop('checked', $(this).prop('checked'));
      loadEmployeesByClass();
    });
  }

  function loadEmployeesByClass() {
    $('#employees-by-class-1').empty();
    $('#employees-by-class-2').empty();
    $('#employees-by-class-3').empty();
    $('#employees-by-class-4').empty();
    $('#employees-by-class-5').empty();
    $('#employees-by-class-6').empty();
    $('#employees-by-class-7').empty();
    $('#employees-by-class-8').empty();

    var player = KTPlayerManager.getPlayer();
    if (!player) return;
    
    var cards = player.getCardList();
    cards.sort(idSort);

    var filteredCards = [];
    for(var i=cards.length-1;i>=0;i--) {
      var card = cards[i];
      var rarity = card.img_dir.charAt(3);
      var promo = card.transmigration_count;
      var level = card.level;

      if (!$('#employees-by-class-rarity-' + rarity).prop('checked')) continue;
      if (promo > 0) {
        if (!$('#employees-by-class-promo-' + promo).prop('checked')) continue;
      } else {
        if (level > 1) {
          if (!$('#employees-by-class-promo-0').prop('checked')) continue;
        } else {
          if (!$('#employees-by-class-level-1').prop('checked')) continue;
        }
      }
      filteredCards.push(cards[i]);
    }

    loadEmployeePanelRecursively(filteredCards, 0, 'class', function() {
      // $('.employee-panel').click(function() {
      //   $(this).find('.employee-equipment').toggle();
      // });
    });
  }

  function initEmployeesByClass() {
    loadEmployeesByClass();
    
    $('.employees-by-class-filter').change(function() {
      loadEmployeesByClass();
    });

    $('#employees-by-class-equipment').change(function() {
      if ($(this).prop('checked')) {
        $('#main-tab-content-employees-by-class .employee-equipment').show();
      } else {
        $('#main-tab-content-employees-by-class .employee-equipment').hide();
      }
    });
  }

  function sortyBySkillId(a, b) {
    return a.skill_id - b.skill_id;
  }

  function initSkills() {
    var skills = KTGameDataManager.skillLibrary;

    var total = 0;
    for(var key in skills) {
      var skill = skills[key];
      var skillId = skill.skill_id + '';
      var classId = skillId.charAt(2);
      var skillType = skillId.charAt(3);
      if (skillType == '5' || skillType == '7' || skillType == '8') { //cw
        skillType = 'cw';
      } else if (skillType == '6' || skillType == '9') { //event
        skillType = 'event';
      } else {
        skillType = 'regular';
      }

      var rowText = '<td>' + skillId + '</td>';
      rowText += '<td>' + skill.skill_name + '</td>';
      rowText += '<td>' + skill.en_name + '</td>';
      rowText += '<td>' + skill.zh_name + '</td>';

      if (skillType == 'cw') {
        var text = '';
        if (skill.exclusive) {
          text = '<img src="' + Kanpani.HOST + '/storage/thumbnail/' + skill.exclusive + '.png">'
          text += ' <span>' + KTGameDataManager.getEmployeeName(skill.exclusive) + '</span>';
        }
        rowText += '<td>' + text + '</td>';        
      }

      if (skill.attribute > 0) {
        rowText += '<td><img src="../../assets/attribute' + skill.attribute + '.png"></td>';  
      } else {
        rowText += '<td>None</td>';
      }
      rowText += '<td>' + KTUIManager.getSkillDetails(skill) + '</td>';

      

      $('#skills-table-' + classId + '-' + skillType + ' tbody').append('<tr>' + rowText + '</tr>');
      total++;
    }
    $('#main-tab-btn-skills').append(' (' + total + ')')
  }

  function loadSmallItemIcon(imageId) {
    KTUIManager.fetchSmallItemThumbnail(imageId, function(url) {
      $('.item-image-' + imageId).attr('src', url);
    });

    return '<img class="item-image-' + imageId + '" />';
  }

  function initGameLogs() {
    var player = KTPlayerManager.getPlayer();
    if (!player) {
      $('#draw-logs-table tbody').html('<tr><td colspan="8">No available log</td></tr>');
      return;
    }

    var gameLogs = KTGameLogManager.getDrawLogs();
    if (!gameLogs || gameLogs.length < 1) {
      $('#draw-logs-table tbody').html('<tr><td colspan="8">No available log</td></tr>');
      return;
    }

    $('#draw-logs-table tbody').empty();
    for(var i=0;i<gameLogs.length;i++) {
      var gameLog = gameLogs[i];
      console.log(gameLog);

      var rowText = '<tr>';
      rowText += '<td>' + gameLog.type + '</td>';         // Type

      var resultText = '';
      for(var j=0;j<gameLog.data.params.length;j++) {
        var param = gameLog.data.params[j];
        if (typeof param == 'object' && typeof param['image_id'] != 'undefined') {
          var imageId = param['image_id'];

          var imgTag = loadSmallItemIcon(imageId);
          resultText += imgTag;
        }
      }

      rowText += '<td>' + resultText + '</td>';  // Item

      resultText = '';
      for(var j=0;j<gameLog.data.cards.length;j++) {
        var cardId = gameLog.data.cards[j];
        resultText += '<img src="' + Kanpani.HOST + '/storage/thumbnail/' + cardId + '.png">';
      }
      rowText += '<td>' + resultText + '</td>';   // Result

      var effectsText = '';
      for(var j=0;j<gameLog.data.effects.length;j++) {
        var effect = gameLog.data.effects[j];
        if (effect.image_name && effect.image_name.length > 0) {
          effectsText += '<img src="' + Kanpani.HOST + '/storage/item_effect/' + effect.image_name + '.png">';
        }
      }
      rowText += '<td>' + effectsText + '</td>'; // Item Effect(s)
      rowText += '<td>' + (gameLog.data.PRLevel ? gameLog.data.PRLevel : 'N.A') + '</td>';                     // PR Level
      rowText += '<td>' + (gameLog.data.PRDescription ? gameLog.data.PRDescription.word : 'N.A') + '</td>';  // PR Ads
      

      resultText = '';
      for(var j=0;j<gameLog.data.cardsInPR.length;j++) {
        var cardId = gameLog.data.cardsInPR[j].img_dir;
        resultText += '<img src="' + Kanpani.HOST + '/storage/thumbnail/' + cardId + '.png">';
      }
      rowText += '<td>' + resultText + '</td>'; // PR Staffs
      rowText += '<td>' + (gameLog.timestamp?gameLog.timestamp:'N.A') + '</td>';     // Timestamp
      rowText += '</tr>';

      $('#draw-logs-table tbody').append(rowText);
    }
  }

  $(document).ready(function() {
    GA.pageView();

    $(document).tooltip();

    $('.main-tab-btn').click(function() {
      $('.main-tab-btn').removeClass('active-main-tab-btn');
      $(this).addClass('active-main-tab-btn');

      $('.main-tab-content').hide();
      var id = $(this).attr('id');
      
      if (id == 'main-tab-btn-catalog') {
        $('#main-tab-content-catalog').show();
        GA.click('Open Catalogs');

      } else if (id == 'main-tab-btn-employees-by-rarity') {
        $('#main-tab-content-employees-by-rarity').show();
        GA.click('Open Employees by Rarity');
      
      } else if (id == 'main-tab-btn-employees-by-class') {
        $('#main-tab-content-employees-by-class').show();
        GA.click('Open Employees by Class');
      
      } else if (id == 'main-tab-btn-skills') {
        $('#main-tab-content-skills').show();
        GA.click('Open Skills');
      
      } else if (id == 'main-tab-btn-gacha-logs') {
        $('#main-tab-content-gacha-logs').show();
        GA.click('Open Gacha Logs');
      
      }
    });

    $('#clear-logs-btn').click(function() {
      KTGameLogManager.clearGameLogs();
      initGameLogs();
    });

    Kanpani.init(false, function() {
        initCatalog();
        initEmployeesByRarity();
        initEmployeesByClass();
        initSkills();
        initGameLogs();
    });
    
  });
})();