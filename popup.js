(function(){
    "use strict";
    
    var version = chrome.runtime.getManifest().version;

    $(document).ready(function(){
        $("#extension-version").text(version);

        $('#play_dmm').click(function() {
            window.open('http://www.dmm.com/netgame/social/-/gadgets/=/app_id=181259/');
        });

        $('#wiki').click(function() {
            window.open('http://wikiwiki.jp/kanpani/');
        });

        $('#hbc-wiki').click(function() {
            window.open('http://harem-battle.club/wiki/Kanpani-Girls');
        });

        $('#twitter').click(function() {
            window.open('https://twitter.com/kanpani_STAFF');
        });

        $('#discord').click(function() {
            window.open('https://discord.gg/CBpuFxV');
        });
    });
    
})();
