enyo.kind({
    name: "Mainline",
    kind: enyo.Control,
    fit: true,
    published: {
        
    },
    components: [
        {name: "results", kind: "Scroller", horizontal: "hidden", style: "top:55px", classes: "enyo-fit list enyo-unselectable", components: [

        ]}        
    ],
    create: function() {
        this.inherited(arguments);
        this.owner = this.getOwner();
    },
    loadList: function() {
        for(var x=0;x< 200;x++) {
            this.$.results.createComponent({content: "item "+x, classes: "item", /*ontap: "select", data: r, */owner: this, attributes: {draggable: false}});
        }
        this.$.results.render();
    }
});