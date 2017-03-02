/// <reference path="input.ts" />

var Module : any;

module PaintCanvas {

    export class Program {

        private inputControl : InputController;
        private forceHandler : any;

        private velocityBuffer : any;
        private divergenceBuffer : any;
        private pressureBuffer : any;

        private drawingProgram : any;
        private fluidSolver : any;

        private timer : any;

        constructor(private canvas: HTMLCanvasElement) {
            
            // we must must must do this first.
            // this program uses opengl for speed
            Module.initGL(canvas.width, canvas.height);

            this.velocityBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.pressureBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.divergenceBuffer = Module.BufferUtils.createBuffer(canvas.width, canvas.height);
 
            this.drawingProgram = new Module.Drawing();
            this.fluidSolver = new Module.GridFluidSolver();
            this.forceHandler = new Module.ForceHandler();

            // init
            this.drawingProgram.init();
            this.fluidSolver.init(canvas.width, canvas.height);

            console.log("initialised");

            this.inputControl = new InputController(canvas, this.forceHandler);

            this.timer = setInterval(function() { 
                this.update(); 
            }.bind(this), 100);
        }

        public cleanup() {
            console.log("clean up");
            this.drawingProgram.delete();
            this.fluidSolver.delete();
            this.forceHandler.delete();
        }

        private update() {
            // advect
            this.fluidSolver.advect(this.velocityBuffer, this.velocityBuffer.readBuffer, 0.1, 0.1);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // apply force
            if(this.forceHandler.isForceAvailable()) {

                console.log("force")

                this.fluidSolver.applyForces(this.velocityBuffer, this.forceHandler.getForces());
                this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

                //reset forces
                this.forceHandler.reset();
            }
            
            // // compute divergence
            this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);

            //calc pressures
            // maybe iterate in asm for speed int he future
            // clear buffers
            // Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            // Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);

            for(let i = 0; i < 10; i++) {
                this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
                this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
            }

            // subtractGradient
            // this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer);
            // this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // draw 
            let debugDraw = this.inputControl.getDebugDrawState();
            if(debugDraw === "velocity") {
                this.drawingProgram.drawBuffer(this.velocityBuffer.readBuffer);
            }
            else if(debugDraw === "divergence") {
                this.drawingProgram.drawBuffer(this.divergenceBuffer);
            }
            else if(debugDraw === "pressure") {
                this.drawingProgram.drawBuffer(this.pressureBuffer.readBuffer);
            }
        }
    }
}