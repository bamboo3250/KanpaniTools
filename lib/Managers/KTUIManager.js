(function(){
    "use strict";
    
    //const HOST = 'http://localhost:8000';
    const HOST = 'http://67.205.150.236';

    function fetchCharaThumbnail(charaId, callback) {
        var url = HOST + '/chara_thumbnail/' + charaId;
        if (typeof window.KTUIManager.urlMapping[url] != 'undefined') {
            callback(window.KTUIManager.urlMapping[url]);
            return;
        }

        $.ajax({
            url: url
        }).done(function(data) {
            window.KTUIManager.urlMapping[url] = HOST + data;
            callback(HOST + data);
        }).fail(function() {
            console.log('failed');
        });
    }

    function fetchEquipThumbnail(equipId, callback) {
        if (!equipId) {
            callback();
            return;
        }
        var url = HOST + '/equip_thumbnail/' + equipId;
        if (typeof window.KTUIManager.urlMapping[url] != 'undefined') {
            callback(window.KTUIManager.urlMapping[url]);
            return;
        }

        $.ajax({
            url: url
        }).done(function(data) {
            window.KTUIManager.urlMapping[url] = HOST + data;
            callback(HOST + data);
        }).fail(function() {
            console.log('failed');
        });
    }

    var queue = [];

    function loadEmployeePanelFromQueue(iter, callback) {
        if (iter >= queue.length) {
            callback();
            return;
        }

        loadEmployeePanel(queue[iter].panel, queue[iter].employee, function() {
            loadEmployeePanelFromQueue(iter+1, callback);
        })
    }

    const POLICIES = {
        "1": "Go for the Leader!",
        "2": "Go for the Peppy!",
        "3": "Go for Wounded!",
        "4": "Go for the Tough!",
        "5": "Crush Weaklings!",
        "6": "Stop the AoE!",
        "7": "Cover the Rear!",
        "8": "Stop the Spells!",
        "9": "Put Down Healer!",
        "10": "Just Go Get 'Em!"
    }

    function loadEmployeePanel(employeePanel, employee, callback) {

        var charaId = employee.img_dir;
        var name = KTCharacterManager.getEmployeeName(charaId);
        if (!name) name = employee.card_name;
        employeePanel.find('.employee-name').text(name);
        employeePanel.find('.employee-level').text('Lv' + employee.level);
        employeePanel.find('.class-thumbnail').attr('src', 'assets/' + employee.job_id + '.jpg');
        employeePanel.find('.employee-policy').text(POLICIES[employee.policy_type]);

        var promo = parseInt(employee.transmigration_count);
        if (promo > 0) {
            employeePanel.find('.promo-thumbnail').attr('src', 'assets/promo' + promo + '.png');
        }

        var weaponIconId = null;
        var armorIconId = null;
        var accessoryIconId = null;

        for(var j=0;j<employee.equipments.length;j++) {
            var equip = employee.equipments[j];
            if (equip.part == 0) { // weapon
                weaponIconId = equip.icon_id;

            } else if (equip.part == 1) { // armor
                armorIconId = equip.icon_id;

            } else if (equip.part == 2) { // acc
                accessoryIconId = equip.icon_id;

            } else if (equip.part == 3) { // mirror

            }
        }

        fetchCharaThumbnail(charaId, function(url) {
            employeePanel.find('.employee-thumbnail').attr('src', url);

            fetchEquipThumbnail(weaponIconId, function(url) {
                if (url) employeePanel.find('.weapon-thumbnail').attr('src', url);

                fetchEquipThumbnail(armorIconId, function(url) {
                    if (url) employeePanel.find('.armor-thumbnail').attr('src', url);

                    fetchEquipThumbnail(accessoryIconId, function(url) {
                        if (url) employeePanel.find('.accessory-thumbnail').attr('src', url);

                        employeePanel.appendTo('#employee-list');
                        employeePanel.show();
                        callback();
                    });
                });
            });
        });
    }

    function filterClass(list) {
        var result = [];
        var filter = {
            "101": $('#fighter-check').prop('checked'),
            "102": $('#ronin-check').prop('checked'),
            "103": $('#archer-check').prop('checked'),
            "104": $('#soldier-check').prop('checked'),
            "105": $('#warrior-check').prop('checked'),
            "106": $('#cleric-check').prop('checked'),
            "107": $('#rogue-check').prop('checked'),
            "108": $('#mage-check').prop('checked'),
        }
        for(var i=0;i<list.length;i++) {
            if (filter[list[i].job_id]) result.push(list[i]);
        }
        return result;
    } 

    function highestLevelSort(a,b) {
        if (b.transmigration_count != a.transmigration_count) return parseInt(b.transmigration_count) - parseInt(a.transmigration_count);
        if (b.level != a.level) return b.level - a.level;
        return parseInt(a.img_dir) - parseInt(b.img_dir);
    }

    function lowestLevelSort(a,b) {
        return highestLevelSort(b,a);
    }

    function highestRaritySort(a,b) {
        if (b.rarity != a.rarity) return parseInt(b.rarity) - parseInt(a.rarity);
        return parseInt(a.img_dir) - parseInt(b.img_dir);
    }

    function lowestRaritySort(a,b) {
        return highestRaritySort(b,a);
    }

    function updateSlot(slotSelector, employee) {
        if (!employee) {
            $(slotSelector + ' .team-class-thumbnail').attr('src', '');
            $(slotSelector + ' .team-promo-thumbnail').attr('src', '');
            $(slotSelector + ' .team-leader-thumbnail').attr('src', '');
            $(slotSelector + ' .team-employee-thumbnail').attr('src', '');
            return;
        }

        $(slotSelector + ' .team-class-thumbnail').attr('src', 'assets/' + employee.job_id + '.jpg');
        var promo = parseInt(employee.transmigration_count);
        if (promo > 0) {
            $(slotSelector + ' .team-promo-thumbnail').attr('src', 'assets/promo' + promo + '.png');
        } else {
            $(slotSelector + ' .team-promo-thumbnail').attr('src', '');
        }
        var leader = parseInt(employee.leader);
        if (leader > 0) {
            $(slotSelector + ' .team-leader-thumbnail').attr('src', 'assets/leader.png');
        } else {
            $(slotSelector + ' .team-leader-thumbnail').attr('src', '');
        }

        var charaId = employee.img_dir;
        fetchCharaThumbnail(charaId, function(url) {
            $(slotSelector + ' .team-employee-thumbnail').attr('src', url);
        });
    }

    function getTeamPolicy(deck) {
        for(var i=0;i<6;i++) {
            var employee = deck[''+i];
            if (!employee) continue;
            if (employee.leader == '1') {
                return POLICIES[employee.policy_type]
            }
        }
        return '';
    }

    window.KTUIManager = {
        urlMapping: {
            version: 0
        },

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'urlMapping': self.urlMapping
            });
        },

        loadFromLocalStorage: function(callback) {
            var self = this;
            chrome.storage.local.get('urlMapping', function(data) {
                if (data && data.urlMapping && data.urlMapping.version == self.urlMapping.version) {
                    self.urlMapping = data.urlMapping;
                }
                if (typeof callback == 'function') callback();
            });
        },

        updateUI: function() {
            var displayedName = KTPlayerManager.getPlayerName();
            if (displayedName.length>10) {
                displayedName = displayedName.substr(0, 10) + '...';
            }
            $('#player-name').text(displayedName);

            var food        = KTPlayerManager.getResource('food');
            var maxFood     = KTPlayerManager.getResource('max_food');
            var regenFood   = KTPlayerManager.getRecover('food');

            var iron        = KTPlayerManager.getResource('iron');
            var maxIron     = KTPlayerManager.getResource('max_iron');
            var regenIron   = KTPlayerManager.getRecover('iron');

            var stone       = KTPlayerManager.getResource('stone');
            var maxStone    = KTPlayerManager.getResource('max_stone');
            var regenStone  = KTPlayerManager.getRecover('stone');

            var wood        = KTPlayerManager.getResource('wood');
            var maxWood     = KTPlayerManager.getResource('max_wood');
            var regenWood   = KTPlayerManager.getRecover('wood');

            $('#text-food').text(food + '/' + maxFood + ' (+' + regenFood + ')');
            $('#text-iron').text(iron + '/' + maxIron + ' (+' + regenIron + ')');
            $('#text-wood').text(wood + '/' + maxWood + ' (+' + regenWood + ')');
            $('#text-stone').text(stone + '/' + maxStone + ' (+' + regenStone + ')');
            
            if (maxFood > 0) $('#cur-food').width($('#player-food').width()*food/maxFood);
            if (maxIron > 0) $('#cur-iron').width($('#player-iron').width()*iron/maxIron);
            if (maxWood > 0) $('#cur-wood').width($('#player-wood').width()*wood/maxWood);
            if (maxStone > 0) $('#cur-stone').width($('#player-stone').width()*stone/maxStone);
        },

        appendToQuestLog: function(text) {
            $('#quest-log').append('|' + text + '<br>');
        },

        setResourceTimer: function(type, text) {
            $('#timer-' + type).text(text);
        },

        updateEmployeeList: function(employeeList) {
            if (typeof employeeList == 'undefined') {
                employeeList = KTPlayerManager.getCardList();
            }

            $('#employee-list').empty();
            queue = [];

            employeeList = filterClass(employeeList);

            if ($('#sort-select').val() == 'highest-level') {
                employeeList.sort(highestLevelSort);
            } else if ($('#sort-select').val() == 'lowest-level') {
                employeeList.sort(lowestLevelSort);
            } else if ($('#sort-select').val() == 'highest-rarity') {
                employeeList.sort(highestRaritySort);
            } else if ($('#sort-select').val() == 'lowest-rarity') {
                employeeList.sort(lowestRaritySort);
            }

            for(var i=0;i<employeeList.length;i++) {
                var employee = employeeList[i];
                var employeePanel = $('#employee-template').clone();
                queue.push({
                    employee: employee,
                    panel: employeePanel
                });
            }
            var self = this;
            loadEmployeePanelFromQueue(0, function() {
                self.saveToLocalStorage();
            });
        },

        updateDeck: function(index) {
            if (index < 0 || index > 5) return;

            var deck = KTPlayerManager.getDeck(index);
            var teamPanelSelector = '#team-panel-' + index;
            if (!deck) {
                for(var i=0;i<6;i++) {
                    var slotSelector = teamPanelSelector + ' .team-slot-' + i;
                    updateSlot(slotSelector, null);
                    $(teamPanelSelector + ' .team-policy').text('');
                }                
                return;
            }

            for(var i=0;i<6;i++) {
                var slotSelector = teamPanelSelector + ' .team-slot-' + i;
                var employee = deck[''+i];

                updateSlot(slotSelector, employee);
                var teamPolicy = getTeamPolicy(deck);
                $(teamPanelSelector + ' .team-policy').text(teamPolicy);
            }
        },

        updateAllTeams: function() {
            for(var i=0;i<6;i++) {
                this.updateDeck(''+i);
            }
        }
    }
})();