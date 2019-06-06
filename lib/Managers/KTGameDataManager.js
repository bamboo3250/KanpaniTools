(function(){
    "use strict";

    window.KTGameDataManager = {
        skillLibrary: {},
        charaLibrary: {},

        sync: function(callback) {
            this.loadFromLocalStorage(function() {
                Kanpani.log('KTGameDataManager loaded', true);
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
            if (typeof this.skillLibrary[skill.skill_id] == 'undefined') {
                this.skillLibrary[skill.skill_id] = skill;
            } else {
                for (var key in skill) {
                    this.skillLibrary[skill.skill_id][key] = skill[key];
                }
            }
        },

        getSkill: function(skillId) {
            var skill = this.skillLibrary[skillId];
            if (skill) return skill;
            return null;
        },

        retrieveMasterSkills: function(callback) {
            var self = this;
            $.getJSON(Kanpani.HOST + '/master/skills', function(data) {
                Kanpani.log('Master Skills: ' + data.length);
                var count = 0;
                for(var i=0;i<data.length;i++) {
                    var skill = data[i];

                    if ((typeof self.skillLibrary[skill.skill_id] == 'undefined') 
                        || (self.skillLibrary[skill.skill_id].en_name != skill.en_name)
                        || (self.skillLibrary[skill.skill_id].zh_name != skill.zh_name)
                        || (self.skillLibrary[skill.skill_id].exclusive != skill.exclusive)) {
                        self.updateSkill(skill);
                        count++;
                    }
                }
                Kanpani.log('updated ' + count + ' new skill(s)');
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
                data[''+key] = {
                    'id': key,
                    'name': skill.skill_name,
                    'details': JSON.stringify(skill)
                };
                count++;
            }
            Kanpani.log('send ' + count + ' new skill(s) to server');
            $.post(Kanpani.HOST + '/master/update_skills', data);
        },

        updateChara: function(chara) {
            if (this.charaLibrary[chara.img_dir]) return;

            this.charaLibrary[chara.img_dir] = {
                'chara_id'          : chara.img_dir,
                'short_name'        : chara.card_name,
                'full_name'         : chara.fullname,
                'description'       : chara.description,
                'height'            : chara.stature,
                'policy_type'       : chara.policy_type,
                'raid_policy_type'  : chara.vs_boss_policy_type,

                'card_no'           : 0,
                'extra'             : 0,
                'flavor_text'       : '',
                'honor_code'        : '',
                'honor_name'        : '',
                'illustrator'       : '',
                'voice_actor'       : '',

                'cw_id'             : 0
            };
        },

        updateCharaFromCardBook: function(cardBook, lang = 'jp') {
            var charaId = cardBook.img_dir;
            if (typeof this.charaLibrary[charaId] != 'undefined') {
                this.charaLibrary[charaId]['card_no']     = cardBook['card_no'];
                this.charaLibrary[charaId]['extra']       = cardBook['extra'];
                
                if (lang == window.KTConst.language.JP) {
                    this.charaLibrary[charaId]['honor_code']  = cardBook['honor_code'];
                    this.charaLibrary[charaId]['honor_name']  = cardBook['honor_name'];
                    this.charaLibrary[charaId]['illustrator'] = cardBook['illustrator'];
                    this.charaLibrary[charaId]['voice_actor'] = cardBook['voice_actor'];
                    this.charaLibrary[charaId]['flavor_text'] = cardBook['flavor_text'];
                    this.charaLibrary[charaId]['description'] = cardBook['description'];
                
                } else if (lang == window.KTConst.language.ZH) {
                    this.charaLibrary[charaId]['zh_flavor_text'] = cardBook['flavor_text'];
                    this.charaLibrary[charaId]['zh_description'] = cardBook['description'];
                }
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
                Kanpani.log('Master Characters: ' + data.length);
                var count = 0;
                for(var i=0;i<data.length;i++) {
                    var chara = data[i];
                    var libChara = self.charaLibrary[chara.chara_id];
                    var updated = 0;
                    if (typeof libChara == 'undefined') {
                        self.charaLibrary[chara.chara_id] = chara;
                        libChara = chara;
                        updated = 1;
                    }
                    const updateFields = ['en_short_name', 'en_full_name', 'zh_short_name', 'zh_full_name', 'cw_id'];
                    for(var j=0;j<updateFields.length;j++) {
                        var field = updateFields[j];
                        if (libChara[field] != chara[field]) {
                            self.charaLibrary[chara.chara_id][field] = chara[field];
                            updated = 1;
                        }                        
                    }
                    count += updated;
                }
                Kanpani.log('updated ' + count + ' new character(s)');
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
                var masterChara = masterCharaDict[chara.chara_id];

                if (typeof masterChara == 'undefined'
                    || (typeof chara.illustrator != 'undefined' && masterChara.illustrator == null)
                    || (typeof chara.voice_actor != 'undefined' && masterChara.voice_actor == null)
                    || (typeof chara.flavor_text != 'undefined' && masterChara.flavor_text == null)
                    || (typeof chara.description != 'undefined' && masterChara.description == null)) {
                    data[''+key] = {
                        'chara_id'          : chara.chara_id,
                        'short_name'        : chara.short_name,
                        'full_name'         : chara.full_name,
                        'description'       : chara.description || '',
                        'height'            : chara.height,
                        'policy_type'       : chara.policy_type,
                        'raid_policy_type'  : chara.raid_policy_type,
                        'card_no'           : chara.card_no || 0,
                        'extra'             : chara.extra || 0,
                        'flavor_text'       : chara.flavor_text || '',
                        'honor_code'        : chara.honor_code || '',
                        'honor_name'        : chara.honor_name || '',
                        'illustrator'       : chara.illustrator || '',
                        'voice_actor'       : chara.voice_actor || '',
                        'zh_description'    : chara.zh_description || '',
                        'zh_flavor_text'    : chara.zh_flavor_text || ''
                    };
                    count++;
                }
            }
            Kanpani.log('send ' + count + ' new character(s) to ' + Kanpani.HOST);
            $.post(Kanpani.HOST + '/master/update_characters', data);
        },

        getEmployeeName: function(charaId, lang = 'en') {
            var chara = this.getChara(charaId);
            if (chara) {
                if (lang == window.KTConst.language.JP) {
                    return chara.short_name;
                } else if (lang == window.KTConst.language.ZH) {
                    return chara.zh_short_name || chara.short_name;
                } else {
                    return chara.en_short_name || chara.short_name;
                }
            }
            return null;
        },

        getEmployeeFullName: function(charaId, lang = 'en') {
            var chara = this.getChara(charaId);
            if (chara) {
                if (lang == window.KTConst.language.JP) {
                    return chara.full_name;
                } else {
                    return chara.en_full_name || chara.full_name;
                }
            }
            return null;
        }
    }
})();