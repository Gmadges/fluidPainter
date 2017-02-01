//<reference path="input.ts"/>
// uneeded anymore

var Module : any;

module PaintCanvas {
    export class Program {

        constructor(private canvas: HTMLCanvasElement) {
            
            // we must must must do this first.
            // this program uses opengl for speed
            Module.initGL(canvas.width, canvas.height);

            var utils = new Module.BufferUtils();

            var test = utils.createBuffer(canvas.width, canvas.height);

            console.log(test);

            utils.delete();
        }
    }
}