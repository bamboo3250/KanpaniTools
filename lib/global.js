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