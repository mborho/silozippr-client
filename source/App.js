enyo.Scroller.touchScrolling = !enyo.Scroller.hasTouchScrolling();

enyo.kind({
    name: "App",
    fit: true,
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
    showLogin: function(inSender, inEvent) {
        console.log(inSender);
        console.log(inEvent);                
        this.$.loginPopup.show();
    },
});
