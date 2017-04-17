/// <reference path="inputController.ts" />
/// <reference path="inputSettings.ts" />

var Module : any;

module PaintCanvas {

    export class Program {

        // helper classes
        private inputControl : InputController;
        private inputSettings : InputSettings;
        private forceHandler : any;
        private mouseHandler : any;

        // buffers
        private velocityBuffer : any;
        private divergenceBuffer : any;
        private pressureBuffer : any;
        private forceBuffer : any;
        private visBuffer : any;

        // webgl classes
        private drawingProgram : any;
        private fluidSolver : any;

        // update timer
        private timer : any;
        
        // paint drying vals
        private dryTimer : any;
        private paintIsDry : boolean = true;

        //solve
        private solverIterations : number = 5;

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
            }.bind(this), 30 / 1000);
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

        public updateFPS(fps : number) {

            clearInterval(this.timer);
            
            this.timer = setInterval(function() { 
               this.update();
               this.draw();
            }.bind(this), 1000 / fps);
        }

        private resetSimBuffers() {
            Module.BufferUtils.clearBuffer(this.velocityBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.velocityBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.forceBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.forceBuffer.writeBuffer);

            Module.BufferUtils.clearBuffer(this.divergenceBuffer);
        }

        public resetBuffers() {

            this.resetSimBuffers();

            // clear vis and reset;
            Module.BufferUtils.clearBuffer(this.visBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.visBuffer.writeBuffer);

            this.fluidSolver.createVisBuffer(this.visBuffer.readBuffer);         
        }

        private update() {

            if(this.paintIsDry) return;

            // advect
            this.fluidSolver.advect(this.velocityBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.velocityBuffer.readBuffer, 0.75);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // might be able to to put a flag to not do an add if no force
            this.fluidSolver.addBuffers(this.velocityBuffer.readBuffer, this.forceBuffer.readBuffer, this.velocityBuffer.writeBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            Module.BufferUtils.clearBuffer(this.forceBuffer.readBuffer);
            
            //compute divergence
            this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);

            for(let i = 0; i < this.solverIterations; i++) {
                this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
                this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
            }

            //subtractGradient
            this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer.readBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
        }

        public updateJacobiIterations(val : number) {
            this.solverIterations = val;
        }

        public updateBrush(b : number) {
            this.fluidSolver.setBrush(b);
        }

        public applyPaint() {
            let color = this.inputSettings.brushColor;
            this.fluidSolver.applyPaint(this.visBuffer, this.forceHandler.getForces(), color.r, color.g, color.b);
            this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);
        }

        public applyForce() {
            this.fluidSolver.applyForces(this.forceBuffer, this.forceHandler.getForces());
            this.forceBuffer = Module.BufferUtils.swapBuffers(this.forceBuffer);
            this.paintIsDry = false;

            clearTimeout(this.dryTimer);
            this.dryTimer = setTimeout(() => {
               this.resetSimBuffers();
               this.paintIsDry = true;
            }, 1000);
        }

        private draw() {
            // advect vis buffer
            this.fluidSolver.advect(this.visBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.visBuffer.readBuffer, 1.0);
            this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);

            // draw 
            this.drawingProgram.drawBuffer(this.visBuffer.readBuffer);

            // save image maybe
            if(this.inputSettings.saveImage === true){
                this.inputSettings.saveImage = false;
                window.open(this.canvas.toDataURL(), '_blank');
                window.focus();
            }
        }
    }
}