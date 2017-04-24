var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-97949427-1']);
(function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();


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
