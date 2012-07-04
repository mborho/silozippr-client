enyo.kind({
    name: "TocItem",
    kind: enyo.Control,
    classes: "toc-item enyo-border-box",
    handlers: {
        ontap: "tapped"
    },
    published: {
        title: "",
        sum: 0,
        skey: ''
    },    
    components: [
            {name: "title", classes: "toc-title", content: ""},
            {name: "sum", classes: "toc-sum", content: ""}
    ],
    create: function() {
        this.inherited(arguments);
        this.owner = this.getOwner();
        this.setData();
    },
    setData: function() {
        this.$.title.setContent(this.title);
        this.$.sum.setContent(this.sum);
    },
    tapped: function(inSender, inEvent) {
        this.owner.parent.unselect();
        this.owner.parent.sourceSelected({skey:this.skey, title:this.title});
        this.addClass('onyx-selected');
    },
});