(function(){
    "use strict";

    //const HOST = 'localhost:8000';  // dev
    const HOST = '67.205.150.236';  // staging

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
        },

        retrieveMasterSkills: function(callback) {
            var self = this;
            $.getJSON('http://' + HOST + '/master/skills', function(data) {
                console.log('Master Skills: ' + data.length);
                var count = 0;
                for(var i=0;i<data.length;i++) {
                    var skill = data[i];
                    if (typeof self.skillLibrary[skill.skill_id] == 'undefined') {
                        self.updateSkill(skill);
                        count++;
                    }
                }
                console.log('updated ' + count + ' new skill(s)');
                if (count > 0) self.saveToLocalStorage();

                callback(data);
            });
        },

        updateSkillsOnServer: function(masterSkills) {
            var masterSkillDict = {};
            for(var i=0;i<masterSkills.length;i++) {
                masterSkillDict[masterSkills[i].skill_id] = masterSkills[i];
            }

            var data = {};
            var count = 0;
            for(var key in this.skillLibrary) {
                var skill = this.skillLibrary[key];
                if (typeof masterSkillDict[skill.skill_id] == 'undefined') {
                    data[''+key] = {
                        'id': key,
                        'name': skill.skill_name,
                        'details': JSON.stringify(skill)
                    };
                    count++;
                }
            }
            console.log('send ' + count + ' new skill(s) to server');
            $.post('http://' + HOST + '/master/update_skills', data);
        }
    }
})();