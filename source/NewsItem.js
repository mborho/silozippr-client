enyo.kind({
    name: "NewsItem",
    kind: enyo.Control,
    classes: "news-item enyo-border-box",
    published: {
        skey:'',
        rev: '',
        doc_id: '',
        title: '',
        publisher: '',
        date: '',
        href: '',
        body: '',
        combined: '',
    },
    components: [
        {classes: "line-meta", components: [
            {name:"date", classes:"line-date"},
//             {/*tag: "a", */classes:"line-del", htmlContent: "&#160;"}
        ]},
        {classes: "line-content", components: [
            {classes: "line-source", components: [
                {name: "publisher", ontap: "loadSource"},
            ]},
            {classes: "line-title", components: [
                {name: "title"},
            ]},
            {name: "body", classes: "line-body", style: "overflow-y: auto", allowHtml: true},
        ]},
    ],

    create: function() {
        this.inherited(arguments);
        this.setData();
    },

    setData: function() {
        this.$.date.setContent(this.date);        
        this.$.title.setContent(this.title);
        this.$.title.setAttribute('href',this.href);
        this.$.body.setContent(this.body);
        if(this.combined === true) {
            this.$.publisher.setContent(this.publisher);
        }
    },
    
    loadSource: function() {
        var source = {skey:this.skey, title:this.publisher}
        enyo.Signals.send("onLoadSource", source);
    }
    
});