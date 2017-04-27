(function(){
    "use strict";
    
    window.Kanpani = {
        SCENE_SEPARATOR: '=========End of Scene=========',

        init: function() {
            var self = this;
            console.log('KTCharacterManager loading');
            KTCharacterManager.init(function() {
                console.log('KTCharacterManager loaded');
                KTUIManager.loadFromLocalStorage(function() {
                    console.log('KTUIManager loaded');
                    KTPlayerManager.loadFromLocalStorage(function() {
                        console.log('KTPlayerManager loaded');
                        KTUIManager.updateUI();
                        var cardList = KTPlayerManager.getCardList();
                        KTUIManager.updateEmployeeList(cardList);
                        self.setTimer();
                        KTNetworkHandler.init();
                    });
                });
            });
        },

        readQuestLog: function(body) {
            var commands = body['commands'];
            var name = '';
            var colors = ['#911515', '#699114', '#149156', '#147e91', '#142691', '#611491', '#91146b']
            var colorIter = 0;
            var nameColorMap = {};
            var hasLines = false;

            for(var i=0;i<commands.length;i++) {
                var command = commands[i];
                if (command['command_type'] == 'page') {
                    var charaId = command['chara'] + '_' + command['hash'];

                    if (charaId == 'ceo_') {
                        name = 'CEO';
                    } else if (charaId == 'fairy_') {
                        name = 'Ruka';
                    } else {
                        name = KTCharacterManager.getEmployeeName(charaId);
                        if (name == null) name = command['card_name'];
                        if (name == null) name = charaId;
                    }

                } else if (command['command_type'] == 'text') {
                    var colorCode = '#000'
                    if (typeof nameColorMap[name] == 'undefined') {
                        nameColorMap[name] = colors[colorIter];
                        colorIter = (colorIter + 1)%(colors.length);
                    }

                    var text = '<font color="' + nameColorMap[name] + '"><b>[' + name + ']</b>: ' + command['text'] + '</font>';
                    KTUIManager.appendToQuestLog(text);
                    hasLines = true;
                }
            }
            if (hasLines) {
                KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
            }
        },

        readCardSituationScene: function(scenes) {
            var name = '';
            var colors = ['#911515', '#699114', '#149156', '#147e91', '#142691', '#611491', '#91146b']
            var colorIter = 0;
            var nameColorMap = {};
            var hasLines = false;

            for(var key in scenes) {
                for(var i=0;i<scenes[key].length;i++) {
                    var command = scenes[key][i];
                    if (command['command_type'] == 'page') {
                        var charaId = command['chara'] + '_' + command['hash'];

                        if (charaId == 'ceo_') {
                            name = 'CEO';
                        } else if (charaId == 'fairy_') {
                            name = 'Ruka';
                        } else {
                            name = KTCharacterManager.getEmployeeName(charaId);
                            if (name == null) name = command['card_name'];
                            if (name == null) name = charaId;
                        }

                    } else if (command['command_type'] == 'text') {
                        var colorCode = '#000'
                        if (typeof nameColorMap[name] == 'undefined') {
                            nameColorMap[name] = colors[colorIter];
                            colorIter = (colorIter + 1)%(colors.length);
                        }

                        var text = '<font color="' + nameColorMap[name] + '"><b>[' + name + ']</b>: ' + command['text'] + '</font>';
                        KTUIManager.appendToQuestLog(text);
                        hasLines = true;
                    }
                }        
            }
            if (hasLines) {
                KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
            }
        },

        readCardSituationText: function(body) {
            var text = '<font color="#911515">' + body + '</font>';
            KTUIManager.appendToQuestLog(text);
            KTUIManager.appendToQuestLog(this.SCENE_SEPARATOR);
        },

        setTimer: function() {
            var self = this;
            setInterval(function() {
                self.updateResourceTimer('food');
                self.updateResourceTimer('iron');
                self.updateResourceTimer('stone');
                self.updateResourceTimer('wood');
            }, 1000);    
        },

        updateResourceTimer: function(type) {
            var max = parseInt(KTPlayerManager.getResource('max_' + type));
            var cur = parseInt(KTPlayerManager.getResource(type));
            var rate = parseInt(KTPlayerManager.getRecover(type));
            var last = parseInt(KTPlayerManager.last_update_resource);
            
            // console.log(type + ' ' + cur + ' ' + max + ' ' + rate);

            if (last == null) return;
            if (rate == 0) {
                $('#timer-' + type).text('Check facility');
                return;
            }

            var now = new Date();
            var pre = cur;
            while (last + 3*60*1000 < now.valueOf()) {
                last += 3*60*1000;
                cur = Math.min(cur + rate, max);
            }
            if (now.getSeconds() == 0 && (now.getMinutes() % 3) == 0) cur = Math.min(cur + rate, max);

            if (pre != cur) {
                KTPlayerManager.setResource(type, cur);
                KTPlayerManager.last_update_resource = now.valueOf();
                KTPlayerManager.saveToLocalStorage();
                KTUIManager.updateUI();   
            }
            
            var numTick = Math.ceil(Math.max(0, (max - cur) / rate));
            if (numTick > 0) {
                var nextTick = new Date();
                nextTick.setUTCSeconds(0, 0);
                while((nextTick.getUTCMinutes() % 3) != 0) nextTick.setTime(nextTick.getTime() + 60* 1000);
                numTick--;
                nextTick.setTime(nextTick.getTime() + 3*60*1000 * numTick);
                var time = new KGTime(nextTick.valueOf() - now.valueOf());
                KTUIManager.setResourceTimer(type, time);

            } else {
                KTUIManager.setResourceTimer(type, 'Full');
            }
        },

        updateEmployeeList: function() {
            var cardList = KTPlayerManager.getCardList();
            KTUIManager.updateEmployeeList(cardList);
        }
    }
})();