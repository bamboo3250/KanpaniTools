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

        saveToLocalStorage: function() {
            localStorage.player = JSON.stringify(this.player);
            localStorage.recover = JSON.stringify(this.recover);
            localStorage.last_update_resource = this.last_update_resource;
        },

        loadFromLocalStorage: function() {
            if (localStorage.player) this.player = JSON.parse(localStorage.player);
            if (localStorage.recover) this.recover = JSON.parse(localStorage.recover);
            if (localStorage.last_update_resource) this.last_update_resource = parseInt(localStorage.last_update_resource);
        },

        getPlayerName: function() {
            if (!this.player || !this.player['status']) return '';
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
            if (isNaN(this.recover[res])) return 0;
            return parseInt(this.recover[res]);
        }
    }
})();