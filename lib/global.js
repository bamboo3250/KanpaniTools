var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-97949427-1']);
(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

var GA = {
    click: function(text) {
        if (Kanpani && !Kanpani.DEBUG) _gaq.push(['_trackEvent', text, 'clicked']);
    },
    pageView: function() {
        if (Kanpani && !Kanpani.DEBUG) _gaq.push(['_trackPageview']);
    }
}

function KGTime(timeInMillis = 0) {
    timeInMillis = Math.max(timeInMillis, 0);
    this.day = Math.floor(timeInMillis/(24*60*60*1000));
    this.hour = Math.floor((timeInMillis%(24*60*60*1000))/(60*60*1000));
    this.min = Math.floor((timeInMillis%(60*60*1000))/(60*1000));
    this.sec = Math.floor((timeInMillis%(60*1000))/(1000));
}

KGTime.prototype.toString = function() {
    var hasDay = this.day > 0; 
    return (hasDay?this.day+':':'') + (hasDay && this.hour<10?'0':'') + this.hour + ':' + (this.min<10?'0':'') + this.min +':' + (this.sec<10?'0':'') + this.sec;
}

function NameColorRegister() {
    this.colors = ['#911515', '#699114', '#149156', '#147e91', '#142691', '#611491', '#91146b']
    this.colorIter = 0;
    this.nameColorMap = {};   
}

String.prototype.trimWithDotTrailing = function(maxLength) {
    if (this.length <= maxLength) return this;
    return this.substr(0, maxLength) + '...';
}

NameColorRegister.prototype.getColorForName = function(name) {
    if (typeof this.nameColorMap[name] == 'undefined') {
        this.nameColorMap[name] = this.colors[this.colorIter];
        this.colorIter = (this.colorIter + 1)%(this.colors.length);
    }
    return this.nameColorMap[name];
}

function nowTime() {
    return (new Date()).valueOf();
}
//========================== PLAYER =============================

function createEmptyTeam() {
    return {
        '0': null,
        '1': null,
        '2': null,
        '3': null,
        '4': null,
        '5': null
    };
}

function Player(player) {
    this.playerInfo = null;
    this.recover = {
        food: 0,
        wood: 0,
        iron: 0,
        stone: 0
    };
    this.last_update_resource = null;
    this.cardList = [];
    this.decks = {
        '0': createEmptyTeam(),
        '1': createEmptyTeam(),
        '2': createEmptyTeam(),
        '3': createEmptyTeam(),
        '4': createEmptyTeam(),
        '5': createEmptyTeam()
    };
    this.cardBook = {};
    this.kToken = null;
    this.kUsername = null;
    this.defcon = null;
    this.PRDescription = null;
    this.PRLevel = null;
    this.server = null;

    if (!player) return;
    for(var key in this) {
        if (typeof player[key] != 'undefined') {
            this[key] = player[key];
        }
    }
}

Player.prototype.setPlayerInfo = function(player) {
    this.playerInfo = player;
};

Player.prototype.getId = function() {
    if (!this.playerInfo) return null;
    if (!this.playerInfo['status']) return null;
    return this.playerInfo['status']['user_id'];
};

Player.prototype.getKToken = function() {
    return this.kToken;
};

Player.prototype.getKUsername = function() {
    return this.kUsername;
};

Player.prototype.getLevel = function() {
    if (!this.playerInfo || !this.playerInfo['status']) return 0;
    return this.playerInfo['status']['level'];
};

Player.prototype.getName = function() {
    if (!this.playerInfo || !this.playerInfo['status']) return null;
    if (this.playerInfo['status']['company_name'] == '') return this.playerInfo['status']['nickname'];
    return this.playerInfo['status']['company_name'];
};

Player.prototype.getResource = function(res) {
    if (!this.playerInfo || !this.playerInfo['resources']) return 0;
    return parseInt(this.playerInfo['resources'][res]);
};

Player.prototype.setResource = function(res, value = 0) {
    if (!this.playerInfo || !this.playerInfo['resources']) return;
    this.playerInfo['resources'][res] = parseInt(value);
};

Player.prototype.getItemEffects = function() {
    if (!this.playerInfo || typeof this.playerInfo['status']['effects'] == 'undefined') {
        return [];    
    }
    return this.playerInfo['status']['effects'];
};

Player.prototype.setRecover = function(body) {
    this.recover['food'] = parseInt(body['recover_food']);
    this.recover['wood'] = parseInt(body['recover_wood']);
    this.recover['iron'] = parseInt(body['recover_iron']);
    this.recover['stone'] = parseInt(body['recover_stone']);
};

Player.prototype.getRecover = function(res) {
    if (!this.recover || isNaN(this.recover[res])) return 0;
    return parseInt(this.recover[res]);
};

Player.prototype.getRequestAt = function() {
    if (!this.playerInfo) return (new Date());
    return this.playerInfo.status.request_at;
};


Player.prototype.getCardBySeqId = function(seqId) {
    for(var i=0;i<this.cardList.length;i++) {
        var card = this.cardList[i];
        if (seqId == card.card_seq_id) {
            return card;
        }
    }
    return null;
};

Player.prototype.setCardList = function(cardList) {
    for(var i=0;i<cardList.length;i++) {
        var card = this.getCardBySeqId(cardList[i].card_seq_id);
        if (!card) continue;
        for(var key in card) {
            if ((typeof cardList[i][key] == 'undefined') && (key != 'deck_index')) cardList[i][key] = card[key];
        }         
    }
    this.cardList = cardList;
};

Player.prototype.getCardList = function() {
    return this.cardList;
};

Player.prototype.getCardListInPR = function() {
    var cardsInPR = [];
    for(var i=0;i<this.cardList.length;i++) {
        var card = this.cardList[i];
        if (card.assigned && card.assigned_building_id == 'publicity') {
            cardsInPR.push(card);
        }
    }
    return cardsInPR;
};

Player.prototype.updateCard = function(employee) {
    if (!employee) return;

    for(var i=0;i<this.cardList.length;i++) {
        var card = this.cardList[i];
        if (employee.card_seq_id == card.card_seq_id) {
            for(var key in card) {
                if (typeof employee[key] == 'undefined') employee[key] = card[key];
            }
            this.cardList.splice(i, 1, employee);
            return;
        }
    }
    this.cardList.push(employee);
};

Player.prototype.loadDeck = function(index, cards) {
    var deck = createEmptyTeam();

    var oldDeck = this.decks[index];
    for(var slotKey in oldDeck) {
        var employee = oldDeck[slotKey];
        if (!employee) continue;

        var card = this.getCardBySeqId(employee.card_seq_id);
        if (!card) continue;

        card.deck_index = null;
    }

    for(var i=0;i<cards.length;i++) {
        deck[cards[i].slot] = cards[i];
    }
    this.decks[index] = deck;
};

Player.prototype.getDeck = function(index) {
    return this.decks['' + index];
};

Player.prototype.getCard = function(seqId) {
    for(var i=0;i<6;i++) {
        for(var j=0;j<6;j++) {
            var card = this.decks[''+i][''+j];
            if (!card) continue;

            if (parseInt(card.card_seq_id) == parseInt(seqId)) {
                return {
                    'deck_index': i,
                    'card': card
                };
            }
        }
    }
    return null;
},

Player.prototype.moveCardBetweenDecks = function(index, cards) {
    var newDeck = createEmptyTeam();
    for(var i=0;i<cards.length;i++) {
        newDeck[cards[i].slot] = cards[i];
    }

    var oldDeck = this.getDeck(index);
    for(var i=0;i<6;i++) {
        var a = newDeck[''+i];
        var b = oldDeck[''+i];
        if (a == null && b == null) continue;
        if (a == null && b != null) return -1;
        
        var oldCard = this.getCard(a.card_seq_id);
        if (!oldCard) return -1;
        if (b != null && a.card_seq_id == b.card_seq_id) continue;

        if (b != null) {
            b.deck_index = '' + oldCard.deck_index;
            b.slot = oldCard.card.slot;
        }
        

        this.getDeck(oldCard.deck_index)[''+oldCard.card.slot] = b;
        this.getDeck(index)[''+i] = a;
        this.updateCard(a);
        this.updateCard(b);

        return oldCard.deck_index;
    }
    return -1;
};

Player.prototype.updateCardBook = function(card, lang) {
    this.cardBook[card.img_dir] = card;
};
