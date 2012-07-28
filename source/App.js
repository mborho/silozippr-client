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
    components:[
        {kind: "Signals", onSpinner: "controlSpinner"},
        { kind: "onyx.Toolbar", style:"height:55px", classes: "enyo-fit", components: [
                { name: "buttonLogin", kind: "onyx.Button", content: "Login", ontap: "showLoginPopup"},
                { name: "buttonLogout", kind: "onyx.Button", content: "Logout", ontap: "sendLogout", showing: false },
                { name: "homeButton", kind: "onyx.Button", content: "Home", ontap: "startMainline"},
                {name: "spinner", kind: "Image", src: "assets/spinner.gif", showing:false},
        ]},
        
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
        { name: "contentPanel", kind: "Panels", classes: "panels  enyo-fit", style: "top:54px", fit: true, /*draggable:false,*/
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
    controlSpinner: function(inSender, inPayload) {
        (inPayload) ? this.$.spinner.show() : this.$.spinner.hide();
    },
    /*reflow: function() {
        this.inherited(arguments);
        var backShowing = this.$.tocButton.showing;
        this.$.tocButton.setShowing(enyo.Panels.isScreenNarrow());
        if (this.$.tocButton.showing != backShowing) {
                this.$.contentView.resized();
        }
    },*/        
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
    loadSourceContent: function(source) {
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }
        this.$.mainline.loadSource(source);        
    }
});  