(function(){
    "use strict";

    function generateSessionId() {
        var text = "";
        var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        return text;
    }

    function createLog(type, data) {
        return {
            type: type,
            data: data,
            session_id: KTGameLogManager.sessionId,
            timpstamp: (new Date()).valueOf()
        }
    }

    window.KTGameLogManager = {
    	sessionId: generateSessionId(),
        newsLogs: {},
        gameLogs: [],

        sync: function(callback) {
            var self = this;
            self.loadFromLocalStorage(function() {
                Kanpani.log('KTGameLogManager loaded', true);
                if (typeof callback == 'function') callback();
            });
        },

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'gameLogs': self.gameLogs
            });
        },

        loadFromLocalStorage: function(callback) {
            var self = this;
            chrome.storage.local.get('gameLogs', function(data) {
                if (data && data.gameLogs) {
                    self.gameLogs = data.gameLogs;
                }
                Kanpani.log('Game Logs: ' + self.gameLogs.length);
                if (typeof callback == 'function') callback();
            });
        },

    	sendGameNews: function(content) {
    		if (!KTConfigManager.config['include_in_news']) return;
    		
    		var playerId = KTPlayerManager.getPlayerId();
            var playerName = KTPlayerManager.getPlayerName();
            var playerLevel = KTPlayerManager.getPlayerLevel();

            if (!playerId) return;
            
    		$.post(Kanpani.HOST + '/game_logs/add', {
    			content: content,
    			player_id: playerId,
    			player_name: playerName,
    			player_level: playerLevel
    		});
    	},

        getSortedLogList: function() {
            var logs = [];
            for(var key in this.newsLogs) {
                logs.push(this.newsLogs[key]);
            }
            logs.sort(function(a, b) {
                return a.id - b.id;
            });
            return logs;
        },

    	updateGameNews: function(logs) {
    		for (var i=0;i<logs.length;i++) {
                var log = logs[i];
                this.newsLogs[log.id] = log;
            }
    	},

        addGameLog: function(log) {
            this.gameLogs.push(log);
            Kanpani.log('Game Logs: ' + self.gameLogs.length);
            this.saveToLocalStorage();
        },

        trackDrawResult: function(type, cardIdList) {
            var effects = KTPlayerManager.getItemEffects();

            var drawData = {
                cards: cardIdList,
                effects: effects
            }

            var log = createLog(type, drawData);
            this.addGameLog(log);
        }
    }
})();