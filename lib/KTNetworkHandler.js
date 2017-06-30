(function(){
    "use strict";
    
    function isGeneralRequest(url) {
        return (url.search('http://[0-9a-z.\-]*/amf\\?_c=[a-zA-Z0-9_.]+&_u=[0-9]+') > -1);
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

            var self = this;
            request.getContent(function(content, encoding) {
                var parsed = KTAmfParser.parse(window.atob(content));
                var userInfo = parsed['user'];
                var body = parsed['body'];

                if (Kanpani.DEBUG) {
                    console.log(url.substr(url.indexOf('/amf')));
                    console.log(parsed);    
                }
                
                if (userInfo) {
                    KTPlayerManager.updatePlayer(userInfo);  
                    KTPlayerManager.saveToLocalStorage();  
                    KTUIManager.updateResourceUI();
                }
                
                self.handleMyPageRequest(url, body);
                self.handleQuestRequest(url, body);
                self.handleEquipmentRequest(url, body);
                self.handleResourceStatusRequest(url, body);
                self.handleCardSituationSceneRequest(url, body);
                self.handleCardSituationTextRequest(url, body);
                self.handleGetCardsAll(url, body);
                self.handleDeckGetRequest(url, body);
                self.handleAllDecksGetRequest(url, body);
                self.handleMoveCardRequest(url, body);
                self.handleEquipRequest(url, body);
                self.handleGetBuildingRequest(url, body);
                self.handleStartRoundRequest(url, body);
                self.handleQuestFinish(url, body);
                self.handleGetCardBook(url, body);
            });
        },

        handleMyPageRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Mypage.get&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            GA.pageView();
        },

        handleDeckGetRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=deck.get&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Deck.set_leader&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Deck.set_slot&_u=[0-9]+',
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.loadDeck(body);
        },

        handleAllDecksGetRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Deck.get_all&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=deck.get_all&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.loadAllDecks(body);
            Kanpani.updateEmployeeList();
        },

        handleMoveCardRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=deck.move_between_decks&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            Kanpani.moveCardBetweenDecks(body);
            
        },

        handleQuestRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.character_enter&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.special_enter&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.main_enter&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.restore&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.next&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=Event17052601.shipment_quest_enter&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            if (url.search('restore') > -1) {
                Kanpani.readQuestLog(body['base']);    
            } else {
                Kanpani.readQuestLog(body);
            }   
        },

        handleEvent17052601OpenMessageRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Event17052601.get_rare_shipment_open_message&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readOpenMessage(body);
        },

        handleCardSituationSceneRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBook.get_card_situation_scenario&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readCardSituationScene(body['scenes']);
        },

        handleCardSituationTextRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBook.get_card_situation_text&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readCardSituationText(body);
        },

        handleEquipmentRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=EquipmentBox.get_equipments_at_part&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
        },

        handleResourceStatusRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Territory.get_resource_status&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            KTPlayerManager.setRecover(body);
            KTPlayerManager.saveToLocalStorage();
        },

        handleGetCardsAll: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBox.get_cards_all&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            KTPlayerManager.setCardList(body);
            KTPlayerManager.saveToLocalStorage();
            Kanpani.updateEmployeeList();
        },

        handleEquipRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBox.equip&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=CardBox.unequip&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            KTPlayerManager.updateCard(body);
            Kanpani.updateSkill(body);
            Kanpani.updateEmployeeList();
        },

        handleGetBuildingRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Territory.get_building&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            if (body.current.building_id == 'resource') {
                KTUIManager.updateRawResources(body.assign_cards);
            }
        },

        handleStartRoundRequest: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.start_round&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=battlefield.start_round&_u=[0-9]+',
                'http://[0-9a-z.\-]*/amf\\?_c=largeBoss.start_round&_u=[0-9]+',
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateBattle(body);
        },

        handleQuestFinish: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=Quest.finish&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.finishQuest(body);
            Kanpani.updateEmployeeList();
        },

        handleGetCardBook: function(url, body) {
            var acceptedUrls = [
                'http://[0-9a-z.\-]*/amf\\?_c=CardBook.get_cards&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateCardBook(body);
        }
    }
})();