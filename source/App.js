/**
 * Copyright (c) 2012, Martin Borho. 
 * Licensed under the Affero General Public License version 3 or later. 
 * See LICENSE for details.  
 */
enyo.Scroller.touchScrolling = !enyo.Scroller.hasTouchScrolling();

enyo.kind({
    name: "App",
    fit: true,
    kind: "FittableRows",
    classes:"enyo-fit",
    socket: false,
    published: {
        apiEndpoint: _API_ENDPOINT,
        loggedIn: false,
        connector: null,
    },
    //
    handlers: {
        onLoadMainline: "loadMainline",
        onLoadNextSource: "loadNextSource",
        onSourceSelected: "loadSource",        
        onDeleteItems: "deleteItems", 
        onDeleteSingleItem: "deleteSingleItem", 
        onShowItemOptions: "showItemOptions",        
        onShortUrl: "shortUrl",
        onSendTweet: "sendTweet",
        onTotalSum: "setTotalSum",
        onDragged: "panelDraggable",
        onDragFinished: "panelLocked",
        onContentPanel: "showContenPanel",
    },
    //
    components:[
        { kind: "onyx.Toolbar", style:"height:55px", classes: "enyo-fit",  fit:true, components: [
            { name: "buttonLogin", kind: "onyx.Button", content: "Login", ontap: "showLoginPopup"},     
            { name: "buttonLogout", kind: "onyx.Button", content: "Logout", ontap: "sendLogout", showing: false },
            { name: "homeButton", kind: "onyx.Button", content:"Home", ontap: "startUp"},
            { name:"totalSum", kind:"onyx.Button", content: "-", classes: "sum-total"},
        ]},          
        { name: "loginPopup", scrim: true, kind: "onyx.Popup", centered: true, modal: true, floating: true, components: [
            {kind: "onyx.Groupbox", components: [
                {kind: "onyx.GroupboxHeader", content: "Login"},
                {kind: "onyx.InputDecorator", components: [
                    {name: "popupUsername", kind: "onyx.Input"}
                ]},
                {kind: "onyx.InputDecorator", components: [
                    {name: "popupPassword", kind: "onyx.Input", type:"password"}
                ]},
                {kind: "onyx.Button", content: "Login", classes: "onyx-affirmative", onclick: "sendLogin"}
            ]}
        ]},  
        {name: "tools", kind: "Tools"},    
        { name: "contentPanel", kind: "Panels", classes: "panels  enyo-fit", style: "top:54px", draggable:false, fit: true, 
            wrap: false, arrangerKind: "enyo.CollapsingArranger", components: [                                                 
            { name: "toc", kind:"Toc"},
            {name: "contentView", fit: true, kind: "FittableColumns", classes: "enyo-fit main onyx", components: [
                {name:"mainline", kind:"Mainline" },          
            ]},     
        ]},       
    ],
    //
    create: function() {
        this.inherited(arguments);        
        this.setConnector(new Connector(this.getApiEndpoint()));
        this.checkSession();       
    },
    //
    isNarrow: function() {
        return (this.getBounds().width <= 800);
    },
    //
    rendered: function() {
        this.inherited(arguments);
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }
    },   
    //
    // event handlers
    //
    loadToc: function(inSender) {
        this.connector.loadToc().response(this.$.toc,"build");        
        return true;
    },
    //
    setTotalSum: function(inSender, inData) {
        this.$.totalSum.setContent(inData.sum);        
        return true;
    },
    //
    loadMainline: function(inSender, inParams) {
        this.connector.loadList(inParams).response(this.$.mainline, "build");        
        return true;
    },  
    loadNextSource: function(inSender) {
        var next = this.$.toc.getNextSource();
        if(!next) {
            this.loadMainline();
        }
    },
    //
    loadSource: function(inSender, source) {
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }        
        this.loadSourceInfo(source);
        this.$.mainline.loadSource(source);   
        return true;
    },         
    //
    deleteItems: function(inSender, inDocs) {
        this.$.mainline.handleSpinner(true);        
        // TODO implement client side check of "all"
        this.socket.emit('removeDocs', {docs:inDocs, all: false} );
        return true;
    },
    //
    deleteSingleItem: function(inSender, inDoc) {        
        this.$.mainline.handleSpinner(true);
        this.socket.emit('removeDoc', {_id:inDoc._id, _rev:inDoc._rev, source: inDoc.source});
        return true;
    }, 
    //
    showItemOptions: function(inSender, inParams) {
        if(!this.$.tools.open) {
            this.$.tools.display(inParams);
        }
    },
    //
    shortUrl: function(inSender, inParams) {
        this.connector.shortUrl(inParams.url).response(inParams.callback);        
    },
    //
    sendTweet: function(inSender, inParams) {        
        if(inParams.retweet === true) {
            this.connector.sendRetweet(inParams.id).response(this.$.tools, "retweetSended");
        } else {
            this.connector.sendTweet(inParams.text).response(this.$.tools, "tweetSended");
        }
    },    
    // 
    // socket.io
    //
    setSocket: function(socket) {
        this.socket = socket;
        var that = this;
        this.socket .on('news', function (data) {
            that.$.mainline.addPushedItem(data.doc);
            that.$.toc.addPushed(data.doc);
        });

        this.socket.on('removeDocsResult', function (data) {
            if(data.success !== true) {
                that.error("deleting failed");
            }
            if(data.all === true) { 
                // TODO implement client side check 
                console.log("Controller.checkNext();");
            } else {                
                that.$.toc.removeDocs(data.deleted);
                that.$.mainline.changeSourceSum(-data.deleted.length);
                that.$.mainline.reload();
            }
        });

        this.socket.on('removeDocResult', function (data) {
            if(data.success == true) {
                that.$.toc.removeDocs([data.doc]);
                that.$.mainline.itemDeleted(data);
            } else {
                that.error("deleting failed");
            }
        }); 
    },    
    //
    // direct api calls
    // 
    loadSourceInfo: function(source) {
        this.connector.loadSourceInfo(source.skey).response(this.$.mainline, "gotSourceInfo");        
    },
    //
    // check session
    //
    checkSession: function() {
        new enyo.Ajax({url: this.getApiEndpoint()+"/api/me"}).go().response(this, "sessionStart").error(this, "showLoginPopup");
    },
    //
    sessionStart: function(inSender, inResponse) {
        this.setLoggedIn(true);
        this.$.buttonLogin.hide();
        this.$.buttonLogout.show();
        this.startUp();
    },
    //
    loggedOut: function(inSender, inResponse) {
        this.setLoggedIn(false);
        this.$.buttonLogout.hide();
        this.$.buttonLogin.show();
    },
    //
    showLoginPopup: function(inSender, inEvent) {
        this.$.loginPopup.show();
    },
    //
    sendLogin: function(inSender, inEvent) {
        this.$.loginPopup.hide();
        var postBody = "username="+encodeURIComponent(this.$.popupUsername.getValue())
                            +"&password="+encodeURIComponent(this.$.popupPassword.getValue());
        new enyo.Ajax({url: this.apiEndpoint+"/api/session",method:"POST", postBody:postBody}).go()
            .response(this, "sessionStart").error(this, "showLoginPopup");
    },
    //
    sendLogout: function(inSender, inEvent) {
        new enyo.Ajax({url: this.apiEndpoint+"/api/logout"}).go().response(this, "loggedOut");
    },
    //
    startUp: function() {
        this.loadToc();
        this.$.mainline.loadStartView();
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }
    },
    //
    reloadMainline: function() {
        this.$.mainline.reload();
    },
    //
    deleteMainline: function() {
        this.$.mainline.delete();
    },    
    //
    // app global actions
    //
    panelDraggable: function(inSender) {
        this.$.contentPanel.setDraggable(true);
    },
    //
    panelLocked: function(inSender) {
        this.$.contentPanel.setDraggable(false);
    },
    //
    showContenPanel: function(inSender, inEvent) {
        this.$.contentPanel.setIndex(1);   
    },
});  