enyo.Scroller.touchScrolling = !enyo.Scroller.hasTouchScrolling();

enyo.kind({
    name: "App",
    fit: true,
    apiEndpoint: "http://couch.borho.net:8990",
    loggedIn: false,
    components:[
        {kind: "onyx.Toolbar", components: [
            { name: "buttonLogin", kind: "onyx.Button", content: "Login", ontap: "showLoginPopup"},
            { name: "buttonLogout", kind: "onyx.Button", content: "Logout", ontap: "sendLogout", showing: false },
        ]},
//         {name: "results", kind: "Scroller", horizontal: "hidden", style: "top:55px", classes: "enyo-fit list enyo-unselectable"},
        {name: "loginPopup", kind: "onyx.Popup", centered: true, modal: true, floating: true, components: [
//             {content: "Here's some information..."}
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
    ],
    create: function() {
        this.inherited(arguments);
        this.checkSession();
    },    
    checkSession: function() {
        new enyo.Ajax({url: this.apiEndpoint+"/api/me"}).go().response(this, "sessionStart").error(this, "showLoginPopup");
    },    
    sessionStart: function(inSender, inResponse) {
        this.loggedIn = true;
        this.$.buttonLogin.hide();
        this.$.buttonLogout.show();
    },
    loggedOut: function(inSender, inResponse) {
        this.loggedIn = false;
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
    }
});
