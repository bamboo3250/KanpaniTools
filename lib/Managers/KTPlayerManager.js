(function(){
    "use strict";
    
    window.KTPlayerManager = {
        player: null,
        recover: {
            food: 0,
            wood: 0,
            iron: 0,
            stone: 0
        },
        last_update_resource: null,
        card_list: [],
        decks: {
            '0': {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            },
            '1': {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            },
            '2': {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            },
            '3': {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            },
            '4': {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            },
            '5': {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            }
        },
        card_book: {},
        k_token: {},
        k_username: {},

        updateCardListTimer: null,
        updateDeckListTimer: null,
        updateCardBookTimer: null,
        updatePlayerInfoTimer: null,

        defcon: null,

        getKToken: function() {
            var playerId = this.getPlayerId();
            if (!playerId) return null;
            return this.k_token[playerId];
        },

        getKUsername: function() {
            var playerId = this.getPlayerId();
            if (!playerId) return null;
            return this.k_username[playerId];
        },

        sync: function(callback) {
            this.loadFromLocalStorage(function() {
                Kanpani.log('KTPlayerManager loaded', true);
                if (typeof callback == 'function') callback();
            });
        },

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'KTPlayerInfo': {
                    'player': self.player,
                    'recover': self.recover,
                    'last_update_resource': self.last_update_resource,
                    'card_list': self.card_list,
                    'decks': self.decks,
                    'card_book': self.card_book,
                    'k_token': self.k_token,
                    'k_username': self.k_username,
                    'defcon': self.defcon
                }
            }, function() {
                // Kanpani.log('KTPlayerInfo saved');
            });
        },

        loadFromLocalStorage: function(callback) {
            // chrome.storage.local.get(null, function(items) {
            //     console.log(items);
            // });

            var self = this;
            chrome.storage.local.get('KTPlayerInfo', function(playerInfo) {
                if (!playerInfo || !playerInfo.KTPlayerInfo) {
                    if (typeof callback == 'function') callback();
                    return;
                }
                playerInfo = playerInfo.KTPlayerInfo;

                if (playerInfo.player) self.player = playerInfo.player;
                if (playerInfo.recover) self.recover = playerInfo.recover;
                if (playerInfo.last_update_resource) self.last_update_resource = playerInfo.last_update_resource;
                if (playerInfo.card_list) self.card_list = playerInfo.card_list;
                if (playerInfo.decks) self.decks = playerInfo.decks;
                if (playerInfo.card_book) self.card_book = playerInfo.card_book;
                if (playerInfo.k_token) self.k_token = playerInfo.k_token;
                if (playerInfo.k_username) self.k_username = playerInfo.k_username;
                if (playerInfo.defcon) self.defcon = playerInfo.defcon;

                if (typeof callback == 'function') callback();
            });
        },

        getPlayerId: function() {
            if (!this.player || !this.player['status']) return null;
            return this.player['status']['user_id'];
        },

        getPlayerLevel: function() {
            if (!this.player || !this.player['status']) return null;
            return this.player['status']['level'];
        },

        getPlayerName: function() {
            if (!this.player || !this.player['status']) return '';
            if (this.player['status']['company_name'] == '') return this.player['status']['nickname']
            return this.player['status']['company_name'];
        },

        getResource: function(res) {
            if (!this.player || !this.player['resources']) return 0;
            return parseInt(this.player['resources'][res]);
        },

        setResource: function(res, value = 0) {
            if (!this.player || !this.player['resources']) return;
            this.player['resources'][res] = parseInt(value);
        },

        updatePlayer: function(player) {
            this.player = player;
            this.last_update_resource = (new Date()).valueOf();
            this.updatePlayerInfoOnServer();
        },

        setRecover: function(body) {
            this.recover['food'] = parseInt(body['recover_food']);
            this.recover['wood'] = parseInt(body['recover_wood']);
            this.recover['iron'] = parseInt(body['recover_iron']);
            this.recover['stone'] = parseInt(body['recover_stone']);
        },

        getRecover: function(res) {
            if (!this.recover || isNaN(this.recover[res])) return 0;
            return parseInt(this.recover[res]);
        },

        getItemEffects: function() {
            if (this.player && typeof this.player.status.effects != 'undefined') {
                return this.player.status.effects;
            }
            return [];
        },

        getRequestAt: function() {
            if (!this.player) return (new Date());
            return this.player.status.request_at;
        },

        updatePlayerCardListOnServer: function() {
            if (this.updateCardListTimer == null) {
                var self = this;
                this.updateCardListTimer = setTimeout(function() {

                    self.updateCardListTimer = null;

                    var kToken = self.getKToken();
                    if (!kToken) return;
                    $.post(Kanpani.HOST + '/player/update_card_list', {
                        'k_token': kToken,
                        'card_list': self.getCardList()
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });
                    
                }, 30*1000);
            }
        },

        updateDeckListOnServer: function() {
            if (this.updateDeckListTimer == null) {
                var self = this;
                this.updateDeckListTimer = setTimeout(function() {

                    self.updateDeckListTimer = null;

                    var kToken = self.getKToken();
                    if (!kToken) return;
                    $.post(Kanpani.HOST + '/player/update_deck_list', {
                        'k_token': kToken,
                        'deck_list': self.decks
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });

                }, 30*1000);
            }
        },

        updateCardBookOnServer: function() {
            if (this.updateCardBookTimer == null) {
                var self = this;
                this.updateCardBookTimer = setTimeout(function() {

                    self.updateCardBookTimer = null;

                    var kToken = self.getKToken();
                    if (!kToken) return;
                    var userId = self.getPlayerId();
                    if (!userId) return;

                    $.post(Kanpani.HOST + '/player/update_card_book', {
                        'k_token': kToken,
                        'card_book': self.card_book[userId]
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });

                }, 30*1000);
            }
        },

        updatePlayerInfoOnServer: function() {
            if (this.updatePlayerInfoTimer == null) {
                var self = this;
                this.updatePlayerInfoTimer = setTimeout(function() {

                    self.updatePlayerInfoTimer = null;
                    
                    var kToken = self.getKToken();
                    if (!kToken) return;
                    $.post(Kanpani.HOST + '/player/update_player_info', {
                        'k_token': kToken,
                        'player_info': self.player
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });

                }, 45*1000);
            }
        },

        setCardList: function(card_list) {
            for(var i=0;i<card_list.length;i++) {
                var card = this.getCardBySeqId(card_list[i].card_seq_id);
                if (!card) continue;
                for(var key in card) {
                    if ((typeof card_list[i][key] == 'undefined') && (key != 'deck_index')) card_list[i][key] = card[key];
                }         
            }
            this.card_list = card_list;
            this.updatePlayerCardListOnServer();
        },

        getCardList: function() {
            return this.card_list;
        },

        updateCard: function(employee) {
            if (!employee) return;

            for(var i=0;i<this.card_list.length;i++) {
                var card = this.card_list[i];
                if (employee.card_seq_id == card.card_seq_id) {
                    for(var key in card) {
                        if (typeof employee[key] == 'undefined') employee[key] = card[key];
                    }
                    this.card_list.splice(i, 1, employee);
                    return;
                }
            }
        },

        getCardBySeqId: function(seqId) {
            for(var i=0;i<this.card_list.length;i++) {
                var card = this.card_list[i];
                if (seqId == card.card_seq_id) {
                    return card;
                }
            }
            return null;
        },

        loadDeck: function(index, cards) {
            var deck = {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            };

            var oldDeck = this.decks[index];
            for(var slotKey in oldDeck) {
                var employee = oldDeck[slotKey];
                if (!employee) continue;

                var card = this.getCardBySeqId(employee.card_seq_id);
                if (!card) continue;

                card.deck_index = null;
            }

            for(var i=0;i<cards.length;i++) {
                deck[cards[i].slot] = cards[i];
            }
            this.decks[index] = deck;
            this.updateDeckListOnServer();
        },

        getDeck: function(index) {
            return this.decks[''+index];
        },

        getCard: function(seqId) {
            for(var i=0;i<6;i++) {
                for(var j=0;j<6;j++) {
                    var card = this.decks[''+i][''+j];
                    if (!card) continue;

                    if (parseInt(card.card_seq_id) == parseInt(seqId)) {
                        return {
                            'deck_index': i,
                            'card': card
                        };
                    }
                }
            }
            return null;
        },

        moveCardBetweenDecks: function(index, cards) {
            var newDeck = {
                '0': null,
                '1': null,
                '2': null,
                '3': null,
                '4': null,
                '5': null
            };
            for(var i=0;i<cards.length;i++) {
                newDeck[cards[i].slot] = cards[i];
            }

            var oldDeck = this.getDeck(index);
            for(var i=0;i<6;i++) {
                var a = newDeck[''+i];
                var b = oldDeck[''+i];
                if (a == null && b == null) continue;
                if (a == null && b != null) return -1;
                
                var oldCard = this.getCard(a.card_seq_id);
                if (!oldCard) return -1;
                if (b != null && a.card_seq_id == b.card_seq_id) continue;

                if (b != null) {
                    b.deck_index = '' + oldCard.deck_index;
                    b.slot = oldCard.card.slot;
                }
                

                this.getDeck(oldCard.deck_index)[''+oldCard.card.slot] = b;
                this.getDeck(index)[''+i] = a;
                this.updateCard(a);
                this.updateCard(b);

                return oldCard.deck_index;
            }
            return -1;
        },

        updateCardBook: function(card, lang) {
            if (!this.player) return false;

            var userId = this.getPlayerId();
            if (typeof this.card_book[userId] == 'undefined') {
                this.card_book[userId] = {};
            }

            this.card_book[userId][card.img_dir] = card;
            KTGameDataManager.updateCharaFromCardBook(card, lang);
            this.updateCardBookOnServer();
            return true;
        }
    }
})();