(function() {
    document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/";
    document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame/";
    document.cookie = "cklg=welcome;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame_s/";
    document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/";
    document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame/";
    document.cookie = "ckcy=1;expires=Sun, 09 Feb 2019 09:00:09 GMT;domain=.dmm.com;path=/netgame_s/";
            
    const kanpaniUrl = 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=181259/';
    
    alert('Cookies is hacked successfully. Enjoy playing at DMM!');

    if (window.location.href != kanpaniUrl) {
        //window.location.href = kanpaniUrl;
        window.open(kanpaniUrl);
    }
})();