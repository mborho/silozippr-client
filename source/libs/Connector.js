var Connector = (function(apiEndpoint) {
    var _apiEndpoint = apiEndpoint;
    
    return {
        getApiEndpoint: function() {
            return _apiEndpoint;
        }
    }
});