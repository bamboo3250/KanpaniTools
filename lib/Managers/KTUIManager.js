(function(){
    "use strict";
    
    function fetchImagesRecursively(urls, iter, callback) {
        var url = urls[iter];

        if (iter >= urls.length) {
            callback();
            return;
        }

        if (typeof window.KTUIManager.urlMapping[url] != 'undefined') {
            fetchImagesRecursively(urls, iter+1, callback);
            return;
        }

        $.ajax({
            url: url
        }).done(function(data) {
            window.KTUIManager.urlMapping[url] = window.Kanpani.HOST + data;
            fetchImagesRecursively(urls, iter+1, callback);
        }).fail(function() {
            Kanpani.log('Fetching Image failed');
        });
    }

    var queue = [];

    function loadEmployeePanelFromQueue(iter, callback) {
        if (iter >= queue.length) {
            callback();
            return;
        }

        var employeePanel = queue[iter].panel;
        var employee = queue[iter].employee;
        updateEmployeePanel(employeePanel, employee, function() {
            employeePanel.appendTo('#employee-list');
            employeePanel.show();
            updateSkillInPanel(employee);

            if ((iter%100) == 99) {
                setTimeout(function() {
                    loadEmployeePanelFromQueue(iter+1, callback);
                }, 0);    
            } else {
                loadEmployeePanelFromQueue(iter+1, callback);
            }
            
        });
    }

    function updateSkillInPanel(employee) {
        var employeePanel = $('#employee-' + employee.card_seq_id);
        for(var j=0;j<employee.equipments.length;j++) {
            var equip = employee.equipments[j];
            if (parseInt(equip.part) != 0) continue;

            var frontSkill = KTGameDataManager.getSkill(equip.front_skill.skill_id);
            var backSkill = KTGameDataManager.getSkill(equip.back_skill.skill_id);

            if (frontSkill) {
                employeePanel.find('.front-skill .skill-details').html(window.KTUIManager.getSkillDetails(frontSkill));
            }
            if (backSkill) {
                employeePanel.find('.back-skill .skill-details').html(window.KTUIManager.getSkillDetails(backSkill));
            }
        }
    }

    function updateSelectedEquipSlot(panel) {
        var selectedOverlay = panel.find('.selected-thumbnail-overlay').first();
        var parent = selectedOverlay.parent();
        if (parent.hasClass('weapon-thumbnail-container')) {
            loadEquipment(panel, 0);    
        } else if (parent.hasClass('armor-thumbnail-container')) {
            loadEquipment(panel, 1);    
        } else if (parent.hasClass('accessory-thumbnail-container')) {
            loadEquipment(panel, 2);    
        }
    }

    const BUILDING_NAME_MAPPING = {
        'publicity': 'PR',
        'resource': 'Res',
        'product': 'Lab'
    }

    const negativeAbility = [
        10103,
        10401,
        10403,
        10404,
        11301,
        20201,
        30108,
        60002
    ];

    function updateEmployeePanel(employeePanel, employee, callback) {
        var charaId = employee.img_dir;
        var name = KTGameDataManager.getEmployeeName(charaId, KTTranslationManager.contentLang) || employee.card_name;
        
        employeePanel.attr('id', 'employee-' + employee.card_seq_id);
        employeePanel.find('.employee-name').text(name);
        employeePanel.find('.employee-level').text('Lv' + employee.level);
        employeePanel.find('.class-thumbnail').attr('src', 'assets/' + employee.job_id + '.jpg');

        if (window.KTPlayerManager.getKToken()) {
            var kUsername = window.KTPlayerManager.getKUsername();
            var url = window.Kanpani.HOST + '/employee/' + kUsername + '/' + employee.card_seq_id;
            employeePanel.find('.see-more-url').attr('url', url);
            employeePanel.find('.see-more-url').show();
        } else {
            employeePanel.find('.see-more-url').hide();
        }
        employeePanel.find('.class-thumbnail')

        var policyName = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_NAME_' + employee.policy_type);
        var policyDesc = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_DESC_' + employee.policy_type);
        var raidPolicyName = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_NAME_' + employee.vs_boss_policy_type);
        var raidPolicyDesc = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_DESC_' + employee.vs_boss_policy_type);
        var height = parseInt(employee.stature)/10;

        employeePanel.find('.employee-normal-policy').text(policyName);
        employeePanel.find('.employee-normal-policy').attr('title', policyDesc);
        employeePanel.find('.employee-raid-policy').text(raidPolicyName);
        employeePanel.find('.employee-raid-policy').attr('title', raidPolicyDesc);
        employeePanel.find('.employee-height').text(height + ' cm');

        var currentExp = parseInt(employee.exp);
        var baseExp = parseInt(employee.base_exp);
        var nextExp = parseInt(employee.next_exp);
        var nextText = KTTranslationManager.getContentTranslatedText('EMPLOYEES_EXP_NEXT');

        employeePanel.find('.employee-current-exp-text').text('Cur: ' + currentExp.toLocaleString('en-US') + ' EXP');
        if (nextExp > 0) {
            employeePanel.find('.employee-current-exp').width((currentExp-baseExp)/(nextExp-baseExp)*100);
            employeePanel.find('.employee-remain-exp-text').text(nextText + ': ' + (nextExp-currentExp).toLocaleString('en-US') + ' EXP');
            employeePanel.find('.employee-remain-exp').width((currentExp-baseExp)/(nextExp-baseExp)*100);    
        } else {
            employeePanel.find('.employee-current-exp').width(100);
            employeePanel.find('.employee-remain-exp-text').text(nextText + ': 0 EXP');
            employeePanel.find('.employee-remain-exp').width(100);    
        }

        var assignment = '';
        if (employee.assigned) {
            assignment = BUILDING_NAME_MAPPING[employee.assigned_building_id];
        } else if (typeof employee.deck_index != 'undefined' && employee.deck_index != null) {
            assignment = (parseInt(employee.deck_index) + 1);
        }
        employeePanel.find('.employee-assignment').text(assignment);

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

        var awakenPoint = parseInt(employee.extension_count);
        var maxAwakenPoint = parseInt(employee.max_extension_count);
        var awakenText = '';
        for(var i=0;i<maxAwakenPoint;i++) {
            if (i < awakenPoint) {
                awakenText += '<img src="assets/awakening_on.png">';
            } else {
                awakenText += '<img src="assets/awakening_off.png">';
            }
        }
        employeePanel.find('.employee-awaken').html(awakenText);

        var promo = parseInt(employee.transmigration_count);
        if (promo > 0) {
            employeePanel.find('.promo-thumbnail').attr('src', 'assets/promo' + promo + '.png');
        }

        var weaponIconId = null;
        var armorIconId = null;
        var accessoryIconId = null;

        var equipBonusCount = 0;
        employeePanel.find('.bonus-table tbody').empty();
        var resistCount = 0;
        employeePanel.find('.resist-table tbody').empty();
        
        for(var j=0;j<employee.equipments.length;j++) {
            var equip = employee.equipments[j];

            if (equip.part == 0) { // weapon
                
                weaponIconId = equip.icon_id;
                var frontSkill = equip.front_skill;
                var frontSkillName = frontSkill.skill_name;
                var libFrontSkill = KTGameDataManager.getSkill(frontSkill.skill_id);
                if (libFrontSkill) {
                    if (libFrontSkill.en_name && KTTranslationManager.contentLang == KTConst.language.EN) {
                        frontSkillName = libFrontSkill.en_name;
                    }
                    if (libFrontSkill.zh_name && KTTranslationManager.contentLang == KTConst.language.ZH) {
                        frontSkillName = libFrontSkill.zh_name;
                    }
                }

                employeePanel.find('.front-skill .skill-name').html(frontSkillName);

                var backSkill = equip.back_skill;
                var backSkillName = backSkill.skill_name;
                var libBackSkill = KTGameDataManager.getSkill(backSkill.skill_id);
                if (libBackSkill) {
                    if (libBackSkill.en_name && KTTranslationManager.contentLang == KTConst.language.EN) {
                        backSkillName = libBackSkill.en_name;
                    }
                    if (libBackSkill.zh_name && KTTranslationManager.contentLang == KTConst.language.ZH) {
                        backSkillName = libBackSkill.zh_name;
                    }
                    
                }
                employeePanel.find('.back-skill .skill-name').html(backSkillName);
                

            } else if (equip.part == 1) { // armor
                armorIconId = equip.icon_id;

            } else if (equip.part == 2) { // acc
                accessoryIconId = equip.icon_id;

            } else if (equip.part == 3) { // mirror

            }

            if (equip.anti_elements) {
                for(var k=0;k<equip.anti_elements.length;k++) {
                    var antiElement = equip.anti_elements[k];
                    var effectText = getTranslatedBuffType(antiElement.anti_element_name) + '+' + antiElement.effect_value + '%';
                    employeePanel.find('.resist-table tbody').append('<tr><td>' + effectText + '</td></tr>');
                    resistCount++;
                }    
            }
            if (equip.anti_features) {
                for(var k=0;k<equip.anti_features.length;k++) {
                    var antiFeature = equip.anti_features[k];
                    var effectText = getTranslatedBuffType(antiFeature.anti_feature_name) + '+' + antiFeature.effect_value + '%';
                    employeePanel.find('.bonus-table tbody').append('<tr><td>' + effectText + '</td></tr>');
                    equipBonusCount++;
                }
            }
        }

        if (employee.abilities) {
            for (var k=0;k<employee.abilities.length;k++) {
                var ability = employee.abilities[k];
                var abilityId = ability.ability_type;
                var abilityValue = ability.ability_value;

                var translatedAbilityName = KTTranslationManager.getUITranslatedText('EMPLOYEES_ABILITY_NAME_' + abilityId);
                if (translatedAbilityName.includes('EMPLOYEES_ABILITY_NAME_')) {
                    translatedAbilityName = abilityId;
                }
                var signText = (negativeAbility.includes(abilityId) ? '-' : '+');

                if (abilityId == 10301 || abilityId == 10302) {
                    abilityValue /= 10;
                }

                var effectText = translatedAbilityName + ' ' + signText + abilityValue/10 + '%';
                if (abilityId != 10101 && abilityValue > 0) {
                    abilityValue = abilityValue/10 + '%';
                }
                if (abilityValue == 0) {
                    if (abilityId == 31005) {
                        signText = '=';    
                    } else {
                        abilityValue = '';
                        signText = '';
                    }
                }
                effectText = translatedAbilityName + signText + abilityValue;

                employeePanel.find('.bonus-table tbody').append('<tr><td>' + effectText + '</td></tr>');
                equipBonusCount++;
            }
        }

        for (var debuffKey in employee.resists) {
            if (employee.resists[debuffKey] > 0) {
                employeePanel.find('.resist-table tbody').append('<tr><td>' + getTranslatedBuffType(debuffKey) + ' +' + (employee.resists[debuffKey]/10) + '%</td></tr>');
                resistCount++;
            }
        }

        if (employee.debuff_resists) {
            for (var debuffKey in employee.debuff_resists) {
                if (employee.debuff_resists[debuffKey] > 0) {
                    employeePanel.find('.resist-table tbody').append('<tr><td>' + getTranslatedBuffType(debuffKey) + ' +' + (employee.debuff_resists[debuffKey]/10) + '%</td></tr>');
                    resistCount++;
                }
            }
        }

        if (equipBonusCount == 0) {
            employeePanel.find('.bonus-table tbody').append('<tr><td>' + KTTranslationManager.getContentTranslatedText('EMPLOYEES_NONE') + '</td></tr>');
        }
        if (resistCount == 0) {
            employeePanel.find('.resist-table tbody').append('<tr><td>' + KTTranslationManager.getContentTranslatedText('EMPLOYEES_NONE') + '</td></tr>');
        }


        KTUIManager.fetchCharaThumbnail(charaId, function(url) {
            employeePanel.find('.employee-thumbnail').attr('src', url);

            KTUIManager.fetchEquipThumbnail(weaponIconId, function(url) {
                if (url) employeePanel.find('.weapon-thumbnail').attr('src', url);

                KTUIManager.fetchEquipThumbnail(armorIconId, function(url) {
                    if (url) {
                        employeePanel.find('.armor-thumbnail').attr('src', url);
                    } else {
                        employeePanel.find('.armor-thumbnail').attr('src', 'assets/item_holder.png');
                    }

                    KTUIManager.fetchEquipThumbnail(accessoryIconId, function(url) {
                        if (url) {
                            employeePanel.find('.accessory-thumbnail').attr('src', url);
                        } else {
                            employeePanel.find('.accessory-thumbnail').attr('src', 'assets/item_holder.png');
                        }
                        
                        if (typeof callback == 'function') callback();
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
        if (a.img_dir != b.img_dir) return parseInt(a.img_dir) - parseInt(b.img_dir);
        return highestLevelSort(a, b);
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

    function assignmentSort(a, b) {
        if (a.deck_index && b.deck_index) {
            return parseInt(a.deck_index) - parseInt(b.deck_index);
        }
        if (a.deck_index) return -1;
        if (b.deck_index) return 1;

        if (a.assigned && b.assigned) {
            return a.assigned_building_id.localeCompare(b.assigned_building_id);
        }
        if (a.assigned) return -1;
        if (b.assigned) return 1;

        return highestLevelSort(a, b);
    }

    function nameSort(a, b) {
        var nameA = KTGameDataManager.getEmployeeName(a.img_dir);
        if (!nameA) nameA = employee.card_name;
        var nameB = KTGameDataManager.getEmployeeName(b.img_dir);
        if (!nameB) nameB = employee.card_name;
        if (nameA != nameB) return nameA.localeCompare(nameB);
        if (b.transmigration_count != a.transmigration_count) return parseInt(b.transmigration_count) - parseInt(a.transmigration_count);
        return b.level - a.level;
    }

    function strSort(a, b) {
        if (a.str != b.str) return parseInt(b.str) - parseInt(a.str);
        return highestLevelSort(a, b);
    }

    function vitSort(a, b) {
        if (a.vit != b.vit) return parseInt(b.vit) - parseInt(a.vit);
        return highestLevelSort(a, b);
    }
    
    function intSort(a, b) {
        if (a.inte != b.inte) return parseInt(b.inte) - parseInt(a.inte);
        return highestLevelSort(a, b);
    }
    
    function pieSort(a, b) {
        if (a.pie != b.pie) return parseInt(b.pie) - parseInt(a.pie);
        return highestLevelSort(a, b);
    }
    
    function dexSort(a, b) {
        if (a.dex != b.dex) return parseInt(b.dex) - parseInt(a.dex);
        return highestLevelSort(a, b);
    }
    
    function agiSort(a, b) {
        if (a.agi != b.agi) return parseInt(b.agi) - parseInt(a.agi);
        return highestLevelSort(a, b);
    }
    
    function lukSort(a, b) {
        if (a.luk != b.luk) return parseInt(b.luk) - parseInt(a.luk);
        return highestLevelSort(a, b);
    }

    function hpSort(a, b) {
        if (a.max_hp != b.max_hp) return parseInt(b.max_hp) - parseInt(a.max_hp);
        return highestLevelSort(a, b);
    }

    function patkSort(a, b) {
        if (a.attack != b.attack) return parseInt(b.attack) - parseInt(a.attack);
        return highestLevelSort(a, b);
    }

    function pdefSort(a, b) {
        if (a.defence != b.defence) return parseInt(b.defence) - parseInt(a.defence);
        return highestLevelSort(a, b);
    }

    function matkSort(a, b) {
        if (a.mattack != b.mattack) return parseInt(b.mattack) - parseInt(a.mattack);
        return highestLevelSort(a, b);
    }

    function mdefSort(a, b) {
        if (a.mdefence != b.mdefence) return parseInt(b.mdefence) - parseInt(a.mdefence);
        return highestLevelSort(a, b);
    }
    
    function normalStrategySort(a, b) {
        if (a.policy_type != b.policy_type) return parseInt(b.policy_type) - parseInt(a.policy_type);
        return classSort(a, b);
    }
    
    function raidStrategySort(a, b) {
        if (a.vs_boss_policy_type != b.vs_boss_policy_type) return parseInt(b.vs_boss_policy_type) - parseInt(a.vs_boss_policy_type);
        return classSort(a, b);
    }

    function heightSort(a, b) {
        if (a.stature != b.stature) return parseInt(b.stature) - parseInt(a.stature);
        return classSort(a, b);
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
        KTUIManager.fetchCharaThumbnail(charaId, function(url) {
            $(slotSelector + ' .team-employee-thumbnail').attr('src', url);
        });
    }

    function getTeamPolicy(deck) {
        for(var i=0;i<6;i++) {
            var employee = deck[''+i];
            if (!employee) continue;
            if (employee.leader == '1') {
                var policyName = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_NAME_' + employee.policy_type);
                var policyDesc = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_DESC_' + employee.policy_type);
                var raidPolicyName = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_NAME_' + employee.vs_boss_policy_type);
                var raidPolicyDesc = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_DESC_' + employee.vs_boss_policy_type);
                
                return {
                    'normal': {
                        'name': policyName,
                        'desc': policyDesc
                    },
                    'raid': {
                        'name': raidPolicyName,
                        'desc': raidPolicyDesc
                    }
                };
            }
        }
        return {
            'normal': {
                'name': '',
                'desc': ''
            },
            'raid': {
                'name': '',
                'desc': ''
            }
        };
    }

    function getRangeTypeName(rangeType) {
        switch(rangeType) {
            case 1:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_1';
            case 2:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_2';
            case 3:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_3';
            case 4:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_4';
            case 5:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_5';
            case 14:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_14';
            case 15:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_15';
            case 16:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_16';
            case 19:
                return 'EMPLOYEES_SKILL_RANGE_TYPE_19';
            default:
                return 'Unk #' + rangeType;
        }
    }

    const BONUS_NAME_MAPPING = {
        'evasion'   : 'EMPLOYEES_EVASION',
        'critical'  : 'EMPLOYEES_CRITICAL',
        'accuracy'  : 'EMPLOYEES_ACCURACY',
        'attack'    : 'EMPLOYEES_PATK',
        'mattack'   : 'EMPLOYEES_MATK',
        'defence'   : 'EMPLOYEES_PDEF',
        'mdefence'  : 'EMPLOYEES_MDEF',
        'max_hp'    : 'HP',

        'str'       : 'STR',
        'vit'       : 'VIT',
        'inte'      : 'INT',
        'pie'       : 'PIE',
        'agi'       : 'AGI',
        'dex'       : 'DEX',
        'luk'       : 'LUK'
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
                var name = KTTranslationManager.getUITranslatedText(BONUS_NAME_MAPPING[key]) || key;
                var value = equip.effects[key];
                panel.find('.bonus' + bonusIndex + '-name').text(name);
                panel.find('.bonus' + bonusIndex + '-value').text(value);
                bonusIndex++;
            }

            return true;
        }
        return false;
    }

    function clearBattleUnitSlot(side, slot) {
        var teamPanel = $('#' + side + '-team-panel');
        var unitPanel = teamPanel.find('.battle-team-slot-' + slot).first();
        teamPanel.find('.team-policy').text('');
        unitPanel.find('.team-employee-thumbnail').attr('src', '');
        unitPanel.find('.battle-promo-thumbnail').attr('src', '');
        unitPanel.find('.battle-leader-thumbnail').attr('src', '');
        unitPanel.find('.battle-element-thumbnail').attr('src', '');
        unitPanel.find('.battle-current-hp').width(0);
        unitPanel.find('.battle-current-hp-text').text('');
        unitPanel.find('.battle-ko').attr('src', '');
        unitPanel.find('.battle-unit-info').text('');
    }

    function loadBattleUnit(unit) {
        var name    = unit.card_name;
        var element = parseInt(unit.attribute);
        var imageDir = unit.img_dir;
        var isLeader = unit.leader;
        var maxHP = unit.max_life;
        var curHP = unit.now_life;
        var strategy = unit.policy_type;
        var raidStrategy = unit.vs_boss_policy_type;
        var isEnemy = (unit.side == 'left');
        var slot = unit.slot;
        var promo = parseInt(unit.transmigration_count);
        var features = unit.features;

        if (raidStrategy == 0) {
            raidStrategy = strategy;
        }

        var jobId = unit.job_id;
        if (jobId.length == 3) {
            jobId = jobId.substr(0, 2) + '0';
        }

        var teamPanel = $('#' + (isEnemy?'enemy':'ally') + '-team-panel');
        var unitPanel = teamPanel.find('.battle-team-slot-' + slot).first();
        
        unitPanel.find('.team-employee-thumbnail').attr('src', '/assets/loading.gif');
        if (isLeader) {
            var policyName = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_NAME_' + strategy);
            var policyDesc = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_DESC_' + strategy);
            var raidPolicyName = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_NAME_' + raidStrategy);
            var raidPolicyDesc = KTTranslationManager.getContentTranslatedText('EMPLOYEES_POLICY_DESC_' + raidStrategy);
            
            teamPanel.find('.battle-normal-policy').text(policyName);
            teamPanel.find('.battle-normal-policy').attr('title', policyDesc);
            teamPanel.find('.battle-raid-policy').text(raidPolicyName);
            teamPanel.find('.battle-raid-policy').attr('title', raidPolicyDesc);
            unitPanel.find('.battle-leader-thumbnail').attr('src', 'assets/leader.png');
        }
        if (promo > 0) {
            unitPanel.find('.battle-promo-thumbnail').attr('src', 'assets/promo' + promo + '.png');
        }
        if (curHP == 0) {
            unitPanel.find('.battle-ko').attr('src', 'assets/ko.png');
        }

        unitPanel.find('.battle-current-hp').width(unitPanel.find('.battle-hp-container').first().width()*curHP/maxHP);
        unitPanel.find('.battle-current-hp-text').text(curHP);


        var translatedName = KTGameDataManager.getEmployeeName(imageDir);
        if (translatedName && KTTranslationManager.contentLang != 'jp') name = translatedName;

        if (element > 0) {
            unitPanel.find('.battle-element-thumbnail').attr('src', 'assets/attribute' + element + '.png');
            //name = '<img src="assets/attribute' + element + '.png"> ' + name;
        }
        var featuresText = '';
        var featuresTooltip = '';
        if (features) {
            for(var i=0;i<features.length;i++) {
                if (i<3) featuresText += features[i].trimWithDotTrailing(9) + '<br>';
                featuresTooltip += features[i] + '<br>';
            }
        }
        unitPanel.find('.battle-unit-info').html(featuresText);
        unitPanel.find('.battle-unit-info').attr('title', featuresTooltip);
        unitPanel.find('.battle-unit-info').tooltip({
            content: function() {
                return $(this).attr('title');
            }
        });

        if (imageDir != '') {
            KTUIManager.fetchCharaThumbnail(imageDir, function(url) {
                unitPanel.find('.team-employee-thumbnail').attr('src', url);
            });    
        } else {
            unitPanel.find('.team-employee-thumbnail').attr('src', '');
        }
    }

    function getTranslatedBuffType(buffName) {
        if (!buffName) return null;
        var buffName = buffName.replace('(','').replace(')','').toUpperCase();
        var translatedBuffType = KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_BUFF_TYPE_' + buffName);
        if (translatedBuffType.includes('EMPLOYEES_SKILL_BUFF_TYPE_')) {
            return buffName;
        }
        return translatedBuffType;
    }

    function appendNewsLogToNews(logId, content, imageUrl) {
        var newsRow = $('#news-template').clone();
        newsRow.attr('id', 'news-row-' + logId);
        newsRow.find('.news-row-content').html(content);
        if (imageUrl) {
            newsRow.find('.news-row-image').attr('src', imageUrl);    
        }
        
        KTUIManager.appendToNews(newsRow);
        newsRow.show();
    }

    function handleNews(log, callback) {
        var content = log.content;
        var logId = '<b>[#' + log.id + ']</b> ';

        content = content.replace('promotion_1', '<b>Senior Staff (主任)</b>');
        content = content.replace('promotion_2', '<b>Section Manager (課長)</b>');
        content = content.replace('promotion_3', '<b>Assistant Director (次長)</b>');
        
        var playerLevelText = '';
        if (typeof log.player_level != 'undefined' && log.player_level != '') {
            playerLevelText = ' (Lv' + (log.player_level) + ')';
        }

        var playerLevel = parseInt(log.player_level || '0');

        var playerNameText = log.player_name + playerLevelText;
        var playerNameClass = '';
        if (41 <= playerLevel && playerLevel < 51) {
            playerNameClass = 'player-41-50';
        } else if (51 <= playerLevel && playerLevel < 61) {
            playerNameClass = 'player-51-60';
        } else if (61 <= playerLevel && playerLevel < 71) {
            playerNameClass = 'player-61-70';
        } else if (71 <= playerLevel && playerLevel < 81) {
            playerNameClass = 'player-71-80';
        } else if (81 <= playerLevel) {
            playerNameClass = 'player-81';
        } 

        playerNameText = '<span class="' + playerNameClass + '">' + playerNameText + (log.player_id == '325386'?' <img src="./assets/leader.png">':'') + '</span>';

        var startPos = content.indexOf('{');
        if (startPos > -1) {
            var endPos = content.indexOf('}');
            var originalText = content.substring(startPos, endPos+1);
            var text = content.substring(startPos+1, endPos);
            var params = text.split(',');
            if (params[0] == 'equipment') {
                var iconId = params[1];
                var name = params[2] || '';

                window.KTUIManager.fetchEquipThumbnail(iconId, function(url) {
                    if (url) {
                        content = content.replace(originalText, '<b>' + name + '</b>');
                        content = logId + '<b>' + playerNameText + '</b> ' + content + '!';
                        appendNewsLogToNews(log.id, content, url);
                    }
                    callback();
                });
            } else if (params[0] == 'chara') {
                var iconId = params[1];
                var name = KTGameDataManager.getEmployeeName(iconId) || '';

                window.KTUIManager.fetchCharaThumbnail(iconId, function(url) {
                    if (url) {
                        content = content.replace(originalText, '<b>' + name + '</b>');
                        content = logId + '<b>' + playerNameText + '</b> ' + content + '!';
                        appendNewsLogToNews(log.id, content, url);
                    }
                    callback();
                });
            }
        } else {
            content = logId + '<b>' + playerNameText + '</b> ' + content + '!';
            appendNewsLogToNews(log.id, content);
            callback();
        }
    }

    function handleNewsRecursively(logs, index) {
        if (index >= logs.length) return;

        handleNews(logs[index], function() {
            handleNewsRecursively(logs, index+1);
        });
    }

    window.KTUIManager = {
        urlMapping: {
            version: 0
        },
        features: {},

        sync: function(callback) {
            var self = this;
            self.loadFromLocalStorage(function() {
                Kanpani.log('KTUIManager loaded', true);
                self.changeUiLanguage(KTConfigManager.config['ui_language'], function() {
                    Kanpani.log('Language ' + KTConfigManager.config['ui_language'] + ' loaded', true);
                    if (typeof callback == 'function') callback();
                });
            });
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

        fetchCharaThumbnail: function(charaId, callback) {
            var url = Kanpani.HOST + '/chara_thumbnail/' + charaId;
            fetchImagesRecursively([url], 0, function() {
                callback(window.KTUIManager.urlMapping[url]);
            });
        },

        fetchEquipThumbnail: function(equipId, callback) {
            if (!equipId) {
                callback();
                return;
            }
            var url = Kanpani.HOST + '/equip_thumbnail/' + equipId;
            fetchImagesRecursively([url], 0, function() {
                callback(window.KTUIManager.urlMapping[url]);
            });
        },

        fetchLargeEquipThumbnail: function(equipId, callback) {
            if (!equipId) {
                callback();
                return;
            }
            var url = Kanpani.HOST + '/large_equip_thumbnail/' + equipId;
            fetchImagesRecursively([url], 0, function() {
                callback(window.KTUIManager.urlMapping[url]);
            });
        },

        updateResourceUI: function(setFood, setIron, setStone, setWood) {
            var displayedName = KTPlayerManager.getPlayerName();
            if (displayedName.length>10) {
                displayedName = displayedName.substr(0, 10) + '...';
            }
            $('#player-name').text(displayedName);

            var food        = KTPlayerManager.getResource('food');
            var maxFood     = KTPlayerManager.getResource('max_food');
            var regenFood   = KTPlayerManager.getRecover('food');
            if (typeof setFood != 'undefined') food = setFood;

            var iron        = KTPlayerManager.getResource('iron');
            var maxIron     = KTPlayerManager.getResource('max_iron');
            var regenIron   = KTPlayerManager.getRecover('iron');
            if (typeof setIron != 'undefined') iron = setIron;

            var stone       = KTPlayerManager.getResource('stone');
            var maxStone    = KTPlayerManager.getResource('max_stone');
            var regenStone  = KTPlayerManager.getRecover('stone');
            if (typeof setStone != 'undefined') stone = setStone;

            var wood        = KTPlayerManager.getResource('wood');
            var maxWood     = KTPlayerManager.getResource('max_wood');
            var regenWood   = KTPlayerManager.getRecover('wood');
            if (typeof setWood != 'undefined') wood = setWood;

            $('#text-food').text(food + '/' + maxFood + ' (+' + regenFood + ')');
            $('#text-iron').text(iron + '/' + maxIron + ' (+' + regenIron + ')');
            $('#text-wood').text(wood + '/' + maxWood + ' (+' + regenWood + ')');
            $('#text-stone').text(stone + '/' + maxStone + ' (+' + regenStone + ')');
            
            if (maxFood > 0) $('#cur-food').width($('#player-food').width()*Math.min(1.0, food/maxFood));
            if (maxIron > 0) $('#cur-iron').width($('#player-iron').width()*Math.min(1.0, iron/maxIron));
            if (maxWood > 0) $('#cur-wood').width($('#player-wood').width()*Math.min(1.0, wood/maxWood));
            if (maxStone > 0) $('#cur-stone').width($('#player-stone').width()*Math.min(1.0, stone/maxStone));
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
            
            employeeList = filterClass(employeeList);

            if ($('#sort-select').val() == 'highest-level') {
                employeeList.sort(highestLevelSort);
            } else if ($('#sort-select').val() == 'lowest-level') {
                employeeList.sort(lowestLevelSort);
            } else if ($('#sort-select').val() == 'highest-rarity') {
                employeeList.sort(highestRaritySort);
            } else if ($('#sort-select').val() == 'lowest-rarity') {
                employeeList.sort(lowestRaritySort);
            } else if ($('#sort-select').val() == 'assignment') {
                employeeList.sort(assignmentSort);
            } else if ($('#sort-select').val() == 'class') {
                employeeList.sort(classSort);
            } else if ($('#sort-select').val() == 'name') {
                employeeList.sort(nameSort);
            } else if ($('#sort-select').val() == 'str') {
                employeeList.sort(strSort);
            } else if ($('#sort-select').val() == 'vit') {
                employeeList.sort(vitSort);
            } else if ($('#sort-select').val() == 'int') {
                employeeList.sort(intSort);
            } else if ($('#sort-select').val() == 'pie') {
                employeeList.sort(pieSort);
            } else if ($('#sort-select').val() == 'dex') {
                employeeList.sort(dexSort);
            } else if ($('#sort-select').val() == 'agi') {
                employeeList.sort(agiSort);
            } else if ($('#sort-select').val() == 'luk') {
                employeeList.sort(lukSort);
            } else if ($('#sort-select').val() == 'hp') {
                employeeList.sort(hpSort);
            } else if ($('#sort-select').val() == 'patk') {
                employeeList.sort(patkSort);
            } else if ($('#sort-select').val() == 'pdef') {
                employeeList.sort(pdefSort);
            } else if ($('#sort-select').val() == 'matk') {
                employeeList.sort(matkSort);
            } else if ($('#sort-select').val() == 'mdef') {
                employeeList.sort(mdefSort);
            } else if ($('#sort-select').val() == 'normal-strategy') {
                employeeList.sort(normalStrategySort);
            } else if ($('#sort-select').val() == 'raid-strategy') {
                employeeList.sort(raidStrategySort);
            } else if ($('#sort-select').val() == 'height') {
                employeeList.sort(heightSort);
            }

            queue = [];
            for(var i=0;i<employeeList.length;i++) {
                var employee = employeeList[i];
                var employeePanel = $('#employee-template').clone();
                queue.push({
                    employee: employee,
                    panel: employeePanel
                });
            }
            var self = this;
            $('.employees-filter-widget').prop('disabled', true);
            loadEmployeePanelFromQueue(0, function() {

                $('.see-more-url').click(function() {
                  var url = $(this).attr('url');
                  window.open(url, '_blank');
                });

                $('.employees-filter-widget').prop('disabled', false);
                $('.employee-thumbnail-container').click(function() {
                    var employeePanel = $(this).parent().parent();
                    var isHidden = employeePanel.find('.employee-details').is(':hidden');
                    
                    employeePanel.find('.equipment-details').hide();
                    employeePanel.find('.employee-details').hide();

                    //var overlay = $(this).find('.clickable-thumbnail-overlay').first();
                    employeePanel.find('.selected-thumbnail-overlay').removeClass('selected-thumbnail-overlay');

                    if (isHidden) {
                        //overlay.addClass('selected-thumbnail-overlay');
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
            }
            var teamPolicy = getTeamPolicy(deck);
            $(teamPanelSelector + ' .team-normal-policy').text(teamPolicy['normal'].name);
            $(teamPanelSelector + ' .team-normal-policy').attr('title', teamPolicy['normal'].desc);
            $(teamPanelSelector + ' .team-raid-policy').text(teamPolicy['raid'].name);
            $(teamPanelSelector + ' .team-raid-policy').attr('title', teamPolicy['raid'].desc);
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
                updateSelectedEquipSlot(employeePanel);
                updateSkillInPanel(employee);
            });
        },

        showPopup: function(title, content) {
            $('#overlay-panel-title').html(title);
            $('#overlay-panel-content').html(content);
            $('#overlay').show();
        },

        fetchImages: function(urls, callback) {
            fetchImagesRecursively(urls, 0, callback);
        },

        fetchItemEffects: function(itemEffectNames, callback) {
            var urls = [];
            for(var i=0;i<itemEffectNames.length;i++) {
                urls.push(Kanpani.HOST + '/item_effect/' + itemEffectNames[i]);
            }
            fetchImagesRecursively(urls, 0, function() {
                callback();
            });
        },

        updateRawResources: function(employees) {
            if (typeof employees == 'undefined') {
                employees = KTPlayerManager.card_list;
            }
            
            var sumInt = 0;
            var sumStr = 0;
            var remainInt = 0;
            var remainStr = 0;

            for(var i=0;i<employees.length;i++) {
                if (employees[i].assigned && employees[i].assigned_building_id == 'resource') {
                    sumInt += parseInt(employees[i].inte);
                    sumStr += parseInt(employees[i].str);
                }
            }

            for(var i=1,j=1; i<=sumInt; j+=2) {
                i += j;
                if (i > sumInt) remainInt = i - sumInt;
            }
            for(var i=1,j=1; i<=sumStr; j+=2) {
                i += j;
                if (i > sumStr) remainStr = i - sumStr;
            }

            const nextText = KTTranslationManager.getUITranslatedText('RESOURCE_NEXT');

            $('#res-raw-wood .current-raw').html('STR: ' + sumStr);
            $('#res-raw-iron .current-raw').html('STR: ' + sumStr);
            $('#res-raw-stone .current-raw').html('STR: ' + sumStr);
            $('#res-raw-food .current-raw').html('INT: ' + sumInt);
            $('#res-raw-wood .required-raw').html(nextText + ': ' + remainStr);
            $('#res-raw-iron .required-raw').html(nextText + ': ' + remainStr);
            $('#res-raw-stone .required-raw').html(nextText + ': ' + remainStr);
            $('#res-raw-food .required-raw').html(nextText + ': ' + remainInt);
        },

        updateBattle: function(body) {
            $('#battle-icon').show();
            $('#raid-accessory').hide();

            for(var i=0;i<6;i++) {
                clearBattleUnitSlot('enemy', i);
                clearBattleUnitSlot('ally', i);
            }
            

            var units = body.units;
            for(var i=0;i<units.length;i++) {
                loadBattleUnit(units[i]);
            }
        },

        updateSettings: function() {
            var policyType = KTConfigManager.config['strategy_type'];
            $('#strategy-type-select').val(policyType);
            
            $('.employee-normal-policy').hide();
            $('.employee-raid-policy').hide();
            $('.employee-' + policyType + '-policy').show();
            
            $('.team-policy').hide();
            $('.team-' + policyType + '-policy').show();

            $('#sort-select').val(KTConfigManager.config['sort_by']);

            $('#additional-info-select').val(KTConfigManager.config['employees_additional_info']);
            $('#additional-info-select').trigger('change');

            $('#include-in-news-checkbox').prop('checked', KTConfigManager.config['include_in_news']);
            $('#news-refresh-select').val(KTConfigManager.config['news_refresh_interval']);
            $('#news-order-select').val(KTConfigManager.config['news_order']);

            $('#language-select').val(KTConfigManager.config['language']);
            $('#ui-language-select').val(KTConfigManager.config['ui_language']);
        },

        getSkillDetails: function(skill) {
            skill.effects.sort(function(a,b) {
                return parseInt(a.effect_index) - parseInt(b.effect_index);
            });

            var text = '';
            var skillId = skill.skill_id + '';
            var classId = skillId.charAt(2);
            for(var i=0;i<skill.effects.length;i++) {
                text += '[';
                var phase = skill.effects[i];

                var targetType = phase.target;
                if (targetType == 1) {
                    text += KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_ALLY_BUFF') + ', ';
                } else if (targetType == 2) {
                    text += KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_SELF_BUFF') + ', ';
                }

                text += KTTranslationManager.getUITranslatedText(getRangeTypeName(phase.range_type));

                var modifier = (phase.effect_value / (phase.skill_type == 1?1000:100));
                modifier = modifier.toFixed(Math.max(1, (modifier.toString().split('.')[1] || []).length));

                if (phase.effect_type == 2) {
                    text += ', <b>' + phase.effect_value + (phase.effect_count>1?'*' + phase.effect_count:'') + ' ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_DAMAGE') + '</b>';
                } else {
                    text += ', <b>' + modifier + (phase.effect_count>1?'*' + phase.effect_count:'') + '</b>';    
                }
                

                if (phase.attribute > 0) {
                    text += ' <img src="../../assets/attribute' + phase.attribute + '.png">';
                }

                if (phase.long_distance == 1 && phase.magic != 1 && classId != '3') text += ' , ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_LONG');
                if (phase.magic == 3 || (phase.magic == 1 && classId != '8' && phase.skill_type == 1)) text += ', ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_SURE_HIT');

                if (skill.priority == 0) {
                    text += ' , ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_PREEMPTIVE');
                } else if (skill.priority == 2) {
                    text += ' , ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_MOVE_LAST');
                }
                

                if (phase.recovery && phase.recovery.states && phase.recovery.states.death) {
                    text += ', ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_RESSURECT');
                }

                if (phase.recovery && phase.recovery_debuff) {
                    text += ', ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_CLEANSE');
                } else  if (phase.recovery) {
                    if (phase.recovery.states) {
                        if ((!phase.recovery.states.death && Object.keys(phase.recovery.states) > 0) 
                                || (phase.recovery.states.death && Object.keys(phase.recovery.states) > 1)) {
                            text += ', ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_AILMENT_CLEANSE');        
                        }
                    }
                } else if (phase.recovery_debuff) {
                    text += ', ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_DEBUFF_CLEANSE');
                }            

                if (phase.buffs) {
                    text += ',';
                    for(var key in phase.buffs) {
                        var buff = phase.buffs[key];
                        var translatedBuffType = getTranslatedBuffType(buff.buff_type);
                        text += ' ' + (buff.rate/10) + '% ' + translatedBuffType;
                        if (buff.params) {
                            var paramsText = '';
                            for(var paramKey in buff.params) {
                                var value = buff.params[paramKey]/10;
                                paramsText += getTranslatedBuffType(paramKey) + '+' + value + '%, '; 
                            }
                            text += ' (' + paramsText + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_BUFF_PERIOD').replace('{period}', buff.period) + ')';

                        } else {
                            text += ' (+' + (buff.effect_value/(buff.buff_type == 'attack' || buff.buff_type == 'defence'?100:10)) + '%, ' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_BUFF_PERIOD').replace('{period}', buff.period) + ')';
                        }
                    }
                }

                if (phase.erosion) {
                    text += ', ' + (phase.erosion.rate / 10) + '%';
                    for(var key in phase.erosion.states) {
                        text += ' ' + getTranslatedBuffType(key);
                    }
                }

                if (phase.debuff) {
                    text += ', ' + (phase.debuff.rate / 10) + '%';
                    for(var key in phase.debuff.debuffs) {
                        text += ' ' + getTranslatedBuffType(key);
                    }
                }

                if (phase.properties) {
                    text += ', '
                    for(var key in phase.properties) {
                        text += (phase.properties[key].effect_value / 10) + '%';
                        text += ' ' + getTranslatedBuffType(phase.properties[key].property);
                    }
                }

                text += ']<br>';
            }

            if (skill.feedback) {
                text += '[' + KTTranslationManager.getUITranslatedText('EMPLOYEES_SKILL_COMPENSATION') + ' ' + (skill.feedback.effect_value / 10) + '%]<br>';
            }

            return text;
        },

        showRaidAccessory: function(iconId, total, growth, level) {
            this.fetchLargeEquipThumbnail(iconId, function(url) {
                $('#raid-accessory-img').attr('src', url);
                $('#raid-accessory-total').html('Lv.' + level + '<br>' + total + '<br>(+' + growth + ')');
                $('#battle-icon').hide();
                $('#raid-accessory').show();
            });
        },

        appendToNews: function(content) {
            if (KTConfigManager.config['news_order'] == 'newest-top') {
                $('#player-news-content').prepend(content);
            } else {
                $('#player-news-content').append(content);
            }
        },

        refreshNews: function() {
            $('#player-news-content').empty();
            var logs = KTGameLogManager.getSortedLogList();
            handleNewsRecursively(logs, 0);
        },

        changeContentLanguage: function(lang) {
            var self = this;
            KTTranslationManager.loadLanguage(lang, function() {
                self.reloadContentIntoLanguage(lang);
            });
        },

        reloadContentIntoLanguage: function(lang) {
            KTTranslationManager.contentLang = lang;
            this.updateEmployeeList();
            this.updateAllTeams();
        },

        changeUiLanguage: function(lang, callback) {
            var self = this;
            KTTranslationManager.loadLanguage(lang, function() {
                self.convertUiIntoLanguage(lang);
                if (typeof callback == 'function') callback();
            });
        },

        convertUiIntoLanguage: function(lang) {
            if (typeof KTTranslationManager.langDict[lang] == 'undefined') return;
            KTTranslationManager.uiLang = lang;
            for(var key in KTTranslationManager.langDict[lang]) {
                var value = KTTranslationManager.langDict[lang][key];
                $('.' + key).html(value);
            }
            this.updateEmployeeList();
        },

        updateScheduleList: function(scheduleList) {
            var now = new Date();

            for(var i=0;i<scheduleList.length;i++) {
                var startTime = new Date(scheduleList[i].start_time);
                var endTime = new Date(scheduleList[i].end_time);

                scheduleList[i].time_to_start_time = startTime.getTime() - now.getTime();
                scheduleList[i].time_to_end_time = endTime.getTime() - now.getTime();
            }

            scheduleList.sort(function(a, b) {
                return a.time_to_end_time - b.time_to_end_time;
            });
            $('#schedule-content').empty();
            var count = 0;
            for(var i=0;i<scheduleList.length;i++) {
                if (scheduleList[i].time_to_end_time < 0) continue;

                var timeText = '';
                if (scheduleList[i].time_to_start_time > 0) {
                    var remainTimeToStart = new KGTime(scheduleList[i].time_to_start_time);
                    timeText = remainTimeToStart;
                } else {
                    var remainTimeToEnd = new KGTime(scheduleList[i].time_to_end_time);
                    timeText = remainTimeToEnd;
                }

                var title = (window.KTConfigManager.config['ui_language'] == 'jp' ? scheduleList[i].jp_title : scheduleList[i].title);
                var scheduleText = title + ' <span style="float:right">' + timeText + '&nbsp;</span>'

                $('#schedule-content').append(
                    '<div class="schedule-item ' + (scheduleList[i].time_to_start_time < 0?'schedule-item-goingon':'') + '">&nbsp;' + scheduleText + '</div>'
                );
                count++;
                if (count >= 3) break;
            }
            this.layoutPlayerNews();
        },

        layoutPlayerNews: function() {
            var scheduleHeight = $('#schedule-content').height();
            var cautiousModeHeight = $('#dungeon-content').height();
            var playerNewsContentHeight = $('#player-news-content').parent().height() - scheduleHeight - cautiousModeHeight - 10;
            $('#player-news-content').height(playerNewsContentHeight);
        },

        silentLogin: function() {
            var playerId = KTPlayerManager.getPlayerId();
            if (!playerId) return;

            var kToken = KTPlayerManager.getKToken();
            if (!kToken) return;

            var text = window.KTTranslationManager.getUITranslatedText('SETTINGS_LABEL_LOGIN_NOTICE').replace('{name}', KTPlayerManager.k_username[playerId]);
            $('#logged-in-user-info').html(text);
            $('#login-table').hide();
            $('#logged-in-user-section').show();
        },

        logout: function(message) {
            var playerId = KTPlayerManager.getPlayerId();
            if (!playerId) return;

            KTPlayerManager.k_token[playerId] = null;
            KTPlayerManager.k_username[playerId] = null;
            KTPlayerManager.saveToLocalStorage();

            if (typeof message != 'undefined') {
                $('#login-error').text(message);
                $('#settings-tab-btn').trigger('click');
            }

            $('#logged-in-user-section').hide();
            $('#login-table').show();
        },

        cachedDungeonItemWidth: 0,
        updateDungeonDefcon: function() {
            if (!KTPlayerManager.defcon) return;

            var defcon = KTPlayerManager.defcon;
            var level = defcon['defcon_level'];

            var endTime = new Date(defcon['end_at'] + ' GMT+0900');
            var now = new Date();
            
            if (endTime.valueOf() < now.valueOf()) {
                level = 0;
            }
            $("#dungeon-level").text(level);
            
            $('#dungeon-cur').removeClass('dungeon-warning');
            $('#dungeon-cur').removeClass('dungeon-safe');
            if (parseInt(level) > 0) {
                $('#dungeon-cur').addClass('dungeon-warning');
            } else {
                $('#dungeon-cur').addClass('dungeon-safe');
            }

            var remainPercentage = 0.0;
            if (now.valueOf() < endTime.valueOf()) {
                var remainTimeinMilli = endTime.valueOf() - now.valueOf();
                var remainTime = new KGTime(remainTimeinMilli);
                remainPercentage = Math.max(0, remainTimeinMilli / (2*60*60*1000));
                $('#dungeon-remaining-time').html(remainTime + '&nbsp;');
            }
            var parentWidth = $('#dungeon-item').width();
            if (parentWidth) {
                this.cachedDungeonItemWidth = parentWidth + 4;
            } else if (this.cachedDungeonItemWidth) {
                parentWidth = this.cachedDungeonItemWidth;
            }
            var width = Math.min(this.cachedDungeonItemWidth, this.cachedDungeonItemWidth*remainPercentage);
            $('#dungeon-cur').width(width);
            this.layoutPlayerNews();
        },

        dungeonTimer: null,
        startDungeonTimer: function() {
            var self = this;
            if (!this.dungeonTimer) {
                this.dungeonTimer = setInterval(function() {
                    self.updateDungeonDefcon();
                }, 1000);    
            }
        }
    }
})();