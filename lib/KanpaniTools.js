var Kanpani = {
    player: null,
    resource: {
        recover_food: 0,
        recover_wood: 0,
        recover_iron: 0,
        recover_stone: 0
    },
    last_update_resource: null
};

Kanpani.saveToLocalStorage = function() {
    localStorage.player = JSON.stringify(this.player);
    localStorage.recover = JSON.stringify(this.resource);
    localStorage.last_update_resource = this.last_update_resource;
}

Kanpani.loadFromLocalStorage = function() {
    if (localStorage.player) this.player = JSON.parse(localStorage.player);
    if (localStorage.recover) this.resource = JSON.parse(localStorage.recover);
    if (localStorage.last_update_resource) this.last_update_resource = parseInt(localStorage.last_update_resource);
}

// GETTERS
Kanpani.getPlayerName = function() {
    if (!this.player || !this.player['status']) return '';
    return this.player['status']['company_name'];
}

Kanpani.getResource = function(res) {
    if (!this.player || !this.player['resources']) return 0;
    return parseInt(this.player['resources'][res]);
}

Kanpani.setResource = function(res, value = 0) {
    if (!this.player || !this.player['resources']) return;
    this.player['resources'][res] = parseInt(value);
}

Kanpani.updatePlayer = function(player) {
    this.player = player;
    this.last_update_resource = (new Date()).valueOf();
    this.saveToLocalStorage();
    this.updateUI();   
}

Kanpani.updateResourceStatus = function(body) {
    this.resource['recover_food'] = parseInt(body['recover_food']);
    this.resource['recover_wood'] = parseInt(body['recover_wood']);
    this.resource['recover_iron'] = parseInt(body['recover_iron']);
    this.resource['recover_stone'] = parseInt(body['recover_stone']);
    this.saveToLocalStorage();

    this.updateUI();
}

Kanpani.updateUI = function() {
    var displayedName = this.getPlayerName();
    if (displayedName.length>10) {
        displayedName = displayedName.substr(0, 10) + '...';
    }
    $('#player-name').text(displayedName);

    var food = this.getResource('food');
    var maxFood = this.getResource('max_food');
    var iron = this.getResource('iron');
    var maxIron = this.getResource('max_iron');
    var stone = this.getResource('stone');
    var maxStone = this.getResource('max_stone');
    var wood = this.getResource('wood');
    var maxWood = this.getResource('max_wood');

    $('#text-food').text(food + '/' + maxFood + ' (+' + this.resource['recover_food'] + ')');
    $('#text-iron').text(iron + '/' + maxIron + ' (+' + this.resource['recover_iron'] + ')');
    $('#text-wood').text(wood + '/' + maxWood + ' (+' + this.resource['recover_wood'] + ')');
    $('#text-stone').text(stone + '/' + maxStone + ' (+' + this.resource['recover_stone'] + ')');
    
    if (maxFood > 0) $('#cur-food').width($('#player-food').width()*food/maxFood);
    if (maxIron > 0) $('#cur-iron').width($('#player-iron').width()*iron/maxIron);
    if (maxWood > 0) $('#cur-wood').width($('#player-wood').width()*wood/maxWood);
    if (maxStone > 0) $('#cur-stone').width($('#player-stone').width()*stone/maxStone);
}

function getEmployeeName(id) {
    for(var i=0;i<employees.length;i++) {
        if (employees[i]._id == id) return employees[i].commonNames[0];
    }
    return null;
}

Kanpani.SCENE_SEPARATOR = '|=========End of Scene=========<br>';

Kanpani.readQuestLog = function(body) {
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
                name = getEmployeeName(charaId);
                if (name == null) name = command['card_name'];
                if (name == null) name = charaId;
            }

        } else if (command['command_type'] == 'text') {
            var colorCode = '#000'
            if (typeof nameColorMap[name] == 'undefined') {
                nameColorMap[name] = colors[colorIter];
                colorIter = (colorIter + 1)%(colors.length);
            }

            var text = '|<font color="' + nameColorMap[name] + '"><b>[' + name + ']</b>: ' + command['text'] + '</font><br>';
            $('#quest-log').append(text);
            hasLines = true;
        }
    }
    if (hasLines) {
        $('#quest-log').append(this.SCENE_SEPARATOR);
    }
}

Kanpani.readCardSituationScene = function(scenes) {
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
                    name = getEmployeeName(charaId);
                    if (name == null) name = command['card_name'];
                    if (name == null) name = charaId;
                }

            } else if (command['command_type'] == 'text') {
                var colorCode = '#000'
                if (typeof nameColorMap[name] == 'undefined') {
                    nameColorMap[name] = colors[colorIter];
                    colorIter = (colorIter + 1)%(colors.length);
                }

                var text = '|<font color="' + nameColorMap[name] + '"><b>[' + name + ']</b>: ' + command['text'] + '</font><br>';
                $('#quest-log').append(text);
                hasLines = true;
            }
        }        
    }
    if (hasLines) {
        $('#quest-log').append(this.SCENE_SEPARATOR);
    }
}

Kanpani.readCardSituationText = function(body) {
    var text = '|<font color="#911515">' + body + '</font><br>';
    $('#quest-log').append(text);
    $('#quest-log').append(this.SCENE_SEPARATOR);
}

function KGTime(timeInMillis = 0) {
    timeInMillis = Math.max(timeInMillis, 0);
    this.day = Math.floor(timeInMillis/(24*60*60*1000));
    this.hour = Math.floor((timeInMillis%(24*60*60*1000))/(60*60*1000));
    this.min = Math.floor((timeInMillis%(60*60*1000))/(60*1000));
    this.sec = Math.floor((timeInMillis%(60*1000))/(1000));
}

KGTime.prototype.toString = function() {
    return (this.day>0?this.day+':':'') + this.hour + ':' + (this.min<10?'0':'') + this.min +':' + (this.sec<10?'0':'') + this.sec;
}

Kanpani.setTimer = function() {
    var self = this;

    setInterval(function() {
        self.updateResource('food');
        self.updateResource('iron');
        self.updateResource('stone');
        self.updateResource('wood');
        self.updateUI();
    }, 1000);    
}

Kanpani.updateResource = function(type) {
    var max = parseInt(this.getResource('max_' + type));
    var cur = parseInt(this.getResource(type));
    var rate = parseInt(this.resource['recover_' + type]);
    var last = parseInt(this.last_update_resource);
    
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
        this.setResource(type, cur);
        this.last_update_resource = now.valueOf();
        this.saveToLocalStorage();    
    }
    
    var numTick = Math.ceil(Math.max(0, (max - cur) / rate));
    if (numTick > 0) {
        var nextTick = new Date();
        nextTick.setUTCSeconds(0, 0);
        while((nextTick.getUTCMinutes() % 3) != 0) nextTick.setTime(nextTick.getTime() +60* 1000);
        numTick--;
        nextTick.setTime(nextTick.getTime() + 3*60*1000 * numTick);
        var time = new KGTime(nextTick.valueOf() - now.valueOf());
        $('#timer-' + type).text(time);
    } else {
        $('#timer-' + type).text('Full');
    }
}

Kanpani.loadFromLocalStorage();
Kanpani.setTimer();