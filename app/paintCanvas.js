//<reference path="input.ts"/>
// uneeded anymore
var Module;
var PaintCanvas;
(function (PaintCanvas) {
    var Program = (function () {
        function Program(canvas) {
            this.canvas = canvas;
            // testing a new binding system;
            var instance = new Module.MyClass(10, "hello");
            instance.incrementX();
            instance.x; // 12
            instance.x = 20; // 20
            console.log(Module.MyClass.getStringFromInstance(instance));
            instance.delete();
        }
        return Program;
    })();
    PaintCanvas.Program = Program;
})(PaintCanvas || (PaintCanvas = {}));
