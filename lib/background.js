chrome.runtime.onConnect.addListener(function(port) {
    if (port.name !== "devtools") return;

    port.onMessage.addListener(function(msg) {
        if (msg.action == 'hackCookies') {
            chrome.tabs.executeScript(msg.tabId, { 
                file: 'lib/cookies.js'
            });
        }
    });
});