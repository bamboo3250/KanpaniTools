(function(){
    "use strict";
    
    function isGeneralRequest(url) {
        return (url.search('https://[0-9a-z.\-]*/amf\\?_c=[a-zA-Z0-9_.]+&_u=[0-9]+') > -1);
    }

    function getLanguage(url) {
        if (url.includes('chienese.kanpanigirls.com')) return window.KTConst.language.ZH;
        if (url.includes('kanpani.jp')) return window.KTConst.language.JP;
        return null;
    }

    function getServer(url) {
        if (url.includes('www5.')) return KTConst.server.ADELINA;
        if (url.includes('www4.')) return KTConst.server.JUDITA;
        if (url.includes('www3.')) return KTConst.server.HOLLY;
        if (url.includes('www2-2.')) return KTConst.server.SIEGRID;
        if (url.includes('www1.') || url.includes('www.')) return KTConst.server.ROSE;

        var startIndex = url.indexOf('www');
        var endIndex = url.indexOf('.', startIndex);
        return url.substring(startIndex, endIndex);
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

            var postData = request.request.postData.text;
            var params = [];

            if (postData) {
                var result = KTAmfParser.parse(postData);
                if (Array.isArray(result)) {
                    params = result;
                    params.shift();    
                }
            }
            
            var self = this;
            request.getContent(function(content, encoding) {
                var parsed = KTAmfParser.parse(window.atob(content));
                var userInfo = parsed['user'];
                var body = parsed['body'];

                Kanpani.log(url.substr(url.indexOf('/amf')));
                Kanpani.log(params);
                Kanpani.log(parsed);    
                Kanpani.log('==================================')

                if (!body) return;

                if (userInfo) {
                    KTPlayerManager.updatePlayer(userInfo);  
                    var player = KTPlayerManager.getPlayer();
                    player.server = getServer(url);

                    KTPlayerManager.saveToLocalStorage();  
                    KTUIManager.updateResourceUI();
                }
                
                self.handleMyPageRequest(url, params, body, lang);
                self.handleQuestRequest(url, params, body, lang);
                self.handleEquipmentRequest(url, params, body, lang);
                self.handleResourceStatusRequest(url, params, body, lang);
                self.handleCardSituationSceneRequest(url, params, body, lang);
                self.handleCardSituationTextRequest(url, params, body, lang);
                self.handleGetCardsAll(url, params, body, lang);
                self.handleDeckOrganizeRequest(url, params, body, lang);
                self.handleDeckGetRequest(url, params, body, lang);
                self.handleAllDecksGetRequest(url, params, body, lang);
                self.handleMoveCardRequest(url, params, body, lang);
                self.handleEquipRequest(url, params, body, lang);
                self.handleGetBuildingRequest(url, params, body, lang);
                self.handleStartRoundRequest(url, params, body, lang);
                self.handleRaidStartRoundRequest(url, params, body, lang);
                self.handleQuestFinish(url, params, body, lang);
                self.handleGetCardBook(url, params, body, lang);
                self.handleLargeBossGetEquipment(url, params, body, lang);
                self.handleProduceRequest(url, params, body, lang);
                self.handleGachaSelect(url, params, body, lang);
                // self.handleGachaDraw(url, params, body, lang);
                self.handlePromote(url, params, body, lang);
                self.handleGetPRDescription(url, params, body, lang);
                
                self.handleDungeonMove(url, params, body, lang);
                self.handleDungeonEnter(url, params, body, lang);
                self.handleDungeonFloor(url, params, body, lang);
                self.handleDungeonScenario(url, params, body, lang);

                self.handleEvent17083101Get(url, params, body, lang);
                self.handleEvent16102801ListenStaffTalk(url, params, body, lang);
            });
        },

        handleMyPageRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Mypage.get&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            GA.pageView();
        },

        handleDeckGetRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=deck.get&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Deck.set_leader&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Deck.set_slot&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Deck.unset_slot&_u=[0-9]+',
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.loadDeck(body);
            Kanpani.updateEmployeeList();
        },

        handleDeckOrganizeRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=DeckOrganize.top&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=DeckOrganize.unset_slot&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=DeckOrganize.set_slot&_u=[0-9]+',
            ];

            if (!isExpectedRequest(url, acceptedUrls)) return;

            var deck = body['Deck.get'];
            if (!deck) return;

            Kanpani.loadDeck(deck);
            Kanpani.updateEmployeeList();
        },

        handleAllDecksGetRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Deck.get_all&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=deck.get_all&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.loadAllDecks(body);
            Kanpani.updateEmployeeList();
        },

        handleMoveCardRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=deck.move_between_decks&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            Kanpani.moveCardBetweenDecks(body);
        },

        handleQuestRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Quest.character_enter&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Quest.special_enter&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Quest.main_enter&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Quest.restore&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Quest.next&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=QuestBook.enter&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=QuestBook.next&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Event17052601.shipment_quest_enter&_u=[0-9]+'

            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            if (url.search('restore') > -1) {
                Kanpani.readQuestLog(body['base']);    
            } else {
                Kanpani.readQuestLog(body);
            }   
        },

        handleEvent17052601OpenMessageRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Event17052601.get_rare_shipment_open_message&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readOpenMessage(body);
        },

        handleEvent17083101Get: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Event17083101.get&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.event17083101Get(body);
        },

        handleCardSituationSceneRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=CardBook.get_card_situation_scenario&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readCardSituationScene(body['scenes']);
        },

        handleCardSituationTextRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=CardBook.get_card_situation_text&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readCardSituationText(body);
        },

        handleEquipmentRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=EquipmentBox.get_equipments_at_part&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
        },

        handleResourceStatusRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Territory.get_resource_status&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            var player = KTPlayerManager.getPlayer();
            if (!player) return;
            
            player.setRecover(body);
            KTPlayerManager.saveToLocalStorage();
        },

        handleGetCardsAll: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=CardBox.get_cards_all&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            var player = KTPlayerManager.getPlayer();
            if (!player) return;
            
            player.setCardList(body);
            KTPlayerManager.saveToLocalStorage();
            Kanpani.updateEmployeeList();
        },

        handleEquipRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=CardBox.equip&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=CardBox.unequip&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.updateSkill(body);
            Kanpani.updateEmployeeList();
        },

        handleGetBuildingRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Territory.get_all_buildings&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            var resourceBuilding = body['resource'];
            var PRBuilding = body['publicity'];

            KTUIManager.updateRawResources(resourceBuilding.assign_cards);
            
            var player = KTPlayerManager.getPlayer();
            if (!player) return;

            player.PRLevel = PRBuilding.current.level;
            KTPlayerManager.saveToLocalStorage();
        },

        handleStartRoundRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Quest.start_round&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=battlefield.start_round&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Dungeon.start_round&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=dungeon.start_round&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateBattle(body);
        },

        handleRaidStartRoundRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=largeBoss.start_round&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateRaidBattle(body);
        },        

        handleQuestFinish: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Quest.finish&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.finishQuest(body);
            Kanpani.updateEmployeeList();
        },

        handleGetCardBook: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=CardBook.get_cards&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateCardBook(body, lang);
        },

        handleLargeBossGetEquipment: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=largeBoss.get_equipment_notice&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=LargeBoss.reroll_equipment&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.updateRaidAccessory(body);
        },

        handleProduceRequest: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Territory.produce&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.craftEquipment(body);
        },

        handleGachaSelect: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Gacha.select&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.recruit(body);
        },

        handlePromote: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=transmigration.transmigrate&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.promote(body);
        }, 

        handleEvent16102801ListenStaffTalk: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Event16102801.listen_staff_talk&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.event16102801ListenStaffTalk(body);
        },

        handleDungeonEnter: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Dungeon.enter&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.enterDungeon(body);
        },

        handleDungeonMove: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Dungeon.move&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;
            
            Kanpani.moveDungeon(body);
        },

        handleDungeonFloor: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Dungeon.top&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Dungeon.floor&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=dungeon.floor&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.updateDungeonFloor(body);
        },

        handleDungeonScenario: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Dungeon.get_scenario&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.readDungeonLogs(body);
        },

        handleGachaDraw: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Gacha.draw_free&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=ItemBox.use&_u=[0-9]+',
                'https://[0-9a-z.\-]*/amf\\?_c=Gacha.draw&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            for(var i=0;i<KTConst.drawTypes.length;i++) {
                if (url.includes(KTConst.drawTypes[i])) {
                    Kanpani.getDrawResult(params, body, KTConst.drawTypes[i]);
                    break;
                }
            }
        },

        handleGetPRDescription: function(url, params, body, lang) {
            var acceptedUrls = [
                'https://[0-9a-z.\-]*/amf\\?_c=Territory.get_publicity_description&_u=[0-9]+'
            ];
            if (!isExpectedRequest(url, acceptedUrls)) return;

            Kanpani.updatePRDescription(body);
        }
        
    }
})();