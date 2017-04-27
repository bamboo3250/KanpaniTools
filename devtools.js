chrome.devtools.panels.create("KanpaniTools", "icon.png", "panel.html", function(kanpaniToolsPanel) {
    var port = chrome.runtime.connect({name: 'devtools'});
    port.onMessage.addListener(function(msg) {
    });

    kanpaniToolsPanel.onShown.addListener(function tmp(panelWindow) {
        kanpaniToolsPanel.onShown.removeListener(tmp); // Run once only
        
        panelWindow.postMessageToBackground = function(action) {
            port.postMessage({
                action: action,
                tabId: chrome.devtools.inspectedWindow.tabId
            });
        };
    });
});