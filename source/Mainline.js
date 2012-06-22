enyo.kind({
    name: "Mainline",
    kind: enyo.Control,
    fit: true,
    published: {
        
    },
    components: [
        {name: "itemList", kind: "Scroller", fit: true, horizontal: "hidden", touchOverscroll:false, classes: "enyo-fit list enyo-unselectable", components: [

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
        this.$.itemList.createComponent(row);
    }
});