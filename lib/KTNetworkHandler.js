(function(){
    "use strict";
    
    function isGeneralRequest(url) {
        return (url.search('https://[0-9a-z.\-]*kanpani.jp/amf') > -1);
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
            if (url.toLowerCase() === urls[i].toLowerCase()) return true;
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
            // console.log(request);
            
            var lang = getLanguage(url);
            if (!lang) return;

            var postData = request.request.postData.text;
            var requestJSON = JSON.parse(postData || {});
            // {
            //     "session_id":"b226de4006cc158423f6494ad17bf052",
            //     "user_id":"325386",
            //     "client_version":"1.2.8",
            //     "nonce":1576703010,
            //     "method":"NoticeBox.get_notices",
            //     "args":[]
            // }
            
            let self = this;
            request.getContent(function(content, encoding) {
                let parsed = JSON.parse(content);
                // console.log(requestJSON.method);
                // console.log(requestJSON);
                // console.log(parsed);
                
                Kanpani.log(requestJSON);
                Kanpani.log(parsed);
                Kanpani.log('==================================')

                if (!parsed) {
                    return
                }
                let body = parsed['body'];
                if (!body) return;

                let userInfo = parsed['user'];
                if (userInfo) {
                    KTPlayerManager.updatePlayer(userInfo);  
                    var player = KTPlayerManager.getPlayer();
                    player.server = getServer(url);

                    KTPlayerManager.saveToLocalStorage();  
                    KTUIManager.updateResourceUI();
                }
                
                self.handleMyPageRequest(requestJSON, body, lang);
                self.handleQuestRequest(requestJSON, body, lang);
                self.handleEquipmentRequest(requestJSON, body, lang);
                self.handleResourceStatusRequest(requestJSON, body, lang);
                self.handleCardSituationSceneRequest(requestJSON, body, lang);
                self.handleCardSituationTextRequest(requestJSON, body, lang);
                self.handleGetCardsAll(requestJSON, body, lang);
                self.handleCardGrowth(requestJSON, body, lang);
                self.handleDeckOrganizeRequest(requestJSON, body, lang);
                self.handleDeckGetRequest(requestJSON, body, lang);
                self.handleAllDecksGetRequest(requestJSON, body, lang);
                self.handleMoveCardRequest(requestJSON, body, lang);
                self.handleEquipRequest(requestJSON, body, lang);
                self.handleGetAllBuildingsRequest(requestJSON, body, lang);
                self.handleStartRoundRequest(requestJSON, body, lang);
                self.handleRaidStartRoundRequest(requestJSON, body, lang);
                self.handleQuestFinish(requestJSON, body, lang);
                self.handleGetCardBook(requestJSON, body, lang);
                self.handleLargeBossGetEquipment(requestJSON, body, lang);
                self.handleProduceRequest(requestJSON, body, lang);
                self.handleGachaSelect(requestJSON, body, lang);
                // self.handleGachaDraw(requestJSON, body, lang);
                self.handlePromote(requestJSON, body, lang);
                self.handleGetPRDescription(requestJSON, body, lang);
                self.handleGetBuildingRequest(requestJSON, body, lang);

                self.handleDungeonMove(requestJSON, body, lang);
                self.handleDungeonEnter(requestJSON, body, lang);
                self.handleDungeonFloor(requestJSON, body, lang);
                self.handleDungeonScenario(requestJSON, body, lang);

                self.handleEvent17083101Get(requestJSON, body, lang);
                self.handleEvent16102801ListenStaffTalk(requestJSON, body, lang);
            });
        },

        handleMyPageRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Mypage.get'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            GA.pageView();
        },

        handleDeckGetRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'deck.get',
                'Deck.get',
                'Deck.set_leader',
                'Deck.set_slot',
                'Deck.unset_slot',
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.loadDeck(body);
            Kanpani.updateEmployeeList();
        },

        handleGetBuildingRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                "Territory.get_building"
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            console.log(body.assign_cards);
            Kanpani.updateCards(body.assign_cards);
            Kanpani.updateEmployeeList();
        },

        handleDeckOrganizeRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'DeckOrganize.top',
                'DeckOrganize.unset_slot',
                'DeckOrganize.set_slot',
            ];

            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            var deck = body['Deck.get'];
            if (!deck) return;

            Kanpani.loadDeck(deck);
            Kanpani.updateEmployeeList();
        },

        handleAllDecksGetRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Deck.get_all',
                'deck.get_all'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.loadAllDecks(body);
            Kanpani.updateEmployeeList();
        },

        handleMoveCardRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'deck.move_between_decks'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            Kanpani.moveCardBetweenDecks(body);
        },

        handleQuestRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Quest.character_enter',
                'Quest.special_enter',
                'Quest.main_enter',
                'Quest.restore',
                'Quest.next',
                'Quest.Next',
                'QuestBook.enter',
                'QuestBook.next',
                'Event17052601.shipment_quest_enter'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            if (requestJSON.method.search('restore') > -1) {
                Kanpani.readQuestLog(body['base']);    
            } else {
                Kanpani.readQuestLog(body);
            }   
        },

        handleEvent17052601OpenMessageRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Event17052601.get_rare_shipment_open_message'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.readOpenMessage(body);
        },

        handleEvent17083101Get: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Event17083101.get'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.event17083101Get(body);
        },

        handleCardSituationSceneRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'CardBook.get_card_situation_scenario'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.readCardSituationScene(body['scenes']);
        },

        handleCardSituationTextRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'CardBook.get_card_situation_text'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.readCardSituationText(body);
        },

        handleEquipmentRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'EquipmentBox.get_equipments_at_part'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
        },

        handleResourceStatusRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Territory.get_resource_status'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            var player = KTPlayerManager.getPlayer();
            if (!player) return;
            
            player.setRecover(body);
            KTPlayerManager.saveToLocalStorage();
        },

        handleCardGrowth: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'CardGrowth.top'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            var player = KTPlayerManager.getPlayer();
            if (!player) return;
            
            if (body['CardBox.get_cards_all']) {
                player.setCardList(body['CardBox.get_cards_all']);
                KTPlayerManager.saveToLocalStorage();
                Kanpani.updateEmployeeList();
            }
        },

        handleGetCardsAll: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'CardBox.get_cards_all'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            var player = KTPlayerManager.getPlayer();
            if (!player) return;
            
            player.setCardList(body);
            KTPlayerManager.saveToLocalStorage();
            Kanpani.updateEmployeeList();
        },

        handleEquipRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'CardBox.equip',
                'CardBox.unequip'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.updateSkill(body);
            Kanpani.updateEmployeeList();
        },

        handleGetAllBuildingsRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Territory.get_all_buildings'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            var resourceBuilding = body['resource'];
            var PRBuilding = body['publicity'];

            KTUIManager.updateRawResources(resourceBuilding.assign_cards);
            
            var player = KTPlayerManager.getPlayer();
            if (!player) return;

            player.PRLevel = PRBuilding.current.level;
            KTPlayerManager.saveToLocalStorage();
        },

        handleStartRoundRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Quest.start_round',
                'battlefield.start_round',
                'Dungeon.start_round',
                'dungeon.start_round'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.updateBattle(body);
        },

        handleRaidStartRoundRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'BossTower.start_round'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.updateRaidBattle(body);
        },        

        handleQuestFinish: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Quest.finish'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.finishQuest(body);
            Kanpani.updateEmployeeList();
        },

        handleGetCardBook: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'CardBook.get_cards'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.updateCardBook(body, lang);
        },

        handleLargeBossGetEquipment: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'largeBoss.get_equipment_notice',
                'LargeBoss.reroll_equipment'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.updateRaidAccessory(body);
        },

        handleProduceRequest: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Territory.produce'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.craftEquipment(body);
        },

        handleGachaSelect: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Gacha.select',
                'Gacha.Select'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.recruit(body);
        },

        handlePromote: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'transmigration.transmigrate'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.promote(body);
        }, 

        handleEvent16102801ListenStaffTalk: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Event16102801.listen_staff_talk'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.event16102801ListenStaffTalk(body);
        },

        handleDungeonEnter: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Dungeon.enter'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.enterDungeon(body);
        },

        handleDungeonMove: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Dungeon.move'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;
            
            Kanpani.moveDungeon(body);
        },

        handleDungeonFloor: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Dungeon.top',
                'Dungeon.floor',
                'dungeon.floor'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.updateDungeonFloor(body);
        },

        handleDungeonScenario: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Dungeon.get_scenario'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.readDungeonLogs(body);
        },

        handleGachaDraw: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Gacha.draw_free',
                'ItemBox.use',
                'Gacha.draw'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            for(var i=0;i<KTConst.drawTypes.length;i++) {
                if (requestJSON.method.includes(KTConst.drawTypes[i])) {
                    // Kanpani.getDrawResult(params, body, KTConst.drawTypes[i]);
                    break;
                }
            }
        },

        handleGetPRDescription: function(requestJSON, body, lang) {
            var acceptedUrls = [
                'Territory.get_publicity_description'
            ];
            if (!isExpectedRequest(requestJSON.method, acceptedUrls)) return;

            Kanpani.updatePRDescription(body);
        }
        
    }
})();