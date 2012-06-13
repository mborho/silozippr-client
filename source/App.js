enyo.Scroller.touchScrolling = !enyo.Scroller.hasTouchScrolling();

enyo.kind({
    name: "App",
    fit: true,
    apiEndpoint: "http://couch.borho.net:8990",
    components:[
        {kind: "onyx.Toolbar", components: [
            { kind: "onyx.Button", content: "Load", ontap: "showLogin" },
        ]},
//         {name: "results", kind: "Scroller", horizontal: "hidden", style: "top:55px", classes: "enyo-fit list enyo-unselectable"},
        {name: "loginPopup", kind: "onyx.Popup", centered: true, modal: true, floating: true, components: [
//             {content: "Here's some information..."}
            {kind: "onyx.Groupbox", components: [
                {kind: "onyx.GroupboxHeader", content: "Login"},
                    {kind: "onyx.InputDecorator", components: [
                        {kind: "onyx.Input"}
                    ]},
                    {kind: "onyx.InputDecorator", components: [
                        {kind: "onyx.Input", type:"password"}
                    ]},
                    {kind: "onyx.Button", content: "Login", classes: "onyx-affirmative"}
                ]}
        ]},
    ],
    create: function() {
        this.inherited(arguments);
        this.checkSession();
    },    
    checkSession: function() {
        new enyo.Ajax({url: this.apiEndpoint+"/api/me"}).go().response(this, "loggedIn").error(this, "showLogin");
    },
    
    loggedIn: function(inSender, inResponse) {
//         enyo.forEach(inResponse.rows, this.addItem, this);
        console.log('logged in');
        console.log(inResponse);
    },
    showLogin: function(inSender, inEvent) {
//         console.log(inSender);
//         console.log(inEvent);    
        console.log('not logged inm, showing login form');
        this.$.loginPopup.show();
    },
});
