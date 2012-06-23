enyo.kind({
        name: "NoAccelerateArranger",
        kind: "enyo.CollapsingArranger",

        flow: function() {
                this.c$ = [].concat(this.container.children);
                this.controlsIndex = 0;
        },
});