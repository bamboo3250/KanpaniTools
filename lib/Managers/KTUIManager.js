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

    function updateSkillInPanel(employee) {
        var employeePanel = $('#employee-' + employee.card_seq_id);
        for(var j=0;j<employee.equipments.length;j++) {
            var equip = employee.equipments[j];
            if (parseInt(equip.part) != 0) continue;

            var frontSkill = KTGameDataManager.getSkill(equip.front_skill.skill_id);
            var backSkill = KTGameDataManager.getSkill(equip.back_skill.skill_id);

            if (frontSkill) {
                employeePanel.find('.front-skill .skill-details').html(getSkillDetails(frontSkill));
            }
            if (backSkill) {
                employeePanel.find('.back-skill .skill-details').html(getSkillDetails(backSkill));
            }
        }
    }

    function updateEmployeePanel(employeePanel, employee, callback) {
        var charaId = employee.img_dir;
        var name = KTCharacterManager.getEmployeeName(charaId);
        if (!name) name = employee.card_name;

        employeePanel.find('.employee-name').text(name);
        employeePanel.find('.employee-level').text('Lv' + employee.level);
        employeePanel.find('.class-thumbnail').attr('src', 'assets/' + employee.job_id + '.jpg');
        employeePanel.find('.employee-policy').text(POLICIES[employee.policy_type]);

        employeePanel.find('.employee-hp').text(employee.max_hp);
        employeePanel.find('.employee-patk').text(employee.attack);
        employeePanel.find('.employee-pdef').text(employee.defence);
        employeePanel.find('.employee-matk').text(employee.mattack);
        employeePanel.find('.employee-mdef').text(employee.mdefence);
        
        employeePanel.find('.employee-str').text(employee.str);
        employeePanel.find('.employee-vit').text(employee.vit);
        employeePanel.find('.employee-int').text(employee.inte);
        employeePanel.find('.employee-pie').text(employee.pie);
        employeePanel.find('.employee-agi').text(employee.agi);
        employeePanel.find('.employee-dex').text(employee.dex);
        employeePanel.find('.employee-luk').text(employee.luk);
        
        employeePanel.find('.employee-crit').text(employee.critical);
        employeePanel.find('.employee-hit').text(employee.accuracy);
        employeePanel.find('.employee-eva').text(employee.evasion);

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
                var frontSkill = equip.front_skill;
                var attribute = '';
                if (frontSkill.attribute > 0) {
                    //attribute = '<img src="assets/attribute' + frontSkill.attribute + '.png"> ';
                }
                employeePanel.find('.front-skill .skill-name').html(attribute + frontSkill.skill_name);    
                var backSkill = equip.back_skill;
                if (backSkill.attribute > 0) {
                    //attribute = '<img src="assets/attribute' + backSkill.attribute + '.png"> ';
                } else {
                    attribute = '';
                }
                employeePanel.find('.back-skill .skill-name').html(attribute + backSkill.skill_name);
                

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
                    if (url) {
                        employeePanel.find('.armor-thumbnail').attr('src', url);
                    } else {
                        employeePanel.find('.armor-thumbnail').attr('src', 'assets/item_holder.png');
                    }

                    fetchEquipThumbnail(accessoryIconId, function(url) {
                        if (url) {
                            employeePanel.find('.accessory-thumbnail').attr('src', url);
                        } else {
                            employeePanel.find('.accessory-thumbnail').attr('src', 'assets/item_holder.png');
                        }
                        
                        employeePanel.attr('id', 'employee-' + employee.card_seq_id);
                        if (typeof callback == 'function') callback();
                    });
                });
            });
        });
    }

    function loadEmployeePanel(employeePanel, employee, callback) {
        updateEmployeePanel(employeePanel, employee, function() {
            employeePanel.appendTo('#employee-list');
            employeePanel.show();
            updateSkillInPanel(employee);
            if (typeof callback == 'function') callback();
        })
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

    function classSort(a,b) {
        if (a.job_id != b.job_id) return parseInt(a.job_id) - parseInt(b.job_id)
        if (b.rarity != a.rarity) return parseInt(b.rarity) - parseInt(a.rarity);
        if (b.img_dir != a.img_dir) return parseInt(b.img_dir) - parseInt(a.img_dir);
        if (b.transmigration_count != a.transmigration_count) return parseInt(b.transmigration_count) - parseInt(a.transmigration_count);
        return b.level - a.level;
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

    function getRangeTypeName(rangeType) {
        switch(rangeType) {
            case 1:
                return 'Single';
            case 2:
                return 'Column';
            case 3:
                return 'Row';
            case 4:
                return '2x2';
            case 5:
                return 'All';
            case 14:
                return '2 targets';
            case 15:
                return '3 targets';
            case 19:
                return 'V-shaped';
            default:
                return 'Unk #' + rangeType;
        }
    }

    function getSkillDetails(skill) {
        skill.effects.sort(function(a,b) {
            return parseInt(a.effect_index) - parseInt(b.effect_index);
        });

        var text = '';
        for(var i=0;i<skill.effects.length;i++) {
            text += '[';
            var phase = skill.effects[i];
            text += getRangeTypeName(phase.range_type);

            var modifier = (phase.effect_value / (phase.skill_type == 1?1000:100));
            modifier = modifier.toFixed(Math.max(1, (modifier.toString().split('.')[1] || []).length));
            text += ', <b>' + modifier + (phase.effect_count>1?'*' + phase.effect_count:'') + '</b>';

            if (phase.attribute > 0) {
                text += ' <img src="../../assets/attribute' + phase.attribute + '.png">';
            }

            if (phase.long_distance == 1 && phase.magic != 1) text += ' , Long';
            if (phase.magic == 3) text += ', Surehit';

            if (skill.priority == 0) {
                text += ' , Pre-empt';
            } else if (skill.priority == 2) {
                text += ' , Last';
            }
            

            if (phase.recovery && phase.recovery.states && phase.recovery.states.death) {
                text += ', Ressurect';
            }

            if (phase.recovery && phase.recovery_debuff) {
                text += ', Cleanse';
            } else  if (phase.recovery) {
                if (phase.recovery.states) {
                    if ((!phase.recovery.states.death && Object.keys(phase.recovery.states) > 0) 
                            || (phase.recovery.states.death && Object.keys(phase.recovery.states) > 1)) {
                        text += ', Ailment Cleanse';        
                    }
                }
            } else if (phase.recovery_debuff) {
                text += ', Debuff Cleanse';
            }            

            if (phase.buffs) {
                text += ',';
                for(var key in phase.buffs) {
                    var buff = phase.buffs[key];
                    text += ' ' + (buff.rate/10) + '% ' + buff.buff_type;
                    if (buff.params) {
                        var paramsText = '';
                        for(var paramKey in buff.params) {
                            var value = buff.params[paramKey]/10;
                            paramsText += paramKey + '+' + value + '%, '; 
                        }
                        text += ' (' + paramsText + buff.period + ' turn(s))';
                        
                    } else {
                        text += ' (+' + (buff.effect_value/10) + '%, ' + buff.period + ' turn(s))';
                    }
                }
            }

            if (phase.erosion) {
                text += ', ' + (phase.erosion.rate / 10) + '%';
                for(var key in phase.erosion.states) text += ' ' + key;
            }

            if (phase.debuff) {
                text += ', ' + (phase.debuff.rate / 10) + '%';
                for(var key in phase.debuff.debuffs) text += ' ' + key;
            }

            if (phase.properties) {
                text += ', '
                for(var key in phase.properties) {
                    text += (phase.properties[key].effect_value / 10) + '%';
                    text += ' ' + phase.properties[key].property;
                }
            }

            text += ']<br>';
        }

        if (skill.feedback) {
            text += '[Compensation ' + (skill.feedback.effect_value / 10) + '%]<br>';
        }

        return text;
    }

    const BONUS_NAME_MAPPING = {
        'evasion': 'EVA',
        'critical': 'CRIT',
        'accuracy': 'ACC',
        'defence': 'PDEF',
        'mdefence': 'MDEF',
        'attack': 'PATK',
        'mattack': 'MATK',
        'max_hp': 'HP',

        'str': 'STR',
        'vit': 'VIT',
        'inte': 'INT',
        'pie': 'PIE',
        'agi': 'AGI',
        'dex': 'DEX',
        'luk': 'LUK'
    }

    function loadEquipment(panel, part) {
        var employeeId = parseInt(panel.attr('id').split('-')[1]);
        var employee = KTPlayerManager.getCardBySeqId(employeeId);
        for(var i=0;i<employee.equipments.length;i++) {
            var equip = employee.equipments[i];
            if (equip.part != part) continue;

            panel.find('.equip-name').text(equip.equipment_name);
            panel.find('.equip-description').text(equip.description);

            if (equip.attribute > 0) {
                panel.find('.equip-attribute').attr('src', 'assets/attribute' + equip.attribute + '.png');
            } else {
                panel.find('.equip-attribute').attr('src', '');
            }
            
            panel.find('.equip-patk').text(equip.attack);
            panel.find('.equip-matk').text(equip.mattack);
            panel.find('.equip-pdef').text(equip.defence);
            panel.find('.equip-mdef').text(equip.mdefence);
            panel.find('.equip-hit').text(equip.accuracy);
            panel.find('.equip-crit').text(equip.critical);
            panel.find('.equip-eva').text(equip.evasion);

            for(var j=1;j<=3;j++) {
                panel.find('.bonus' + j + '-name').text('');
                panel.find('.bonus' + j + '-value').text('');
            }
            var bonusIndex = 1;
            for(var key in equip.effects) {
                var name = BONUS_NAME_MAPPING[key] || key;
                var value = equip.effects[key];
                panel.find('.bonus' + bonusIndex + '-name').text(name);
                panel.find('.bonus' + bonusIndex + '-value').text(value);
                bonusIndex++;
            }

            var effectText = '';
            if (equip.anti_elements) {
                for(var j=0;j<equip.anti_elements.length;j++) {
                    var antiElement = equip.anti_elements[j];
                    effectText += antiElement.anti_element_name + '+' + antiElement.effect_value + '%<br>';
                }    
            }
            if (equip.anti_features) {
                for(var j=0;j<equip.anti_features.length;j++) {
                    var antiFeature = equip.anti_features[j];
                    effectText += antiFeature.anti_feature_name + '+' + antiFeature.effect_value + '%<br>';
                }
            }
            if (effectText.length > 0) {
                effectText = 'Effect(s): ' + effectText;
            }
            panel.find('.equip-effects').html(effectText);
            return true;
        }
        return false;
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
            } else if ($('#sort-select').val() == 'class') {
                employeeList.sort(classSort);
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
                $('.employee-thumbnail-container').click(function() {
                    var employeePanel = $(this).parent().parent();
                    employeePanel.find('.equipment-details').hide();
                    employeePanel.find('.employee-details').hide();

                    var overlay = $(this).find('.clickable-thumbnail-overlay').first();
                    var selected = overlay.hasClass('selected-thumbnail-overlay');
                    employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');

                    if (!selected) {
                        overlay.addClass('selected-thumbnail-overlay');
                        employeePanel.find('.employee-details').show();
                    }
                });
                $('.weapon-thumbnail-container').click(function() {
                    var employeePanel = $(this).parent().parent();
                    var overlay = $(this).find('.clickable-thumbnail-overlay').first();
                    var selected = overlay.hasClass('selected-thumbnail-overlay');
                    
                    if (!selected) {
                        if (loadEquipment(employeePanel, 0)) {
                            employeePanel.find('.equipment-details').hide();
                            employeePanel.find('.employee-details').hide();
                            employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
                            overlay.addClass('selected-thumbnail-overlay');
                            employeePanel.find('.equipment-details').show();    
                        }
                    } else {
                        employeePanel.find('.equipment-details').hide();
                        employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
                    }
                });
                $('.armor-thumbnail-container').click(function() {
                    var employeePanel = $(this).parent().parent();
                    var overlay = $(this).find('.clickable-thumbnail-overlay').first();
                    var selected = overlay.hasClass('selected-thumbnail-overlay');
                    
                    if (!selected) {
                        if (loadEquipment(employeePanel, 1)) {
                            employeePanel.find('.equipment-details').hide();
                            employeePanel.find('.employee-details').hide();
                            employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
                            overlay.addClass('selected-thumbnail-overlay');
                            employeePanel.find('.equipment-details').show();    
                        }
                    } else {
                        employeePanel.find('.equipment-details').hide();
                        employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
                    }
                });
                $('.accessory-thumbnail-container').click(function() {
                    var employeePanel = $(this).parent().parent();
                    var overlay = $(this).find('.clickable-thumbnail-overlay').first();
                    var selected = overlay.hasClass('selected-thumbnail-overlay');
                    
                    if (!selected) {
                        if (loadEquipment(employeePanel, 2)) {
                            employeePanel.find('.equipment-details').hide();
                            employeePanel.find('.employee-details').hide();
                            employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
                            overlay.addClass('selected-thumbnail-overlay');
                            employeePanel.find('.equipment-details').show();    
                        }
                    } else {
                        employeePanel.find('.equipment-details').hide();
                        employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');
                    }
                });

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
        },

        updateSkillForAll: function() {
            var employeeList = KTPlayerManager.getCardList();
            //console.log(employeeList);
            for(var i=0;i<employeeList.length;i++) {
                this.updateSkill(employeeList[i]);
            }
        },

        updateSkill: function(employee) {
            var employeePanel = $('#employee-' + employee.card_seq_id);
            updateEmployeePanel(employeePanel, employee, function() {
                updateSkillInPanel(employee);
            });
        },

        showPopup: function(title, content) {
            $('#overlay-panel-title').html(title);
            $('#overlay-panel-content').html(content);
            $('#overlay').show();
        }
    }
})();