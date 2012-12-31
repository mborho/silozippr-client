/**
 * Copyright (c) 2012, Martin Borho. 
 * Licensed under the Affero General Public License version 3 or later. 
 * See LICENSE for details.  
 */
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
        shortUrl: function(url) {
            var params = {url: encodeURIComponent(url)};
            return new enyo.Ajax({method:"GET", url: _apiEndpoint+"/api/url/short"}).go(params);
        },
        sendTweet: function(text) {
            var postBody = "text="+encodeURIComponent(text);
            return new enyo.Ajax({method:"POST", url: _apiEndpoint+"/api/tweet", postBody: postBody}).go();
        },
        sendRetweet: function(id) {
            var postBody = "id="+encodeURIComponent(id);
            return new enyo.Ajax({method:"POST", url: _apiEndpoint+"/api/retweet", postBody: postBody}).go();
        }
    }
});