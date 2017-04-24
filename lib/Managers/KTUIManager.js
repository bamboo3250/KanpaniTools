(function(){
    "use strict";
    
    window.KTUIManager = {
        updateUI: function() {
            var displayedName = KTPlayerManager.getPlayerName();
            if (displayedName.length>10) {
                displayedName = displayedName.substr(0, 10) + '...';
            }
            $('#player-name').text(displayedName);

            var food        = KTPlayerManager.getResource('food');
            var maxFood     = KTPlayerManager.getResource('max_food');
            var regenFood   = KTPlayerManager.getRecover('food');

            var iron        = KTPlayerManager.getResource('iron');
            var maxIron     = KTPlayerManager.getResource('max_iron');
            var regenIron   = KTPlayerManager.getRecover('iron');

            var stone       = KTPlayerManager.getResource('stone');
            var maxStone    = KTPlayerManager.getResource('max_stone');
            var regenStone  = KTPlayerManager.getRecover('stone');

            var wood        = KTPlayerManager.getResource('wood');
            var maxWood     = KTPlayerManager.getResource('max_wood');
            var regenWood   = KTPlayerManager.getRecover('wood');

            $('#text-food').text(food + '/' + maxFood + ' (+' + regenFood + ')');
            $('#text-iron').text(iron + '/' + maxIron + ' (+' + regenIron + ')');
            $('#text-wood').text(wood + '/' + maxWood + ' (+' + regenWood + ')');
            $('#text-stone').text(stone + '/' + maxStone + ' (+' + regenStone + ')');
            
            if (maxFood > 0) $('#cur-food').width($('#player-food').width()*food/maxFood);
            if (maxIron > 0) $('#cur-iron').width($('#player-iron').width()*iron/maxIron);
            if (maxWood > 0) $('#cur-wood').width($('#player-wood').width()*wood/maxWood);
            if (maxStone > 0) $('#cur-stone').width($('#player-stone').width()*stone/maxStone);
        },
        appendToQuestLog: function(text) {
            $('#quest-log').append('|' + text + '<br>');
        },
        setResourceTimer: function(type, text) {
            $('#timer-' + type).text(text);
        }
    }
})();