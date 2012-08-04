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
        },
        loadSourceInfo: function(id) {
            var params = {id:id};
            return new enyo.Ajax({url: _apiEndpoint+"/api/toc/get"}).go(params);
        },        
        deleteDocs: function(docs) {
            var params = {docs:JSON.stringify(docs)};
            return new enyo.Ajax({method:"POST", url: _apiEndpoint+"/api/docs/delete/all"}).go(params);
        },
    }
});