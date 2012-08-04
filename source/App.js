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
    //
    events: {
        
    }, 
    //
    handlers: {
        onLoadMainline: "loadMainline",
        onSourceSelected: "loadSource",
        onDeleteItems: "deleteItems", 
        onDeleteSingleItem: "deleteSingleItem", 
        onTotalSum: "setTotalSum",
        onDragged: "panelDraggable",
        onDragFinished: "panelLocked",
        onContentPanel: "showContenPanel",
    },
    //
    components:[
        {kind: "Signals", onSpinner: "controlSpinner"},
        { kind: "onyx.Toolbar", style:"height:55px", classes: "enyo-fit",  fit:true, components: [
            {kind: "FittableColumns", classes: "enyo-fit", wrap:false, fit:true, components: [
                {kind: "FittableColumns", fit:true, noStretch:true, components: [
                    { name: "buttonLogin", kind: "onyx.Button", content: "Login", ontap: "showLoginPopup"},     
                    { name: "buttonLogout", kind: "onyx.Button", content: "Logout", ontap: "sendLogout", showing: false },
                    { name: "homeButton", kind: "onyx.Button", content:"Home", ontap: "startUp"},                    
                    { name: "reloadButton", kind: "onyx.Button", ontap: "reloadMainline", components: [
                        {name: "spinner", kind: "Image", src: "assets/spinner.gif", showing:false},    
                        {name:"spinnerStopped", kind:"Image", src:"assets/spinner-stopped.png", showing:true}
                    ]},
                    { name:"totalSum", kind:"onyx.Button", content: "-", classes: "total-sum"},
                ]},                
                {content:"", fit:true},
                { name:"sourceSum", kind:"onyx.Button", content: "-", classes: "onyx-blue", showing:false},
                { name: "clearButton", kind: "onyx.Button", content: "Clear", ontap: "deleteMainline"},                
            ]},
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
    },
    //
    setTotalSum: function(inSender, inData) {
        this.$.totalSum.setContent(inData.sum);        
    },
    //
    loadMainline: function(inSender, inParams) {
        this.connector.loadList(inParams).response(this.$.mainline, "build");        
    },
    //
    deleteItems: function(inSender, inDocs) {
        this.connector.deleteDocs(inDocs).response(this, "docsDeleted");
    },
    //
    deleteSingleItem: function(inSender, inDocs) {
        this.connector.deleteDocs(inDocs).response(this, "singleDocDeleted");
    },        
    //
    // API response handlers
    //
    docsDeleted: function(inSender, inResponse) {
        if(inResponse.success == true) {
            this.$.mainline.reload();
            this.$.toc.removeDocs(inResponse.deleted);
        }
    },
    singleDocDeleted: function(inSender, inResponse) {
        if(inResponse.success == true) {
            this.$.toc.removeDocs(inResponse.deleted);
        }
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
        new enyo.Ajax({url: this.apiEndpoint+"/api/session",method:"POST"}).go({
            username: this.$.popupUsername.getValue(), password: this.$.popupPassword.getValue()
        }).response(this, "sessionStart").error(this, "showLoginPopup");
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
    loadSource: function(inSender, source) {
        if(this.isNarrow()) {
            this.$.contentPanel.setIndex(1);
        }
        this.$.mainline.loadSource(source);        
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
    controlSpinner: function(inSender, active) {
        if(active) {
            this.$.spinnerStopped.hide();
            this.$.spinner.show();
        } else {
            this.$.spinner.hide();
            this.$.spinnerStopped.show();
        }
    },  
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