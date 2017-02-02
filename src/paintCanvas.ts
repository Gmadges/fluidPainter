//<reference path="input.ts"/>
// uneeded anymore

var Module : any;

module PaintCanvas {

    export class Program {

        constructor(private canvas: HTMLCanvasElement) {
            
            // we must must must do this first.
            // this program uses opengl for speed
            Module.initGL(canvas.width, canvas.height);

            var testBuffer = Module.BufferUtils.createTestBuffer(canvas.width, canvas.height);
            //var testDblBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);

            var drawingProgram = new Module.Drawing();

            drawingProgram.init();
            drawingProgram.drawBuffer(testBuffer);

            console.log(testBuffer);

            drawingProgram.delete();
        }
    }
}