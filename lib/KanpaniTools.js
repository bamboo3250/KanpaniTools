(function(){
    "use strict";
    
    window.Kanpani = {
        DEBUG: false,
        //HOST: 'http://localhost:8000',  // dev
        HOST: 'https://kanpanitools.com',  // live

        SCENE_SEPARATOR: '=========End of Scene=========',
        version: chrome.runtime.getManifest().version,

        newsRefreshTimer: null,

        log: function(text, alwaysLog = false) {
            if (this.DEBUG || alwaysLog) console.log(text);
        },

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

        notifyUserNewVersionIfNeeded: function() {
            var self = this;
            this.checkNewVersion(function(isNewVersion) {
                if (!isNewVersion) return;

                var popupTitle = KTTranslationManager.getUITranslatedText('POPUP_NEW_VERSION_TITLE');
                var popupContent = KTTranslationManager.getUITranslatedText('POPUP_NEW_VERSION_CONTENT');
                popupContent = popupContent.replace('{version}', self.version);
                KTUIManager.showPopup(popupTitle, popupContent);

                $('#changelog').click(function() {
                    window.open('https://discord.gg/Fa6fXbA');
                });
                self.saveToLocalStorage();
            });    
        },

        syncRecursively: function(syncQueue, index, callback) {
            if (index >= syncQueue.length) {
                if (typeof callback == 'function') callback();
                return;
            }

            var self = this;
            syncQueue[index].sync(function() {
                self.syncRecursively(syncQueue, index + 1, callback);
            });
        },

        startSync: function(syncQueue, callback) {
            this.syncRecursively(syncQueue, 0, callback);
        },

        init: function(isPanel = true, callback) {
            var self = this;
            var syncQueue = [
                KTConfigManager,
                KTUIManager,
                KTGameDataManager,
                KTPlayerManager
            ];
            this.startSync(syncQueue, function() {
                KTUIManager.updateResourceUI();
                KTUIManager.updateSettings();
                KTUIManager.changeContentLanguage(KTConfigManager.config['language']);
                
                var cardList = KTPlayerManager.getCardList();
                KTUIManager.updateRawResources(cardList);
                
                // for(var i=0;i<cardList.length;i++) {
                //     KTGameDataManager.updateChara(cardList[i]);
                // }

                // var userId = KTPlayerManager.getPlayerId();
                // if (userId) {
                //     if (typeof KTPlayerManager.card_book[userId] == 'undefined') {
                //         KTPlayerManager.card_book[userId] = {};
                //     }
                //     for(var key in KTPlayerManager.card_book[userId]) {
                //         var card = KTPlayerManager.card_book[userId][key];
                //         KTGameDataManager.updateCharaFromCardBook(card);
                //     }
                //     KTGameDataManager.saveToLocalStorage();    
                // }
                
                KTGameDataManager.retrieveMasterSkills(function(masterSkills) {
                    KTGameDataManager.updateSkillsOnServer(masterSkills);

                    KTGameDataManager.retrieveMasterCharacters(function(masterChara) {
                        KTGameDataManager.updateCharactersOnServer(masterChara);
                    });
                });

                if (isPanel) {

                    KTUIManager.silentLogin();
                    KTNetworkHandler.init();
                    self.setTimer();
                    self.notifyUserNewVersionIfNeeded();
                    self.initFetchGameLog();
                    self.fetchSchedule();

                    if (Kanpani.DEBUG) {
                        $('#clear-storage-btn').show();
                    }
                }

                if (typeof callback == 'function') callback();
            });
        },

        fetchSchedule: function() {
            var self = this;
            $.getJSON(Kanpani.HOST + '/schedule_list', function(data) {
                setInterval(function() {
                    window.KTUIManager.updateScheduleList(data);
                }, 1000);
            });
        },

        fetchGameLog: function() {
            var self = this;
            $.getJSON(Kanpani.HOST + '/game_logs/get_recent', function(data) {
                window.KTGameLogManager.updateLogs(data);
            });
        },

        initFetchGameLog: function() {
            clearInterval(this.newsRefreshTimer);
            var interval = parseInt(KTConfigManager.config['news_refresh_interval']);
            if (interval == -1) return;

            this.fetchGameLog();
            this.newsRefreshTimer = setInterval(this.fetchGameLog, interval*1000);
        },

        readQuestLog: function(body) {
            var commands = body['commands'];
            var name = '';
            var colorNameRegister = new NameColorRegister();
            var hasLines = false;

            for(var i=0;i<commands.length;i++) {
                var command = commands[i];
                if (command['command_type'] == 'page') {
                    var charaId = command['chara'] + '_' + command['hash'];

                    if (charaId == 'ceo_') {
                        name = KTTranslationManager.getContentTranslatedText('DIALOGUES_CEO_NAME');
                    } else if (charaId == 'fairy_') {
                        name = KTTranslationManager.getContentTranslatedText('DIALOGUES_FAIRY_NAME');
                    } else {
                        name = command['card_name'];
                        var translatedName = KTGameDataManager.getEmployeeName(charaId);
                        if (KTUIManager.contentLang != 'jp' && translatedName) name = translatedName;
                    }

                } else if (command['command_type'] == 'text') {
                    var color = colorNameRegister.getColorForName(name);
                    var text = '<font color="' + color + '"><b>[' + name + ']</b>: ' + command['text'] + '</font>';
                    KTUIManager.appendToQuestLog(text);
                    hasLines = true;
                }
            }
            if (hasLines) {
                KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
            }
        },

        readOpenMessage: function(body) {
            var commands = body['talk'];
            var name = '';
            var hasLines = false;
            var colorNameRegister = new NameColorRegister();

            for(var i=0;i<commands.length;i++) {
                var command = commands[i];
                var charaId = command['img_dir'];
                name = command['card_name'];
                var translatedName = KTGameDataManager.getEmployeeName(charaId);
                if (KTTranslationManager.contentLang != 'jp' && translatedName) name = translatedName;

                var color = colorNameRegister.getColorForName(name);
                var text = '<font color="' + color + '"><b>[' + name + ']</b>: ' + command['message'] + '</font>';
                KTUIManager.appendToQuestLog(text);
                hasLines = true;
            }
            if (hasLines) {
                KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
            }
        },

        event17083101Get: function(body) {
            var hasLines = false;
            
            var charaId = body['message_data']['card_data']['img_dir'];
            var name = body['message_data']['card_data']['card_name'];
            var translatedName = KTGameDataManager.getEmployeeName(charaId);
            if (KTTranslationManager.contentLang != 'jp' && translatedName) name = translatedName;

            var colorNameRegister = new NameColorRegister();
            var nameColor = colorNameRegister.getColorForName(name);

            var talks = body['message_data']['talk'];
            for(var i=0;i<talks.length;i++) {
                var text = '<font color="' + nameColor + '"><b>[' + name + ']</b>: ' + talks[i]['message'] + '</font>';
                KTUIManager.appendToQuestLog(text);
                hasLines = true;
            }
            
            if (hasLines) KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
        },

        readCardSituationScene: function(scenes) {
            var name = '';
            var hasLines = false;

            var colorNameRegister = new NameColorRegister();
            
            for(var key in scenes) {
                for(var i=0;i<scenes[key].length;i++) {
                    var command = scenes[key][i];
                    if (command['command_type'] == 'page') {
                        var charaId = command['chara'] + '_' + command['hash'];

                        if (charaId == 'ceo_') {
                            name = KTTranslationManager.getContentTranslatedText('DIALOGUES_CEO_NAME');
                        } else if (charaId == 'fairy_') {
                            name = KTTranslationManager.getContentTranslatedText('DIALOGUES_FAIRY_NAME');
                        } else {
                            name = command['card_name'];
                            var translatedName = KTGameDataManager.getEmployeeName(charaId);
                            if (KTTranslationManager.contentLang != 'jp' && translatedName) name = translatedName;
                        }

                    } else if (command['command_type'] == 'text') {
                        var color = colorNameRegister.getColorForName(name);
                        var text = '<font color="' + color + '"><b>[' + name + ']</b>: ' + command['text'] + '</font>';
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
                KTUIManager.updateResourceUI(food, iron, stone, wood);
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
                $('#timer-' + type).text(KTTranslationManager.getUITranslatedText('RESOURCE_CHECK_FACILITY'));
                return;
            }

            var now = new Date();
            var lastDate = new Date(last);
            var curNow = 9999;
            lastDate.setUTCSeconds(0, 0);

            while(cur < max) {
                lastDate.setTime(lastDate.getTime() + 60*1000);
                if (lastDate.valueOf() > now.valueOf() && curNow == 9999) curNow = cur;
                if ((lastDate.getUTCMinutes() % 3) == 0) cur = Math.min(cur + rate, max);
            }

            var numTick = Math.ceil(Math.max(0, (max - cur) / rate));
            if (now.valueOf() < lastDate.valueOf()) {
                var time = new KGTime(lastDate.valueOf() - now.valueOf());
                KTUIManager.setResourceTimer(type, time);
            } else {
                KTUIManager.setResourceTimer(type, KTTranslationManager.getUITranslatedText('RESOURCE_FULL'));
            }
            return Math.min(cur, curNow);
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
            this.updateCards(cards);
        },

        updateCards: function(cards) {
            for(var i=0;i<cards.length;i++) {
                KTPlayerManager.updateCard(cards[i]);    
            }
            KTPlayerManager.updatePlayerCardListOnServer();
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
            KTPlayerManager.updateDeckListOnServer();
            this.updateEmployeeList();
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
            KTPlayerManager.updatePlayerCardListOnServer();
        },

        updateBattle: function(body) {
            $('.battle-raid-policy').hide();
            $('.battle-normal-policy').show();
            KTUIManager.updateBattle(body);
        },

        updateRaidBattle: function(body) {
            $('.battle-raid-policy').show();
            $('.battle-normal-policy').hide();
            KTUIManager.updateBattle(body);
        },

        finishQuest: function(body) {
            var cards = body.deck.cards;
            this.updateCards(cards);
            if (typeof body.new_card != 'undefined') {
                var cardId = body.new_card.img_dir;
                var rarity = parseInt(body.new_card.rarity);
                if (rarity >= 3) {
                    var content = 'got {chara,' + cardId + '} dropped from quest';
                    KTGameLogManager.sendLog(content);
                } 
            }
        },

        updateCardBook: function(body, lang) {
            var updated = false;
            for(var key in body) {
                var card = body[key];
                if (KTPlayerManager.updateCardBook(card, lang)) updated = true;
            }
            if (updated) {
                KTPlayerManager.saveToLocalStorage();
                KTGameDataManager.saveToLocalStorage();
            }
        },

        updateRaidAccessory: function(body) {
            var accessory = body.equipment;
            if (!accessory) return;

            var total = 0;
            var growth = 0;
            for(var key in accessory.effects) {
                total += parseInt(accessory.effects[key]);
            }
            for(var key in accessory.growth) {
                if (key == 'level') continue;
                growth += parseInt(accessory.growth[key]);
            }
            var iconId = accessory.icon_id;
            KTUIManager.showRaidAccessory(iconId, total, growth, accessory.equipment_level);
        },

        craftEquipment: function(body) {
            var plus = parseInt(body.plus);
            var rarity = parseInt(body.rarity);
            var part = parseInt(body.part);
            var iconId = body.icon_id;

            if (plus < 3) return; 
            if (part == 0 && (rarity <= 5 || rarity == 100 || rarity == 101)) return;
            if (part == 1 && rarity <= 5) return;
            if (part == 2 && (rarity <= 2 || (rarity == 101 && plus < 4))) return;
            if (part == 3) return;
            if (!iconId) return;
            if (!body.equipment_name) return;

            var content = 'crafted {equipment,' + iconId + ',' + body.equipment_name + '}';
            KTGameLogManager.sendLog(content);
        },

        recruit: function(body) {
            var card = body.card;
            var cardId = card.img_dir;
            var rarity = parseInt(card.rarity);
            if (rarity >= 3) {
                var content = 'recruited {chara,' + cardId + '}';
                KTGameLogManager.sendLog(content);
            }
        },

        promote: function(body) {
            var card = body.card;
            var cardId = card.img_dir;
            var promotion = card.transmigration_count;
            var content = 'promoted {chara,' + cardId + '} to promotion_' + promotion;
            KTGameLogManager.sendLog(content);
        },

        event16102801ListenStaffTalk: function(body) {
            var talks = body['staff_talk'];
            var colorNameRegister = new NameColorRegister();
            var hasLines = false;

            for(var i=0;i<talks.length;i++) {
                var talk    = talks[i];
                var name    = talk['card_name'];
                var charaId = talk['img_dir'];
                var message = talk['message'];

                var translatedName = KTGameDataManager.getEmployeeName(charaId);
                if (translatedName) {
                    name = translatedName;
                }

                var color = colorNameRegister.getColorForName(name);
                var text = '<font color="' + color + '"><b>[' + name + ']</b>: ' + message + '</font>';
                KTUIManager.appendToQuestLog(text);
                hasLines = true;
            }
            if (hasLines) {
                KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
            }
        }
    }
})();