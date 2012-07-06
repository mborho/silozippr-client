enyo.kind({
    name: "MoreItem",
    kind: enyo.Control,
    content: "more",
    classes: "news-item enyo-border-box",
    handlers: {
        ontap: "loadMore"
    },
    loadMore: function() {
        enyo.Signals.send("onLoadMore");
    },
    
});