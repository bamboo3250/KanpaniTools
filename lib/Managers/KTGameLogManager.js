(function(){
    "use strict";

    function createLog(drawResult, effects) {
        
    }

    window.KTGameLogManager = {
    	newsLogs: {},

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

    }
})();