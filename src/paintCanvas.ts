//<reference path="input.ts"/>
// uneeded anymore

module PaintCanvas {
    //type declarations for emscripten module and wrappers
    declare var Module: {
        cwrap: (name: string, returnType: string, params: string[]) => any;
        setValue: (ptr: number, value: number, type: string) => void;
    }
    declare var _malloc: (number) => number;
    declare var _free: (number) => void;

    //bindings to C++ functions
    class Bindings {
        public static initGL: (width: number, height: number) => number
            = Module.cwrap('initGL', 'number', ['number', 'number']);
        public static draw: () => void
            = Module.cwrap('draw', '', []);
        public static update: () => void
            = Module.cwrap('update', '', []);
    }

    //a helper for some JS-to-Emscripten conversions
    class HeapUtils {
        public static floatArrayToHeap(arr: number[]): number {
            var arrayPointer = _malloc(arr.length * 4);
            for (var i = 0; i < arr.length; i++)
                Module.setValue(arrayPointer + i * 4, arr[i], 'float');
            return arrayPointer;
        }   
    }

    export class Program {
        
        private timer;

        constructor(private canvas: HTMLCanvasElement) {
            //initialise the GL context, call the compiled native function
            var initialised = Bindings.initGL(canvas.width, canvas.height);
            if (!initialised) {
                console.log("Could not initialise GL");
                return;
            }
            
            //request redraw
            this.invalidate();

            this.timer = setTimeout(function() {
                Bindings.update();
                console.log("update");
            }, 500);
        }

        //render the scene
        private render() {
            ////convert the JS translation object to an emscripten array of floats
            //var translationPtr = HeapUtils.floatArrayToHeap(
            //    [this.translation.originX, this.translation.originY, this.translation.zoom]
            //);

            // call update
            Bindings.update();

            //call the native draw function
            Bindings.draw();
            //free the array memory
            //_free(translationPtr);
        }

        public invalidate() {
            window.requestAnimationFrame(this.render.bind(this));
        }
    }
}