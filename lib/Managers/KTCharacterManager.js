(function(){
    "use strict";

    window.KTCharacterManager = {
        characters: [],

        init: function(callback) {
            var self = this;
            //console.log('reading');
            $.getJSON('lib/Database/EmployeeList.json', function( data ) {
                //console.log('finished reading');
                self.characters = data;
                callback();
            }).fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                console.log( "Request Failed: " + err );
            });
        },

        getEmployeeName: function(charaId) {
            for(var i=0;i<this.characters.length;i++) {
                if (this.characters[i]._id == charaId) return this.characters[i].commonNames[0];
            }
            return null;
        },

        getEmployeeFullName: function(charaId) {
            for(var i=0;i<this.characters.length;i++) {
                if (this.characters[i]._id == charaId) return this.characters[i].fullName;
            }
            return null;
        }
    }
})();