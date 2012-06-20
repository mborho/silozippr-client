enyo.kind({
    name: "TweetItem",
    kind: enyo.Control,
    classes: "tweet enyo-border-box",    
    published: {
        source:'',
        rev: '',
        doc_id: '',
        byline: '',
        date: '',
        href:'',
        body: ''
    },
    components: [
        {classes: "line-meta", components: [
            {classes: "line-date", components: [
//                 {tag: "a", components: [
//                     {tag: "img", attributes: {src: "/img/twitter.png"}}
//                 ]},
                {name:"date", classes:"tweet-link"},
                {name:"byline", content:""},
            ]},
//             {tag: "a", classes:"line-del", content: "&#160;"}
        ]},
        {classes: "line-content", components: [
            {name: "body", classes: "line-body", allowHtml: true},
        ]},
    ],

    create: function() {
        this.inherited(arguments);
        this.setData();
    },

    setData: function() {
        this.$.date.setContent(this.date);
        this.$.byline.setContent(this.byline);
        this.$.body.setContent(this.body);
    },
    
});