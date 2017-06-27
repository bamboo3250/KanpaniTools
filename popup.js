(function(){
    "use strict";
    
    var version = chrome.runtime.getManifest().version;

    $(document).ready(function(){
        $("#extension-version").text(version);
        GA.pageView();
        
        $('#play_dmm').click(function() {
            GA.click('Play DMM clicked');
            window.open('http://www.dmm.com/netgame/social/-/gadgets/=/app_id=181259/');
        });

        $('#ceo-room').click(function() {
            GA.click('Opened CEO Room');
            window.open('./ceoroom.html');
        });

        $('#wiki').click(function() {
            GA.click('Wiki clicked');
            window.open('http://wikiwiki.jp/kanpani/');
        });

        $('#hbc-wiki').click(function() {
            GA.click('HBC Wiki clicked');
            window.open('http://harem-battle.club/wiki/Kanpani-Girls');
        });

        $('#twitter').click(function() {
            GA.click('Twitter clicked');
            window.open('https://twitter.com/kanpani_STAFF');
        });

        $('#discord').click(function() {
            GA.click('Discord clicked');
            window.open('https://discord.gg/CBpuFxV');
        });

        $('#changelog').click(function() {
            GA.click('Changelog clicked');
            window.open('https://discord.gg/Fa6fXbA'); 
        });
    });
    
})();
