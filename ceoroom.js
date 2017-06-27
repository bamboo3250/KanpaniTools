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

  function initCatalog() {
    var characters = KTCharacterManager.characters;
    var getCount = 0;
    for(var i=0;i<characters.length;i++) {
      var id = characters[i]._id;
      var characterClass = classIdToClassName(id.charAt(2));
      var characterRarity = id.charAt(3);

      var imageClass = '';
      if (typeof KTPlayerManager.card_book[id] == 'undefined') {
        imageClass = 'class="gray-image"';
      } else {
        getCount++;
      }
      
      var name = KTCharacterManager.getEmployeeName(id);

      var image = '<img ' + imageClass + ' src="http://67.205.150.236/storage/thumbnail/' + id + '.png" title="' + name + '">';
      $('#catalog-' + characterClass + '-' + characterRarity).append(image);
    }
    $('#catalog-total').text('Total: ' + getCount + '/' + characters.length);
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
      if ((index%100) == 0) {
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
    var name = trim(KTCharacterManager.getEmployeeName(id), 8);

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

    var cards = KTPlayerManager.getCardList();
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

    var cards = KTPlayerManager.getCardList();
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
      }
    });

    Kanpani.init(false, function() {
        initCatalog();
        initEmployeesByRarity();
        initEmployeesByClass();
    });
    
  });
})();