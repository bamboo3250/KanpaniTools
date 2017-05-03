(function(){
    "use strict";

    window.KTGameDataManager = {
        skillLibrary: {},

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'KTGameDataInfo': {
                    'skillLibrary': self.skillLibrary
                }
            });
        },

        loadFromLocalStorage: function(callback) {
            var self = this;
            chrome.storage.local.get('KTGameDataInfo', function(gameDataInfo) {
                if (!gameDataInfo || !gameDataInfo.KTGameDataInfo) {
                    if (typeof callback == 'function') callback();
                    return;
                }

                gameDataInfo = gameDataInfo.KTGameDataInfo;
                if (gameDataInfo.skillLibrary) self.skillLibrary = gameDataInfo.skillLibrary;
                
                if (typeof callback == 'function') callback();
            });
        },

        updateSkill: function(skill) {
            this.skillLibrary[skill.skill_id] = skill;
        },

        getSkill: function(skillId) {
            var skill = this.skillLibrary[skillId];
            if (skill) return skill;
            return null;
        }
    }
})();