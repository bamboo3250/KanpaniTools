(function(){
    "use strict";

    function handleLog(log) {
    	var content = log.content;

		content = content.replace('promotion_1', '<b>Senior Staff (主任)</b>');
		content = content.replace('promotion_2', '<b>Section Manager (課長)</b>');

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
        				window.KTUIManager.appendToNews('<b>' + log.player_name + '</b> ' + content + '!');
        			}
        		});
			} else if (params[0] == 'chara') {
				var iconId = params[1];
				var name = KTCharacterManager.getEmployeeName(iconId) || '';

				window.KTUIManager.fetchCharaThumbnail(iconId, function(url) {
        			if (url) {
        				content = content.replace(originalText, '<b>' + name + '</b> <img class="news-image" src="' + url + '">');
        				window.KTUIManager.appendToNews('<b>' + log.player_name + '</b> ' + content + '!');
        			}
        		});
			}
		} else {
			window.KTUIManager.appendToNews('<b>' + log.player_name + '</b> ' + content + '!');
		}
    }

    window.KTGameLogManager = {
    	gameLogs: {},

    	sendLog: function(content) {
    		if (!KTConfigManager.config['include_in_news']) return;
    		
    		var playerId = KTPlayerManager.getPlayerId();
            var playerName = KTPlayerManager.getPlayerName();
                
    		$.post(Kanpani.HOST + '/game_logs/add', {
    			content: content,
    			player_id: playerId,
    			player_name: playerName
    		});
    	},

    	updateLogs: function(logs) {
    		logs.sort(function(a, b) {
    			return a.id - b.id;
    		});
    		for(var i=0;i<logs.length;i++) {
    			var log = logs[i];
    			if (typeof this.gameLogs[log.id] != 'undefined') continue;
    			this.gameLogs[log.id] = log;
    			handleLog(log);
    		}
    	}
    }
})();