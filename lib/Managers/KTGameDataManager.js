(function(){
    "use strict";

    window.KTGameDataManager = {
        skillLibrary: {},
        charaLibrary: {},

        sync: function(callback) {
            this.loadFromLocalStorage(function() {
                console.log('KTGameDataManager loaded');
                if (typeof callback == 'function') callback();
            });
        },

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'KTGameDataInfo': {
                    'skillLibrary': self.skillLibrary,
                    'charaLibrary': self.charaLibrary
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
                if (gameDataInfo.charaLibrary) self.charaLibrary = gameDataInfo.charaLibrary;
                
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
            $.getJSON(Kanpani.HOST + '/master/skills', function(data) {
                console.log('Master Skills: ' + data.length);
                var count = 0;
                for(var i=0;i<data.length;i++) {
                    var skill = data[i];

                    if ((typeof self.skillLibrary[skill.skill_id] == 'undefined') 
                        || (self.skillLibrary[skill.skill_id].en_name != skill.en_name)
                        || (self.skillLibrary[skill.skill_id].exclusive != skill.exclusive)) {
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
            $.post(Kanpani.HOST + '/master/update_skills', data);
        },

        updateChara: function(chara) {
            if (typeof chara.chara_id != 'undefined') {
                this.charaLibrary[chara.chara_id] = chara;
            } else {
                if (this.charaLibrary[chara.img_dir]) return;

                this.charaLibrary[chara.img_dir] = {
                    'chara_id'          : chara.img_dir,
                    'short_name'        : chara.card_name,
                    'full_name'         : chara.fullname,
                    'description'       : chara.description,
                    'height'            : chara.stature,
                    'policy_type'       : chara.policy_type,
                    'raid_policy_type'  : chara.vs_boss_policy_type
                };
            }
        },

        getChara: function(charaId) {
            var chara = this.charaLibrary[charaId];
            if (chara) return chara;
            return null;
        },

        retrieveMasterCharacters: function(callback) {
            var self = this;
            $.getJSON(Kanpani.HOST + '/master/characters', function(data) {
                console.log('Master Characters: ' + data.length);
                var count = 0;
                for(var i=0;i<data.length;i++) {
                    var chara = data[i];
                    if (typeof self.charaLibrary[chara.chara_id] == 'undefined'
                        || (self.charaLibrary[chara.chara_id].en_short_name != chara.en_short_name)
                        || (self.charaLibrary[chara.chara_id].en_full_name != chara.en_full_name)) {
                        self.updateChara(chara);
                        count++;
                    }
                }
                console.log('updated ' + count + ' new character(s)');
                if (count > 0) self.saveToLocalStorage();

                callback(data);
            });
        },

        updateCharactersOnServer: function(masterChara) {
            var masterCharaDict = {};
            for(var i=0;i<masterChara.length;i++) {
                masterCharaDict[masterChara[i].chara_id] = masterChara[i];
            }

            var data = {};
            var count = 0;
            for(var key in this.charaLibrary) {
                var chara = this.charaLibrary[key];
                if (typeof masterCharaDict[chara.chara_id] == 'undefined') {
                    data[''+key] = {
                        'chara_id'          : chara.chara_id,
                        'short_name'        : chara.short_name,
                        'full_name'         : chara.full_name,
                        'description'       : chara.description || 'N.A',
                        'height'            : chara.height,
                        'policy_type'       : chara.policy_type,
                        'raid_policy_type'  : chara.raid_policy_type
                    };
                    count++;
                }
            }
            console.log('send ' + count + ' new character(s) to server');
            $.post(Kanpani.HOST + '/master/update_characters', data);
        },

        getEmployeeName: function(charaId, lang = 'en') {
            var chara = this.getChara(charaId);
            if (chara) {
                if (lang == 'jp') {
                    return chara.short_name;
                } else {
                    return chara.en_short_name;
                }
            }
            return null;
        },

        getEmployeeFullName: function(charaId, lang = 'en') {
            var chara = this.getChara(charaId);
            if (chara) {
                if (lang == 'jp') {
                    return chara.full_name;
                } else {
                    return chara.en_full_name;
                }
            }
            return null;
        }
    }
})();