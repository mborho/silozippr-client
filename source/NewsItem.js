enyo.kind({
    name: "NewsItem",
    kind: enyo.Control,
    classes: "news-item enyo-border-box",
    published: {
        source:'',
        rev: '',
        doc_id: '',
        title: '',
        publisher: '',
        date: '',
        href: '',
        body: ''
    },
    components: [
        {classes: "line-meta", components: [
            {name:"date", classes:"line-date"},
//             {/*tag: "a", */classes:"line-del", htmlContent: "&#160;"}
        ]},
        {classes: "line-content", components: [
            {classes: "line-source", components: [
                {name: "publisher"},
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
        this.$.publisher.setContent = this.publisher;
        console.log(this.$.body);
        this.$.title.setContent(this.title);
        this.$.title.setAttribute('href',this.href);
        this.$.body.setContent(this.body);
    },
    
});