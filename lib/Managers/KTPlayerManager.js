(function(){
    "use strict";

    var updateCardListTimer = null;
    var updateDeckListTimer = null;
    var updateCardBookTimer = null;
    var updatePlayerInfoTimer = null;

    window.KTPlayerManager = {
        playerDict: {},
        playerId: null,
        
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
                    'playerDict': self.playerDict,
                    'playerId': self.playerId
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

                if (playerInfo.playerDict) {
                    for(var key in playerInfo.playerDict) {
                        self.playerDict[key] = new Player(playerInfo.playerDict[key]);
                    }
                }
                if (playerInfo.playerId) self.playerId = playerInfo.playerId;

                if (typeof callback == 'function') callback();
            });
        },

        getPlayer: function() {
            if (!this.playerId || !this.playerDict[this.playerId]) return null;
            return this.playerDict[this.playerId];
        },

        updatePlayer: function(player) {
            var newPlayer = new Player();
            newPlayer.setPlayerInfo(player);
            this.playerId = newPlayer.getId();

            if (!this.getPlayer()) {
                this.playerDict[this.playerId] = newPlayer;
            }

            var currentPlayer = this.getPlayer();
            currentPlayer.playerInfo = player;
            currentPlayer.last_update_resource = nowTime();

            this.updatePlayerInfoOnServer();
        },

        updatePlayerCardListOnServer: function() {
            if (updateCardListTimer == null) {
                var self = this;
                updateCardListTimer = setTimeout(function() {
                    updateCardListTimer = null;

                    var player = self.getPlayer();
                    if (!player || !player.getKToken()) return;

                    $.post(Kanpani.HOST + '/player/update_card_list', {
                        'k_token': player.getKToken(),
                        'card_list': player.getCardList()
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });
                    
                }, 4*60*1000);
            }
        },

        updateDeckListOnServer: function() {
            if (updateDeckListTimer == null) {
                var self = this;
                updateDeckListTimer = setTimeout(function() {
                    updateDeckListTimer = null;

                    var player = self.getPlayer();
                    if (!player || !player.getKToken()) return;

                    $.post(Kanpani.HOST + '/player/update_deck_list', {
                        'k_token': player.getKToken(),
                        'deck_list': player.decks
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });

                }, 6*60*1000);
            }
        },

        updateCardBookOnServer: function() {
            if (updateCardBookTimer == null) {
                var self = this;
                updateCardBookTimer = setTimeout(function() {
                    updateCardBookTimer = null;

                    var player = self.getPlayer();
                    if (!player || !player.getKToken()) return;

                    $.post(Kanpani.HOST + '/player/update_card_book', {
                        'k_token'   : player.getKToken(),
                        'card_book' : player.cardBook
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });

                }, 60*1000);
            }
        },

        updatePlayerInfoOnServer: function() {
            if (updatePlayerInfoTimer == null) {
                var self = this;
                updatePlayerInfoTimer = setTimeout(function() {
                    updatePlayerInfoTimer = null;
    
                    var player = self.getPlayer();
                    if (!player || !player.getKToken()) return;
                    
                    $.post(Kanpani.HOST + '/player/update_player_info', {
                        'k_token': player.getKToken(),
                        'player_info': player.playerInfo
                    }, function(response) {
                        if (response.code == 0 && response.data == 'Invalid Token') {
                            window.KTUIManager.logout(response.data);
                        }
                    });

                }, 5*10*1000);
            }
        },

        setCardList: function(cardList) {
            var player = this.getPlayer();
            if (!player) return;

            player.setCardList(cardList);
            this.updatePlayerCardListOnServer();
        },

        loadDeck: function(index, cards) {
            var player = this.getPlayer();
            if (!player) return;

            player.loadDeck(index, cards);
            this.updateDeckListOnServer();
        },

        updateCardBook: function(card, lang) {
            var player = this.getPlayer();
            if (!player) return;

            player.updateCardBook(card, lang);
            this.updateCardBookOnServer();
        }
    }
})();