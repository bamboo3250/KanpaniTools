(function(){
    "use strict";

    window.KTCharacterManager = {
        characters: [],

        init: function() {
            var self = this;
            $.getJSON('../Database/EmployeeList.json', function( data ) {
                self.characters = data;
            });
        },

        getEmployeeName: function(charaId) {
            for(var i=0;i<this.characters.length;i++) {
                if (this.characters[i]._id == id) return this.characters[i].commonNames[0];
            }
            return null;
        }
    }
})();