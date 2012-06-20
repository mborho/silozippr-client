enyo.kind({
    name: "Mainline",
    kind: enyo.Control,
    fit: true,
    published: {
        
    },
    components: [
        {name: "itemList", kind: "Scroller", horizontal: "hidden", style: "top:55px", classes: "enyo-fit list enyo-unselectable", components: [

        ]}        
    ],
    create: function() {
        this.inherited(arguments);
        this.owner = this.getOwner();
    },
    loadList: function() {
        new enyo.Ajax({url: this.owner.getApiEndpoint()+"/api/list/docs"}).go({format:"json"}).response(this, "build");
    },
    build: function(inSender, inResponse) {
        enyo.forEach(inResponse.docs, this.addItem, this);
        this.$.itemList.render();
    },    
    addItem: function(row) {  
        console.log(row);
        this.$.itemList.createComponent(row);
//         body: 
//         byline: ""
//         date: "17:08"
//         doc_id: "5688d43551e43054d06bc1e0291e273a"
//         href: "https://twitter.com/ZDF/status/215461093894651904"
//         kind: "TweetItem"
//         rev: "1-31ad452a8d5d7b6f5a1642473737817f"
//         source: "9a3dc72604878894e69a1746da78eb3c"
//        this.$.itemList.createComponent({
//            content: 
//             kind: "TocItem",
//             title: row.key[1],
//             sum: row.value,
//             source: row.key[0]
//         });        
    }
});