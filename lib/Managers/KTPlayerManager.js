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

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'KTPlayerInfo': {
                    'player': self.player,
                    'recover': self.recover,
                    'last_update_resource': self.last_update_resource,
                    'card_list': self.card_list
                }
            });
            
            // localStorage.player = JSON.stringify(this.player);
            // localStorage.recover = JSON.stringify(this.recover);
            // localStorage.last_update_resource = this.last_update_resource;
        },

        loadFromLocalStorage: function(callback) {
            chrome.storage.local.get(null, function(items) {
                console.log(items);
            });

            var self = this;
            chrome.storage.local.get('KTPlayerInfo', function(playerInfo) {
                if (playerInfo && playerInfo.KTPlayerInfo) {
                    if (playerInfo.KTPlayerInfo.player) self.player = playerInfo.KTPlayerInfo.player;
                    if (playerInfo.KTPlayerInfo.recover) self.recover = playerInfo.KTPlayerInfo.recover;
                    if (playerInfo.KTPlayerInfo.last_update_resource) self.last_update_resource = playerInfo.KTPlayerInfo.last_update_resource;
                    if (playerInfo.KTPlayerInfo.card_list) self.card_list = playerInfo.KTPlayerInfo.card_list
                }
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
        }
    }
})();