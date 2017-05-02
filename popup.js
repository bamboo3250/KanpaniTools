(function(){
    "use strict";
    
    var version = chrome.runtime.getManifest().version;

    $(document).ready(function(){
        $("#extension-version").text(version);

        $('#play_dmm').click(function() {
            _gaq.push(['_trackEvent', "Play DMM clicked", 'clicked']);
            window.open('http://www.dmm.com/netgame/social/-/gadgets/=/app_id=181259/');
        });

        $('#wiki').click(function() {
            _gaq.push(['_trackEvent', "Wiki clicked", 'clicked']);
            window.open('http://wikiwiki.jp/kanpani/');
        });

        $('#hbc-wiki').click(function() {
            _gaq.push(['_trackEvent', "HBC Wiki clicked", 'clicked']);
            window.open('http://harem-battle.club/wiki/Kanpani-Girls');
        });

        $('#twitter').click(function() {
            _gaq.push(['_trackEvent', "Twitter clicked", 'clicked']);
            window.open('https://twitter.com/kanpani_STAFF');
        });

        $('#discord').click(function() {
            _gaq.push(['_trackEvent', "Discord clicked", 'clicked']);
            window.open('https://discord.gg/CBpuFxV');
        });
    });
    
})();
