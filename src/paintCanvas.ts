/// <reference path="inputController.ts" />
/// <reference path="inputSettings.ts" />

var Module : any;

module PaintCanvas {

    export class Program {

        private inputControl : InputController;
        private inputSettings : InputSettings;
        private forceHandler : any;

        private velocityBuffer : any;
        private divergenceBuffer : any;
        private pressureBuffer : any;

        //test
        private visBuffer : any;

        private drawingProgram : any;
        private fluidSolver : any;

        private timer : any;

        constructor(private canvas: HTMLCanvasElement) {
            
            // we must must must do this first.
            // this program uses opengl for speed
            Module.initGL(canvas.width, canvas.height);
            var gl = canvas.getContext('webgl');
            if(gl.getExtension('OES_texture_float') === null) console.error('no texture float support');
            if(gl.getExtension('OES_texture_float_linear') === null) console.error('no float linear support');

            this.velocityBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.pressureBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.divergenceBuffer = Module.BufferUtils.createBuffer(canvas.width, canvas.height);
            this.visBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);

            this.drawingProgram = new Module.Drawing();
            this.fluidSolver = new Module.GridFluidSolver();
            this.forceHandler = new Module.ForceHandler();

            // init
            this.drawingProgram.init();
            this.fluidSolver.init(canvas.width, canvas.height);

            console.log("initialised");

            this.inputControl = new InputController(canvas, this.forceHandler);
            this.inputSettings = new InputSettings(this.inputControl);

            // testing creating a test buffer
            this.fluidSolver.createVisBuffer(this.visBuffer.readBuffer);
            
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
            this.fluidSolver.advect(this.velocityBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.velocityBuffer.readBuffer, 1);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // apply force
            if(this.forceHandler.isForceAvailable()) {
                
                this.fluidSolver.applyForces(this.velocityBuffer, this.forceHandler.getForces(), Module.ForceType.circle);
                this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

                //reset forces
                this.forceHandler.reset();
            }
            
            // // compute divergence
            this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);

            //calc pressures
            //clear buffers
            // Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            // Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);

            for(let i = 0; i < 5; i++) {
                this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
                this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
            }

            //subtractGradient
            this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer.readBuffer);
            //this.fluidSolver.subtractGradient(this.velocityBuffer, this.divergenceBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            this.draw();
        }

        private draw() {
            // draw 
            let debugDraw = this.inputControl.getDebugDrawState();
            if(debugDraw === "visualise") {
                this.fluidSolver.advect(this.visBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.visBuffer.readBuffer, 1);
                this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);
                this.drawingProgram.drawBuffer(this.visBuffer.readBuffer);
            }
            else if(debugDraw === "velocity") {
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