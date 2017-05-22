(function(){
    "use strict";
    
    window.Kanpani = {
        DEBUG: false,
        SCENE_SEPARATOR: '=========End of Scene=========',
        version: chrome.runtime.getManifest().version,

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'KanpaniTools': {
                    'version': self.version
                }
            });
        },

        checkNewVersion: function(callback) {
            var self = this;
            chrome.storage.local.get('KanpaniTools', function(toolsInfo) {
                if (!toolsInfo || !toolsInfo.KanpaniTools) {
                    if (typeof callback == 'function') callback(true);
                    return;
                }

                toolsInfo = toolsInfo.KanpaniTools;
                if (typeof callback == 'function') callback(toolsInfo.version != self.version);
            });
        },

        init: function() {
            var self = this;

            this.checkNewVersion(function(isNewVersion) {
                if (!isNewVersion) return;

                KTUIManager.showPopup(
                    'KanpaniTools is updated!',
                    'New version ' + self.version + ' has arrived! You can check <a id="changelog" href="">changelogs</a> in our Discord server.'
                );
                $('#changelog').click(function() {
                    window.open('https://discord.gg/Fa6fXbA');
                });
                self.saveToLocalStorage();    
            });

            console.log('KTGameDataManager loading');
            KTGameDataManager.loadFromLocalStorage(function() {
                console.log('KTCharacterManager loading');
                KTCharacterManager.init(function() {
                    console.log('KTCharacterManager loaded');
                    KTUIManager.loadFromLocalStorage(function() {
                        console.log('KTUIManager loaded');
                        KTPlayerManager.loadFromLocalStorage(function() {
                            console.log('KTPlayerManager loaded');
                            KTUIManager.updateUI();
                            var cardList = KTPlayerManager.getCardList();
                            KTUIManager.updateEmployeeList(cardList);
                            KTUIManager.updateRawResources(cardList);
                            KTUIManager.updateAllTeams();
                            self.setTimer();
                            KTNetworkHandler.init();
                        });
                    });
                });
            });
        },

        readQuestLog: function(body) {
            var commands = body['commands'];
            var name = '';
            var colors = ['#911515', '#699114', '#149156', '#147e91', '#142691', '#611491', '#91146b']
            var colorIter = 0;
            var nameColorMap = {};
            var hasLines = false;

            for(var i=0;i<commands.length;i++) {
                var command = commands[i];
                if (command['command_type'] == 'page') {
                    var charaId = command['chara'] + '_' + command['hash'];

                    if (charaId == 'ceo_') {
                        name = 'CEO';
                    } else if (charaId == 'fairy_') {
                        name = 'Ruka';
                    } else {
                        name = KTCharacterManager.getEmployeeName(charaId);
                        if (name == null) name = command['card_name'];
                        if (name == null) name = charaId;
                    }

                } else if (command['command_type'] == 'text') {
                    var colorCode = '#000'
                    if (typeof nameColorMap[name] == 'undefined') {
                        nameColorMap[name] = colors[colorIter];
                        colorIter = (colorIter + 1)%(colors.length);
                    }

                    var text = '<font color="' + nameColorMap[name] + '"><b>[' + name + ']</b>: ' + command['text'] + '</font>';
                    KTUIManager.appendToQuestLog(text);
                    hasLines = true;
                }
            }
            if (hasLines) {
                KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
            }
        },

        readCardSituationScene: function(scenes) {
            var name = '';
            var colors = ['#911515', '#699114', '#149156', '#147e91', '#142691', '#611491', '#91146b']
            var colorIter = 0;
            var nameColorMap = {};
            var hasLines = false;

            for(var key in scenes) {
                for(var i=0;i<scenes[key].length;i++) {
                    var command = scenes[key][i];
                    if (command['command_type'] == 'page') {
                        var charaId = command['chara'] + '_' + command['hash'];

                        if (charaId == 'ceo_') {
                            name = 'CEO';
                        } else if (charaId == 'fairy_') {
                            name = 'Ruka';
                        } else {
                            name = KTCharacterManager.getEmployeeName(charaId);
                            if (name == null) name = command['card_name'];
                            if (name == null) name = charaId;
                        }

                    } else if (command['command_type'] == 'text') {
                        var colorCode = '#000'
                        if (typeof nameColorMap[name] == 'undefined') {
                            nameColorMap[name] = colors[colorIter];
                            colorIter = (colorIter + 1)%(colors.length);
                        }

                        var text = '<font color="' + nameColorMap[name] + '"><b>[' + name + ']</b>: ' + command['text'] + '</font>';
                        KTUIManager.appendToQuestLog(text);
                        hasLines = true;
                    }
                }        
            }
            if (hasLines) {
                KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
            }
        },

        readCardSituationText: function(body) {
            var text = '<font color="#911515">' + body + '</font>';
            KTUIManager.appendToQuestLog(text);
            KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
        },

        setTimer: function() {
            var self = this;
            setInterval(function() {
                var food = self.updateResourceTimer('food');
                var iron = self.updateResourceTimer('iron');
                var stone = self.updateResourceTimer('stone');
                var wood = self.updateResourceTimer('wood');
                KTUIManager.updateUI(food, iron, stone, wood);
                self.updateItemEffects();
            }, 1000);    
        },

        updateResourceTimer: function(type) {
            var max = parseInt(KTPlayerManager.getResource('max_' + type));
            var cur = parseInt(KTPlayerManager.getResource(type));
            var rate = parseInt(KTPlayerManager.getRecover(type));
            var last = parseInt(KTPlayerManager.last_update_resource);

            if (last == null) return;
            if (rate == 0) {
                $('#timer-' + type).text('Check facility');
                return;
            }

            var now = new Date();
            while (last + 3*60*1000 < now.valueOf()) {
                last += 3*60*1000;
                cur = Math.min(cur + rate, max);
            }
            var lastDate = new Date(last);
            lastDate.setUTCSeconds(0, 0);
            while(lastDate.valueOf() + 60*1000 <= now.valueOf()) {
                lastDate.setTime(lastDate.getTime() + 60*1000);
                if ((lastDate.getUTCMinutes() % 3) == 0) cur = Math.min(cur + rate, max);
            }

            var numTick = Math.ceil(Math.max(0, (max - cur) / rate));
            if (numTick > 0) {
                var nextTick = new Date();
                nextTick.setUTCSeconds(0, 0);
                while((nextTick.getUTCMinutes() % 3) != 0) nextTick.setTime(nextTick.getTime() + 60* 1000);
                numTick--;
                nextTick.setTime(nextTick.getTime() + 3*60*1000 * numTick);
                var time = new KGTime(nextTick.valueOf() - now.valueOf());
                KTUIManager.setResourceTimer(type, time);

            } else {
                KTUIManager.setResourceTimer(type, 'Full');
            }
            return cur;
        },

        updateItemEffects: function() {
            var effects = KTPlayerManager.getItemEffects();
            var requestAt = KTPlayerManager.getRequestAt();
            var requestAtTime = new Date(requestAt);
            var text = '';
            var itemEffectNames = [];
            var count = 0;
            for(var i=0;i<effects.length && count<6;i++) {
                var itemEffect = effects[i];
                var expireDate = new Date(itemEffect.expire_date);
                var oldRemainingTime = expireDate.valueOf() - requestAtTime.valueOf();
                var localExpireDate = KTPlayerManager.last_update_resource + oldRemainingTime;
                var remainingTime = localExpireDate - (new Date()).valueOf();
                if (remainingTime > 0 && itemEffect.image_name != null && itemEffect.image_name.length > 0) {
                    text += '<img src="http://67.205.150.236/storage/item_effect/' + itemEffect.image_name + '.png"> ' + (new KGTime(remainingTime));
                    itemEffectNames.push(itemEffect.image_name);
                    count++;
                    if ((count % 2) == 0) { 
                        text += '<br>';
                    } else {
                        text += '&nbsp;';
                    }
                }
            }
            KTUIManager.fetchItemEffects(itemEffectNames, function() {
                $('#item-effects-container').html(text);    
            })
        },

        updateEmployeeList: function() {
            var cardList = KTPlayerManager.getCardList();
            KTUIManager.updateEmployeeList(cardList);
            KTUIManager.updateRawResources(cardList);
        },

        loadDeck: function(deck) {
            var index = deck.deck_index;
            var cards = deck.cards;
            KTPlayerManager.loadDeck(index, cards);
            //console.log('update deck ' + index);
            KTUIManager.updateDeck(index);
        },

        loadAllDecks: function(decks) {
            for(var i=0;i<decks.length;i++) {
                this.loadDeck(decks[i]);
            }
        },

        moveCardBetweenDecks: function(deck) {
            var index = deck.deck_index;
            var newCards = deck.cards;

            var otherIndex = KTPlayerManager.moveCardBetweenDecks(index, newCards);
            //console.log('switch between ' + index + ' and ' + otherIndex);
            KTUIManager.updateDeck(index);
            KTUIManager.updateDeck(otherIndex);
        },

        updateSkill: function(employee) {
            for(var i=0;i<employee.equipments.length;i++) {
                var equip = employee.equipments[i];
                if (parseInt(equip.part) != 0) continue;
                KTGameDataManager.updateSkill(equip.front_skill);
                KTGameDataManager.updateSkill(equip.back_skill);
            }
            KTPlayerManager.updateCard(employee);

            KTGameDataManager.saveToLocalStorage();
            KTPlayerManager.saveToLocalStorage();
            KTUIManager.updateSkillForAll();
        }
    }
})();