/// <reference path="inputController.ts" />
/// <reference path="inputSettings.ts" />

var Module : any;

module PaintCanvas {

    export class Program {

        private inputControl : InputController;
        private inputSettings : InputSettings;
        private forceHandler : any;
        private mouseHandler : any;

        private velocityBuffer : any;
        private divergenceBuffer : any;
        private pressureBuffer : any;

        //test
        private visBuffer : any;

        private drawingProgram : any;
        private fluidSolver : any;

        private timer : any;

        constructor(private canvas: HTMLCanvasElement) {

            var gl = canvas.getContext('webgl');

            if(gl.getExtension('OES_texture_float') === null) {
                console.error('no texture float support'); 
                return;
            } 

            if(gl.getExtension('OES_texture_float_linear') === null) {
                console.error('no float linear support'); 
                return;
            }
            
            this.init(canvas.width, canvas.height);
        }

        public init(width : number, height: number) {

            // we must must must do this first.
            // this program uses opengl for speed
            Module.initGL(this.canvas.width, this.canvas.height);

            this.velocityBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
            this.pressureBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
            this.divergenceBuffer = Module.BufferUtils.createBuffer(width, height);
            this.visBuffer = Module.BufferUtils.createDoubleBuffer(width, height);

            this.drawingProgram = new Module.Drawing();
            this.fluidSolver = new Module.GridFluidSolver();
            this.forceHandler = new Module.ForceHandler();

            // using a forcehandler for now
            this.mouseHandler = new Module.ForceHandler();

            // init
            this.drawingProgram.init(this.canvas.width, this.canvas.height);
            this.fluidSolver.init(width, height);

            console.log("initialised");

            this.inputControl = new InputController(this.canvas, this.forceHandler, this.mouseHandler, width, height, this);
            this.inputSettings = new InputSettings(this.inputControl, this);

            // testing creating a test buffer
            this.fluidSolver.createVisBuffer(this.visBuffer.readBuffer);

            this.timer = setInterval(function() { 
               this.update();
               this.draw();
            }.bind(this), 100);
        }

        public cleanup() {
            console.log("clean up");
            clearInterval(this.timer);
            this.drawingProgram.delete();
            this.fluidSolver.delete();
            this.forceHandler.delete();
        }

        public reset() {
            Module.BufferUtils.clearBuffer(this.velocityBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.velocityBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.divergenceBuffer);

            Module.BufferUtils.clearBuffer(this.visBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.visBuffer.writeBuffer);

            this.fluidSolver.createVisBuffer(this.visBuffer.readBuffer);         
        }

        private update() {
            // advect
            this.fluidSolver.advect(this.velocityBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.velocityBuffer.readBuffer, 1);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // apply force
            if(this.forceHandler.isForceAvailable()) {
                
                this.fluidSolver.applyForces(this.velocityBuffer, this.forceHandler.getForces());
                this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

                //reset forces
                this.forceHandler.reset();
            }
            
            // // compute divergence
            this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);

            for(let i = 0; i < 5; i++) {
                this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
                this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
            }

            //subtractGradient
            this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer.readBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
        }

        public applyPaint() {
            if(this.mouseHandler.isForceAvailable()) {
                let color = this.inputSettings.brushColor;
                this.fluidSolver.applyPaint(this.visBuffer, this.mouseHandler.getForces(), color.r, color.g, color.b);
                this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);
            }

        }

        private draw() {

            // advect vis buffer
            this.fluidSolver.advect(this.visBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.visBuffer.readBuffer, 1);
            this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);

            // draw 
            let debugDraw = this.inputControl.getDebugDrawState();
            if(debugDraw === "visualise") {
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

            // save image maybe
            if(this.inputSettings.saveImage === true){
                this.inputSettings.saveImage = false;
                window.open(this.canvas.toDataURL(), '_blank');
                window.focus();
            }
        }
    }
}