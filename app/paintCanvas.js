//<reference path="input.ts"/>
// uneeded anymore
var PaintCanvas;
(function (PaintCanvas) {
    //bindings to C++ functions
    var Bindings = (function () {
        function Bindings() {
        }
        Bindings.initGL = Module.cwrap('initGL', 'number', ['number', 'number']);
        Bindings.draw = Module.cwrap('draw', '', []);
        Bindings.update = Module.cwrap('update', '', []);
        return Bindings;
    })();
    //a helper for some JS-to-Emscripten conversions
    var HeapUtils = (function () {
        function HeapUtils() {
        }
        HeapUtils.floatArrayToHeap = function (arr) {
            var arrayPointer = _malloc(arr.length * 4);
            for (var i = 0; i < arr.length; i++)
                Module.setValue(arrayPointer + i * 4, arr[i], 'float');
            return arrayPointer;
        };
        return HeapUtils;
    })();
    var Program = (function () {
        function Program(canvas) {
            this.canvas = canvas;
            //initialise the GL context, call the compiled native function
            var initialised = Bindings.initGL(canvas.width, canvas.height);
            if (!initialised) {
                console.log("Could not initialise GL");
                return;
            }
            //request redraw
            this.invalidate();
            this.timer = setInterval(function () {
                console.log("update");
                Bindings.update();
                Bindings.draw();
            }, 1000);
        }
        Program.prototype.update = function () {
            Bindings.update();
        };
        //render the scene
        Program.prototype.render = function () {
            ////convert the JS translation object to an emscripten array of floats
            //var translationPtr = HeapUtils.floatArrayToHeap(
            //    [this.translation.originX, this.translation.originY, this.translation.zoom]
            //);
            //call the native draw function
            Bindings.draw();
            //free the array memory
            //_free(translationPtr);
        };
        Program.prototype.invalidate = function () {
            window.requestAnimationFrame(this.render.bind(this));
        };
        return Program;
    })();
    PaintCanvas.Program = Program;
})(PaintCanvas || (PaintCanvas = {}));
