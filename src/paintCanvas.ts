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
        private forceBuffer : any;

        //test
        private visBuffer : any;

        private drawingProgram : any;
        private fluidSolver : any;

        private timer : any;

        constructor(public canvas: HTMLCanvasElement) {

            var gl = canvas.getContext('webgl');

            if(gl.getExtension('OES_texture_float') === null) {
                console.error('no texture float support'); 
                return;
            } 

            if(gl.getExtension('OES_texture_float_linear') === null) {
                console.error('no float linear support'); 
                return;
            }

            Module.initGL(canvas.width, canvas.height);
            this.drawingProgram = new Module.Drawing();
            this.drawingProgram.init(canvas.width, canvas.height);

            this.init(canvas.width, canvas.height);

            this.forceHandler = new Module.ForceHandler();
            
            this.inputControl = new InputController(this, this.forceHandler);
            this.inputSettings = new InputSettings(this.inputControl, this);
        }

        private init(width : number, height: number) {

            this.fluidSolver = new Module.GridFluidSolver();
            this.fluidSolver.init(width, height);

            // we must must must do this first.
            // this program uses opengl for speed
            this.velocityBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
            this.pressureBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
            this.forceBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
            this.divergenceBuffer = Module.BufferUtils.createBuffer(width, height);
            this.visBuffer = Module.BufferUtils.createDoubleBuffer(width, height);

            // testing creating a test buffer
            this.fluidSolver.createVisBuffer(this.visBuffer.readBuffer);

            this.timer = setInterval(function() { 
               this.update();
               this.draw();
            }.bind(this), 100);

            
            console.log("initialised");
        }

        public cleanup() {
            clearInterval(this.timer);
            this.drawingProgram.delete();
            this.fluidSolver.delete();
            this.forceHandler.delete();
        }

        public reset(scaleX : number, scaleY: number) {
            
            clearInterval(this.timer);
            this.fluidSolver.delete();

            let w = Math.floor(this.canvas.width * scaleX);
            let h = Math.floor(this.canvas.height * scaleY);

            this.init(w, h);
        }

        public resetBuffers() {
            Module.BufferUtils.clearBuffer(this.velocityBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.velocityBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.forceBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.forceBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.divergenceBuffer);

            Module.BufferUtils.clearBuffer(this.visBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.visBuffer.writeBuffer);

            this.fluidSolver.createVisBuffer(this.visBuffer.readBuffer);         
        }

        private update() {
            // advect
            this.fluidSolver.advect(this.velocityBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.velocityBuffer.readBuffer, 1);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // might be able to to put a flag to not do an add if no force
            this.fluidSolver.addBuffers(this.velocityBuffer.readBuffer, this.forceBuffer.readBuffer, this.velocityBuffer.writeBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            Module.BufferUtils.clearBuffer(this.forceBuffer.readBuffer);
            
            //compute divergence
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
            let color = this.inputSettings.brushColor;
            this.fluidSolver.applyPaint(this.visBuffer, this.forceHandler.getForces(), color.r, color.g, color.b);
            this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);
        }

        public applyForce() {
            this.fluidSolver.applyForces(this.forceBuffer, this.forceHandler.getForces());
            this.forceBuffer = Module.BufferUtils.swapBuffers(this.forceBuffer);
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