enyo.Scroller.touchScrolling = !enyo.Scroller.hasTouchScrolling();


enyo.kind({
    name: "App",
    kind: "Panels",
    classes: "panels enyo-unselectable",
    realtimeFit: true,
    arrangerKind: "CollapsingArranger",
    published: {
        apiEndpoint: "http://couch.borho.net:8990",
        loggedIn: false,
        connector: null,
    },
    events: {
        
    },    
    components: [
        { name: "tocPanel", layoutKind: "FittableRowsLayout", components: [                        
            { kind: "onyx.Toolbar", components: [
                    { name: "buttonLogin", kind: "onyx.Button", content: "Login", ontap: "showLoginPopup"},
                    { name: "buttonLogout", kind: "onyx.Button", content: "Logout", ontap: "sendLogout", showing: false },
            ]},
            { name: "toc", kind:"Toc" },
            { name: "loginPopup", kind: "onyx.Popup", centered: true, modal: true, floating: true, components: [
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
        ]},
        {name: "contentView", fit: true, kind: "FittableRows", classes: "enyo-fit main", components: [
                {name: "backToolbar", kind: "onyx.Toolbar", showing: true, components: [
                        { name: "tocButton", kind: "onyx.Button", content: "Toc", showing: false, ontap: "showToc"},
                        { name: "homeButton", kind: "onyx.Button", content: "Home", ontap: "refreshMainList"},
                ]},                
                {name:"mainline", kind:"Mainline"},
        ]},            
    ],
    create: function() {
        this.inherited(arguments);        
        this.setConnector(new Connector(this.getApiEndpoint()));
        this.checkSession();
    },   
    rendered: function() {
        this.inherited(arguments);
    },    
    reflow: function() {
        this.inherited(arguments);
        var backShowing = this.$.tocButton.showing;
        this.$.tocButton.setShowing(enyo.Panels.isScreenNarrow());
        if (this.$.tocButton.showing != backShowing) {
                this.$.contentView.resized();
        }
    },    
    showToc: function() {
        this.setIndex(0);
    },    
    checkSession: function() {
        new enyo.Ajax({url: this.getApiEndpoint()+"/api/me"}).go().response(this, "sessionStart").error(this, "showLoginPopup");
    },    
    sessionStart: function(inSender, inResponse) {
        this.setLoggedIn(true);
        this.$.buttonLogin.hide();
        this.$.buttonLogout.show();
        this.$.toc.load();
        this.$.mainline.loadList();
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
        new enyo.Ajax({url: this.apiEndpoint+"/logout"}).go().response(this, "loggedOut");
    },
});  