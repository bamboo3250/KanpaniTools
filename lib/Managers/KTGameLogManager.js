(function(){
    "use strict";

    function handleLog(log, callback) {
    	var content = log.content;
    	var logId = '<b>[#' + log.id + ']</b> ';

		content = content.replace('promotion_1', '<b>Senior Staff (主任)</b>');
		content = content.replace('promotion_2', '<b>Section Manager (課長)</b>');

		var playerLevelText = '';
		if (typeof log.player_level != 'undefined' && log.player_level != '') {
			playerLevelText = ' (Lv' + (log.player_level) + ')';
		}

		var playerLevel = parseInt(log.player_level || '0');

		var playerNameText = log.player_name + playerLevelText;
		var playerNameClass = '';
		if (41 <= playerLevel && playerLevel < 51) {
			playerNameClass = 'player-41-50';
		} else if (51 <= playerLevel && playerLevel < 61) {
			playerNameClass = 'player-51-60';
		} else if (61 <= playerLevel && playerLevel < 71) {
			playerNameClass = 'player-61-70';
		} else if (71 <= playerLevel && playerLevel < 81) {
			playerNameClass = 'player-71-80';
		} else if (81 <= playerLevel) {
			playerNameClass = 'player-81';
		} 

		playerNameText = '<span class="' + playerNameClass + '">' + playerNameText + (log.player_id == '325386'?' <img src="./assets/leader.png">':'') + '</span>';

		var startPos = content.indexOf('{');
		if (startPos > -1) {
			var endPos = content.indexOf('}');
			var originalText = content.substring(startPos, endPos+1);
			var text = content.substring(startPos+1, endPos);
			var params = text.split(',');
			if (params[0] == 'equipment') {
				var iconId = params[1];
				var name = params[2] || '';

				window.KTUIManager.fetchEquipThumbnail(iconId, function(url) {
        			if (url) {
        				content = content.replace(originalText, '<b>' + name + '</b> <img class="news-image" src="' + url + '">');
        				window.KTUIManager.appendToNews(logId + '<b>' + playerNameText + '</b> ' + content + '!');
        			}
        			callback();
        		});
			} else if (params[0] == 'chara') {
				var iconId = params[1];
				var name = KTCharacterManager.getEmployeeName(iconId) || '';

				window.KTUIManager.fetchCharaThumbnail(iconId, function(url) {
        			if (url) {
        				content = content.replace(originalText, '<b>' + name + '</b> <img class="news-image" src="' + url + '">');
        				window.KTUIManager.appendToNews(logId + '<b>' + playerNameText + '</b> ' + content + '!');
        			}
        			callback();
        		});
			}
		} else {
			window.KTUIManager.appendToNews(logId + '<b>' + playerNameText + '</b> ' + content + '!');
			callback();
		}
    }

    window.KTGameLogManager = {
    	gameLogs: {},

    	sendLog: function(content) {
    		if (!KTConfigManager.config['include_in_news']) return;
    		
    		var playerId = KTPlayerManager.getPlayerId();
            var playerName = KTPlayerManager.getPlayerName();
            var playerLevel = KTPlayerManager.getPlayerLevel();

    		$.post(Kanpani.HOST + '/game_logs/add', {
    			content: content,
    			player_id: playerId,
    			player_name: playerName,
    			player_level: playerLevel
    		});
    	},

    	updateLogs: function(logs, forced = false) {
    		logs.sort(function(a, b) {
    			return a.id - b.id;
    		});
    		this.updateLogsRecursively(logs, 0, forced);
    	},

    	updateLogsRecursively(logs, index, forced) {
    		if (index >= logs.length) return;

    		var self = this;
    		var log = logs[index];
			if (typeof this.gameLogs[log.id] != 'undefined' && !forced) {
				this.updateLogsRecursively(logs, index+1, forced);
				return;
			}
			this.gameLogs[log.id] = log;
			handleLog(log, function() {
				self.updateLogsRecursively(logs, index+1, forced);
			});
    	}
    }
})();