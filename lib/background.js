chrome.runtime.onConnect.addListener(function(port) {
    if (port.name !== "devtools") return;

    console.log('listened');    
    port.onMessage.addListener(function(msg) {
        console.log('received msg');        
        if (msg.action == 'hackCookies') {
            chrome.tabs.executeScript(msg.tabId, { 
                file: 'lib/cookies.js'
            });
        }
    });
});