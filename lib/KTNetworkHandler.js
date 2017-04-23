var KTNetworkHandler = {};

KTNetworkHandler.init = function() {
    chrome.devtools.network.onRequestFinished.addListener(KTNetworkHandler.handleRequest);
};

function isGeneralRequest(url) {
    return (url.search('http://[0-9a-z.]*/amf\\?_c=[a-zA-Z0-9_.]+&_u=[0-9]+') > -1);
}

KTNetworkHandler.handleRequest = function(request) {
    var url = request.request.url;
    if (!isGeneralRequest(url)) return;
    console.log(url);
    
    request.getContent(function(content, encoding) {
        var parsed = KTAmfParser.parse(window.atob(content));
        console.log(parsed);
        var userInfo = parsed['user'];
        var body = parsed['body'];

        if (userInfo) {
            Kanpani.updatePlayer(userInfo);    
        }
        
        KTNetworkHandler.handleQuestRequest(url, body);
        KTNetworkHandler.handleEquipmentRequest(url, body);
        KTNetworkHandler.handleResourceStatusRequest(url, body);     
    });
};

function isExpectedRequest(url, urls) {
    for(var i=0;i<urls.length;i++) {
        if (url.search(urls[i]) > -1) return true;
    }
    return false;
}

KTNetworkHandler.handleQuestRequest = function(url, body) {
    var acceptedUrls = [
        'http://[0-9a-z.]*/amf\\?_c=Quest.character_enter&_u=[0-9]+',
        'http://[0-9a-z.]*/amf\\?_c=Quest.main_enter&_u=[0-9]+',
        'http://[0-9a-z.]*/amf\\?_c=Quest.restore&_u=[0-9]+',
        'http://[0-9a-z.]*/amf\\?_c=Quest.next&_u=[0-9]+'
    ];
    if (!isExpectedRequest(url, acceptedUrls)) return;

    if (url.search('restore') > -1) {
        Kanpani.readQuestLog(body['base']);    
    } else {
        Kanpani.readQuestLog(body);
    }
    
}

KTNetworkHandler.handleEquipmentRequest = function(url, body) {
    var acceptedUrls = [
        'http://[0-9a-z.]*/amf\\?_c=EquipmentBox.get_equipments_at_part&_u=[0-9]+'
    ];
    if (!isExpectedRequest(url, acceptedUrls)) return;
}

KTNetworkHandler.handleResourceStatusRequest = function(url, body) {
    var acceptedUrls = [
        'http://[0-9a-z.]*/amf\\?_c=Territory.get_resource_status&_u=[0-9]+'
    ];
    if (!isExpectedRequest(url, acceptedUrls)) return;
    
    Kanpani.updateResourceStatus(body);
}
