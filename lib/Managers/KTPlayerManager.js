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

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'KTPlayerInfo': {
                    'player': self.player,
                    'recover': self.recover,
                    'last_update_resource': self.last_update_resource,
                    'card_list': self.card_list,
                    'decks': self.decks
                }
            });
            
            // localStorage.player = JSON.stringify(this.player);
            // localStorage.recover = JSON.stringify(this.recover);
            // localStorage.last_update_resource = this.last_update_resource;
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
                if (playerInfo.card_list) self.card_list = playerInfo.card_list
                if (playerInfo.decks) self.decks = playerInfo.decks

                if (typeof callback == 'function') callback();
            });
            
            // if (localStorage.pla+-pdate_resource) this.last_update_resource = parseInt(localStorage.last_update_resource);
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

        setCardList: function(card_list) {
            this.card_list = card_list;
        },

        getCardList: function() {
            return this.card_list;
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
            for(var i=0;i<cards.length;i++) {
                deck[cards[i].slot] = cards[i];
            }
            this.decks[index] = deck;
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
                if (a != null && b == null) return -1;
                if (a.card_seq_id == b.card_seq_id) continue;

                var card = this.getCard(a.card_seq_id);
                if (!card) return -1;

                b.slot = card.card.slot;
                this.decks[card.deck_index][card.card.slot] = b;
                this.decks[index][i] = a;
                return card.deck_index;
            }
            return -1;
        }
    }
})();