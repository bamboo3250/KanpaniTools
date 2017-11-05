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

    function createLog(type, data, playerId) {
        return {
            type: type,
            data: data,
            session_id: KTGameLogManager.sessionId,
            timestamp: (new Date()).valueOf(),
            user_id: playerId
        }
    }

    function isDrawLog(log) {
        for(var i=0;i<KTConst.drawTypes.length;i++) {
            if (log.type == KTConst.drawTypes[i]) return true;
        }
        return false;
    }

    window.KTGameLogManager = {
    	sessionId: generateSessionId(),
        newsLogs: {},
        gameLogs: [],
        dungeonLogs: {},

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
                'LogInfo': {
                    gameLogs: self.gameLogs
                }
            });
        },

        loadFromLocalStorage: function(callback) {
            var self = this;
            chrome.storage.local.get('LogInfo', function(data) {
                if (!data || !data.LogInfo) {
                    if (typeof callback == 'function') callback();
                    return;    
                }

                if (data.LogInfo.gameLogs) {
                    self.gameLogs = data.LogInfo.gameLogs;
                }
                
                Kanpani.log('Game Logs: ' + self.gameLogs.length);
                if (typeof callback == 'function') callback();
            });
        },

        clearGameLogs: function() {
            this.gameLogs = [];
            this.saveToLocalStorage();
        },

    	sendGameNews: function(content) {
    		if (!KTConfigManager.config['include_in_news']) return;
    		var player = KTPlayerManager.getPlayer();
            if (!player) return;
            

    		var playerId = player.getId();
            var playerName = player.getName();
            var playerLevel = player.getLevel();

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

        getDrawLogs: function() {
            var player = KTPlayerManager.getPlayer();
            if (!player) return null;

            var result = [];
            for(var i=0;i<this.gameLogs.length;i++) {
                if (isDrawLog(this.gameLogs[i])) {
                    result.push(this.gameLogs[i]);
                }
            }
            return result;
        },

        addGameLog: function(log) {
            this.gameLogs.push(log);
            Kanpani.log(log);
            Kanpani.log('Game Logs: ' + this.gameLogs.length);
            this.saveToLocalStorage();
        },

        trackDrawResult: function(type, params, cardIdList) {
            var player = KTPlayerManager.getPlayer();
            if (!player) return;
            
            var effects = player.getItemEffects();

            var drawData = {
                params: params,
                cards: cardIdList,
                effects: effects,
                PRDescription: player.PRDescription,
                PRLevel: player.PRLevel,
                cardsInPR: player.getCardListInPR()
            }

            var log = createLog(type, drawData, player.getId());
            this.addGameLog(log);
        },

        addDungeonReports: function(reports, shouldUpdate = true) {
            var newReports = [];
            for(var i=0;i<reports.length;i++) {
                var report = reports[i];

                if (typeof report.messages == 'string') {
                    report.messages = JSON.parse(report.messages);
                }

                if (typeof this.dungeonLogs[report.report_seq_id] == 'undefined') {
                    newReports.push(report);
                }
                this.dungeonLogs[report.report_seq_id] = report;
            }
            
            if (!shouldUpdate) return;
            var player = KTPlayerManager.getPlayer();
            if (!player || !player.server) return; 

            if (newReports.length > 0) {
                var data = {};
                for(var i=0;i<newReports.length;i++) {
                    newReports[i].server = player.server;
                    newReports[i].messages = JSON.stringify(newReports[i].messages);
                    data[''+i] = newReports[i];
                }
                $.post(Kanpani.HOST + '/dungeon_reports/add', data);
                Kanpani.log('Posted ' + newReports.length + ' Dungeon Report(s) to ' + Kanpani.HOST);
            }
        },

        getDungeonReportList: function() {
            var result = [];
            for(var key in this.dungeonLogs) {
                result.push(this.dungeonLogs[key]);
            }
            result.sort(function(a, b) {
                var expiredDateA = new Date(a.expire_date + ' GMT+0900');
                var expiredDateB = new Date(b.expire_date + ' GMT+0900');

                return expiredDateA.valueOf() < expiredDateB.valueOf();
            });
            return result;
        }
    }
})();