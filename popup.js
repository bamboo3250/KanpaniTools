(function(){
    "use strict";
    
    var version = chrome.runtime.getManifest().version;

    $(document).ready(function(){
        $("#extension-version").text(version);
        if (!Kanpani.DEBUG) _gaq.push(['_trackPageview']);
        
        $('#play_dmm').click(function() {
            if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Play DMM clicked", 'clicked']);
            window.open('http://www.dmm.com/netgame/social/-/gadgets/=/app_id=181259/');
        });

        $('#wiki').click(function() {
            if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Wiki clicked", 'clicked']);
            window.open('http://wikiwiki.jp/kanpani/');
        });

        $('#hbc-wiki').click(function() {
            if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "HBC Wiki clicked", 'clicked']);
            window.open('http://harem-battle.club/wiki/Kanpani-Girls');
        });

        $('#twitter').click(function() {
            if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Twitter clicked", 'clicked']);
            window.open('https://twitter.com/kanpani_STAFF');
        });

        $('#discord').click(function() {
            if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Discord clicked", 'clicked']);
            window.open('https://discord.gg/CBpuFxV');
        });

        $('#changelog').click(function() {
            if (!Kanpani.DEBUG) _gaq.push(['_trackEvent', "Changelog clicked", 'clicked']);
            window.open('https://discord.gg/Fa6fXbA'); 
        });
    });
    
})();
