/// <reference path="inputController.ts" />
/// <reference path="inputSettings.ts" />
/// <reference path="moduleInterface.ts" />

var Module : emModule;

module PaintCanvas {

    export class Program {

        // helper classes
        private inputControl : InputController;
        private inputSettings : InputSettings;
        private forceHandler : ForceHandler;

        // buffers
        private velocityBuffer : DoubleBuffer;
        private divergenceBuffer : Buffer;
        private pressureBuffer : DoubleBuffer;
        private forceBuffer : DoubleBuffer;
        private visBuffer : DoubleBuffer;
        private storedBuffer : Buffer;

        // webgl classes
        private drawingProgram : Drawing;
        private fluidSolver : GridFluidSolver;

        // update timer
        private timer : number;
        
        // paint drying vals
        private dryTimer : number;
        private paintIsDry : boolean = true;

        //solve
        private solverIterations : number = 5;
        private dissipation : number = 0.9;
        private timeout : number = 0.5;

        constructor(public canvas: HTMLCanvasElement) {

            let gl = Module.createContext(canvas, true, true, {});

            if(gl.getExtension('OES_texture_float') === null) {
                console.error('no texture float support'); 
                return;
            } 

            if(gl.getExtension('OES_texture_float_linear') === null) {
                console.error('no float linear support'); 
                return;
            }

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
            this.storedBuffer = Module.BufferUtils.createBuffer(width, height);

            // make this buffer white.
            this.drawingProgram.resetBuffer(this.visBuffer.readBuffer);

            this.timer = setInterval(function() { 
               this.update();
               this.draw();
            }.bind(this), 1000 / 30);
        }

        public cleanup() {
            clearInterval(this.timer);
            this.drawingProgram.delete();
            this.fluidSolver.delete();
            this.forceHandler.delete();
        }

        public reset(width : number, height : number, scaleX : number, scaleY: number) {

            let w = Math.floor(width * scaleX);
            let h = Math.floor(height * scaleY);
            
            clearInterval(this.timer);
            this.fluidSolver.delete();
            this.drawingProgram.setSize(width, height);
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

            this.drawingProgram.resetBuffer(this.visBuffer.readBuffer);         
        }

        private update() {

            if(this.paintIsDry) return;

            // advect
            this.fluidSolver.advect(this.velocityBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.velocityBuffer.readBuffer, this.dissipation);
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

        public updateTimeout(val : number) {
            this.timeout = val;
        }

        public updateDissipation(val : number) {
            this.dissipation = val;
        }

        public updateBrush(b : number) {
            this.fluidSolver.setBrush(b);
        }

        public applyPaint() {
            if(this.inputSettings.dryBrush) return;
            
            let color = this.inputSettings.brushColor;
            let alpha : number = this.inputSettings.brushAlpha;
            this.fluidSolver.applyPaint(this.visBuffer, this.forceHandler.getForces(), color.r, color.g, color.b, alpha);
            this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);
        }

        public applyForce() {
            this.fluidSolver.applyForces(this.forceBuffer, this.forceHandler.getForces());
            this.forceBuffer = Module.BufferUtils.swapBuffers(this.forceBuffer);
            this.paintIsDry = false;

            clearTimeout(this.dryTimer);

            if(this.timeout === 0) return;

            this.dryTimer = setTimeout(() => {
               this.resetSimBuffers();
               this.paintIsDry = true;
            }, this.timeout * 1000);
        }

        public storeLastBuffer() {
            // Decide whether to store buffer after sim or after mouse up.
            this.fluidSolver.copyBuffer(this.visBuffer.readBuffer, this.storedBuffer);
            console.log("stored");
        }

        public undo() {
            this.fluidSolver.copyBuffer(this.storedBuffer, this.visBuffer.readBuffer);
            console.log("undo");
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