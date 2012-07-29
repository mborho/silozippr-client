var Connector = (function(apiEndpoint) {
    var _apiEndpoint = apiEndpoint;
    
    return {
        getApiEndpoint: function() {
            return _apiEndpoint;
        },
        loadToc: function() {
            return new enyo.Ajax({url: _apiEndpoint+'/api/toc/get'}).go();
        },
        loadList: function(params) {
            return new enyo.Ajax({url: _apiEndpoint+"/api/list/docs"}).go(params);
        }
    }
});