(function(){
    "use strict";

    window.KTConfigManager = {
        config: {
            'version'                   : 5,
            'strategy_type'             : 'normal',
            'language'                  : 'en',
            'allow_to_share_data'       : true,
            'sort_by'                   : 'highest-rarity',
            'employees_additional_info' : 'strategy',
            'include_in_news'           : true,
            'news_refresh_interval'     : '10',
            'news_order'                : 'newest-top'
        },

        saveToLocalStorage: function() {
            var self = this;
            chrome.storage.local.set({
                'KTConfig': {
                    'config': self.config
                }
            });
        },

        loadFromLocalStorage: function(callback) {
            var self = this;
            chrome.storage.local.get('KTConfig', function(configInfo) {
                if (!configInfo || !configInfo.KTConfig) {
                    if (typeof callback == 'function') callback();
                    return;
                }
                configInfo = configInfo.KTConfig;

                if (configInfo.config && self.config.version == configInfo.config.version) self.config = configInfo.config;
                if (typeof callback == 'function') callback();
            });
        },

        setPolicyType: function(policyType) {
            this.config['strategy_type'] = policyType;
        },

        setSortBy: function(sortByValue) {
            this.config['sort_by'] = sortByValue;
        },

        setEmployeesTabAdditionalInfo: function(value) {
            this.config['employees_additional_info'] = value;
        },

        setIncludeInNews: function(value) {
            this.config['include_in_news'] = value;
        },

        setNewsRefreshInterval: function(value) {
            this.config['news_refresh_interval'] = value;
        },

        setNewsOrder: function(value) {
            this.config['news_order'] = value;
        },

        setLanguage: function(value) {
            this.config['language'] = value;
        }
    }
})();