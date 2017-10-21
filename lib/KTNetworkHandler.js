(function(){
    "use strict";
    
    function isGeneralRequest(url) {
        return (url.search('http://[0-9a-z.\-]*/amf\\?_c=[a-zA-Z0-9_.]+&_u=[0-9]+') > -1);
    }

    function getLanguage(url) {
        if (url.includes('chienese.kanpanigirls.com')) return window.KTConst.language.ZH;
        if (url.includes('kanpani.jp')) return window.KTConst.language.JP;
        return null;
    }

    function isExpectedRequest(url, urls) {
        for(var i=0;i<urls.length;i++) {
            if (url.search(urls[i]) > -1) return true;
        }
        return false;
    }

    window.KTNetworkHandler = {
        init: function() {
            var self = this;
            chrome.devtools.network.onRequestFinished.addListener(function(request) {
                self.handleRequest(request)
            });
        },

        handleRequest: function(request) {
            var url = request.request.url;
            if (!isGeneralRequest(url)) return;

            var lang = getLanguage(url);
            if (!lang) return;

            var self = this;
            request.getContent(function(content, encoding) {
                var parsed = KTAmfParser.parse(window.atob(content));
                var userInfo = parsed['user'];
                var body = parsed['body'];

                Kanpani.log(url.substr(url.indexOf('/amf')));
                Kanpani.log(parsed);    
                
                if (userInfo) {
                    KTPlayerManager.updatePlayer(userInfo);  
                    KTPlayerManager.saveToLocalStorage();  
                    KTUIManager.updateResourceUI();
                }
                
                self.handleMyPageRequest(url, body, lang);
                self.handleQuestRequest(url, body, lang);
                self.handleEquipmentRequest(url, body, lang);
                self.handleResourceStatusRequest(url, body, lang);
                self.handleCardSituationSceneRequest(url, body, lang);
                self.handleCardSituationTextRequest(url, body, lang);
                self.handleGetCardsAll(url, body, lang);
                self.handleDeckGetRequest(url, body, lang);
                self.handleAllDecksGetRequest(url, body, lang);
                self.handleMoveCardRequest(url, body, lang);
                self.handleEquipRequest(url, body, lang);
                self.handleGetBuildingRequest(url, body, lang);
                self.handleStartRoundRequest(url, body, lang);
                self.handleRaidStartRoundRequest(url, body, lang);
                self.handleQuestFinish(url, body, lang);
                self.handleGetCardBook(url, body, lang);
                self.handleLargeBossGetEquipment(url, body, lang);
                self.handleProduceRequest(url, body, lang);
                self.handleGachaSelect(url, body, lang);
                self.handlePromote(url, body, lang);
                self.handleDungeonFloor(url, body, lang);

                self.handleEvent17083101Get(url, body, lang);
                self.handleEvent16102801ListenStaffTalk(url, body, lang);
            });
        },

        handleMyPageRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Mypage.get&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            GA.pageView();
        },

        handleDeckGetRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=deck.get&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Deck.set_leader&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Deck.set_slot&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Deck.unset_slot&_u=[0-9]+',
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.loadDeck(body);
            Kanpani.updateEmployeeList();
        },

        handleAllDecksGetRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Deck.get_all&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=deck.get_all&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.loadAllDecks(body);
            Kanpani.updateEmployeeList();
        },

        handleMoveCardRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=deck.move_between_decks&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            Kanpani.moveCardBetweenDecks(body);
        },

        handleQuestRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.character_enter&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.special_enter&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.main_enter&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.restore&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.next&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=QuestBook.enter&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=QuestBook.next&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Event17052601.shipment_quest_enter&_u=[0-9]+'

            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            if (url.search('restore') > -1) {
                Kanpani.readQuestLog(body['base']);    
            } else {
                Kanpani.readQuestLog(body);
            }   
        },

        handleEvent17052601OpenMessageRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Event17052601.get_rare_shipment_open_message&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readOpenMessage(body);
        },

        handleEvent17083101Get: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Event17083101.get&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.event17083101Get(body);
        },

        handleCardSituationSceneRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBook.get_card_situation_scenario&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readCardSituationScene(body['scenes']);
        },

        handleCardSituationTextRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBook.get_card_situation_text&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readCardSituationText(body);
        },

        handleEquipmentRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=EquipmentBox.get_equipments_at_part&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
        },

        handleResourceStatusRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Territory.get_resource_status&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            KTPlayerManager.setRecover(body);
            KTPlayerManager.saveToLocalStorage();
        },

        handleGetCardsAll: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBox.get_cards_all&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            KTPlayerManager.setCardList(body);
            KTPlayerManager.saveToLocalStorage();
            Kanpani.updateEmployeeList();
        },

        handleEquipRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBox.equip&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=CardBox.unequip&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.updateSkill(body);
            Kanpani.updateEmployeeList();
        },

        handleGetBuildingRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Territory.get_building&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            if (body.current.building_id == 'resource') {
                KTUIManager.updateRawResources(body.assign_cards);
            }
        },

        handleStartRoundRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.start_round&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=battlefield.start_round&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Dungeon.start_round&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=dungeon.start_round&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateBattle(body);
        },

        handleRaidStartRoundRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=largeBoss.start_round&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateRaidBattle(body);
        },        

        handleQuestFinish: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.finish&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.finishQuest(body);
            Kanpani.updateEmployeeList();
        },

        handleGetCardBook: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBook.get_cards&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateCardBook(body, lang);
        },

        handleLargeBossGetEquipment: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=largeBoss.get_equipment_notice&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=LargeBoss.reroll_equipment&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateRaidAccessory(body);
        },

        handleProduceRequest: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Territory.produce&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.craftEquipment(body);
        },

        handleGachaSelect: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Gacha.select&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.recruit(body);
        },

        handlePromote: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=transmigration.transmigrate&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.promote(body);
        }, 

        handleEvent16102801ListenStaffTalk: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Event16102801.listen_staff_talk&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.event16102801ListenStaffTalk(body);
        },

        handleDungeonFloor: function(url, body, lang) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Dungeon.floor&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=dungeon.floor&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.updateDungeonFloor(body);
        }
    }
})();