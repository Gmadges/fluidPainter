//<reference path="input.ts"/>
// uneeded anymore

var Module : any;

module PaintCanvas {

    export class Program {

        constructor(private canvas: HTMLCanvasElement) {
            
            // we must must must do this first.
            // this program uses opengl for speed
            Module.initGL(canvas.width, canvas.height);

            var velocityBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            var pressureBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            var divergenceBuffer = Module.BufferUtils.createBuffer(canvas.width, canvas.height);

            // add some stuff to read buffer
            //velocityBuffer.readBuffer = Module.BufferUtils.createTestBuffer(canvas.width, canvas.height, 0.8, 0, 0);
 
            var drawingProgram = new Module.Drawing();
            var fluidSolver = new Module.GridFluidSolver();

            // init
            drawingProgram.init();
            fluidSolver.init(canvas.width, canvas.height);

            // advect
            fluidSolver.advect(velocityBuffer, velocityBuffer.readBuffer, 0.1);
            velocityBuffer = Module.BufferUtils.swapBuffers(velocityBuffer);

            // apply force
            fluidSolver.applyForce(velocityBuffer);
            velocityBuffer = Module.BufferUtils.swapBuffers(velocityBuffer);

            // compute divergence
            fluidSolver.computeDivergance(divergenceBuffer, velocityBuffer.readBuffer);

            //calc pressures
            // maybe iterate in asm for speed int he future
            for(let i = 0; i < 10; i++) {
                fluidSolver.pressureSolve(pressureBuffer, divergenceBuffer);
                pressureBuffer = Module.BufferUtils.swapBuffers(pressureBuffer);
            }

            // draw velocity
            //drawingProgram.drawBuffer(velocityBuffer.readBuffer);
            //drawingProgram.drawBuffer(divergenceBuffer);
            drawingProgram.drawBuffer(pressureBuffer.readBuffer);

            console.log("finished");

            drawingProgram.delete();
            fluidSolver.delete();
        }
    }
}