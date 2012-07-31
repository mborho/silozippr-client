enyo.Scroller.touchScrolling = !enyo.Scroller.hasTouchScrolling();

enyo.kind({
    name: "App",
    fit: true,
    kind: "FittableRows",
    classes:"enyo-fit",
    published: {
        apiEndpoint: _API_ENDPOINT,
        loggedIn: false,
        connector: null,
    },
    events: {
        
    },  
    handlers: {
       onSourceSelected: "loadSource",
       onDragged: "panelDraggable",
       onDragFinished: "panelLocked",
       onContentPanel: "showContenPanel",
    },
    components:[
        {kind: "Signals", onSpinner: "controlSpinner"},
        { kind: "onyx.Toolbar", style:"height:55px", classes: "enyo-fit", components: [
            { name: "buttonLogin", kind: "onyx.Button", content: "Login", ontap: "showLoginPopup"},
            { name: "buttonLogout", kind: "onyx.Button", content: "Logout", ontap: "sendLogout", showing: false },
            { name: "homeButton", kind: "onyx.Button", content: "Home", ontap: "startMainline"},
            {name: "spinner", kind: "Image", src: "assets/spinner.gif", showing:false},
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
        { name: "contentPanel", kind: "Panels", classes: "panels  enyo-fit", style: "top:54px", draggable:false, fit: true, /*draggable:false,*/
                                                    wrap: false, /*index:1, */arrangerKind: "enyo.CollapsingArranger", /*arrangerKind: "NoAccelerateArranger", */components: [
            { name: "toc", kind:"Toc"},
            {name: "contentView", fit: true, kind: "FittableColumns", classes: "enyo-fit main onyx", components: [
                {name:"mainline", kind:"Mainline" },
          
            ]},     
        ]},       
    ],
    create: function() {
        this.inherited(arguments);        
        this.setConnector(new Connector(this.getApiEndpoint()));
        this.checkSession();       
        this.$.toc.connector = this.getConnector();
        this.$.mainline.connector = this.getConnector();
    },   
    isNarrow: function() {
        return (this.getBounds().width <= 800);
    },
    rendered: function() {
        this.inherited(arguments);
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }
    },  
    controlSpinner: function(inSender, active) {
        (active) ? this.$.spinner.show() : this.$.spinner.hide();
    },      
    checkSession: function() {
        new enyo.Ajax({url: this.getApiEndpoint()+"/api/me"}).go().response(this, "sessionStart").error(this, "showLoginPopup");
    },    
    sessionStart: function(inSender, inResponse) {
        this.setLoggedIn(true);
        this.$.buttonLogin.hide();
        this.$.buttonLogout.show();
        this.$.toc.load();
        this.startMainline();
    },
    startMainline: function() {
        this.$.mainline.loadStartView();
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }
    },
    loggedOut: function(inSender, inResponse) {
        this.setLoggedIn(false);
        this.$.buttonLogout.hide();
        this.$.buttonLogin.show();
    },
    showLoginPopup: function(inSender, inEvent) {
        this.$.loginPopup.show();
    },
    sendLogin: function(inSender, inEvent) {
        this.$.loginPopup.hide();
        new enyo.Ajax({url: this.apiEndpoint+"/api/session",method:"POST"}).go({
            username: this.$.popupUsername.getValue(), password: this.$.popupPassword.getValue()
        }).response(this, "sessionStart").error(this, "showLoginPopup");
    },
    sendLogout: function(inSender, inEvent) {
        new enyo.Ajax({url: this.apiEndpoint+"/api/logout"}).go().response(this, "loggedOut");
    },
    loadSource: function(inSender, source) {
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }
        this.$.mainline.loadSource(source);        
    },
    panelDraggable: function(inSender) {
        this.$.contentPanel.setDraggable(true);
    },
    panelLocked: function(inSender) {
        this.$.contentPanel.setDraggable(false);
    },
    showContenPanel: function(inSender, inEvent) {
        this.$.contentPanel.setIndex(1);   
    },
});  