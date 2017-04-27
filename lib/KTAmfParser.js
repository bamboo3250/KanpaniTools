(function(){
    "use strict";

    window.KTAmfParser = {
        parse: function(binaryData) {
            var decode = decodeAMF(binaryData);
            return decode['messages'][0]['body'];
        }
    }
})();