enyo.kind({
    name: "Toc",
    kind: enyo.Control,
    components: [
        {name: "tocList", kind: "Scroller", horizontal: "hidden", style: "top:55px", classes: "enyo-fit list enyo-unselectable"}
    ],    
    create: function() {
        this.inherited(arguments);
        this.owner = this.getOwner();
    },    
    load: function() {
        new enyo.Ajax({url: this.owner.getApiEndpoint()+"/api/toc/get"}).go().response(this, "build");
    },    
    build: function(inSender, inResponse) {
        enyo.forEach(inResponse.rows, this.addItem, this);
        this.$.tocList.render();
    },    
    addItem: function(row) {        
       this.$.tocList.createComponent({
            kind: "TocItem",
            title: row.key[1],
            sum: row.value,
            source: row.key[0]
        });        
    }          
}); 