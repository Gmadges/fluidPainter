//<reference path="input.ts"/>
// uneeded anymore

var Module : any;

module PaintCanvas {

    export class Program {

        private velocityBuffer : any;
        private divergenceBuffer : any;
        private pressureBuffer : any;

        private drawingProgram : any;
        private fluidSolver : any;

        private timer : any;

        private forceApplied : boolean = false;
        private bMouseDown : boolean = false;

        constructor(private canvas: HTMLCanvasElement) {
            
            // we must must must do this first.
            // this program uses opengl for speed
            Module.initGL(canvas.width, canvas.height);

            this.velocityBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.pressureBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.divergenceBuffer = Module.BufferUtils.createBuffer(canvas.width, canvas.height);
 
            this.drawingProgram = new Module.Drawing();
            this.fluidSolver = new Module.GridFluidSolver();

            // init
            this.drawingProgram.init();
            this.fluidSolver.init(canvas.width, canvas.height);

            console.log("initialised");

            canvas.onmousedown = function(e){
                this.bMouseDown = true;
            }.bind(this);

            canvas.onmouseup = function(e){
                this.bMouseDown = false;
            }.bind(this);

            canvas.onmousemove = function(e){
                if(!this.bMouseDown) return;
                
                this.getCursorPosition(canvas, e);
                return false;
            }.bind(this);

            // this.timer = setInterval(function() { 
            //     this.update(); 
            // }.bind(this), 100);
        }

        public cleanup() {
            console.log("clean up");
            this.drawingProgram.delete();
            this.fluidSolver.delete();
        }

        private update() {
            // advect
            this.fluidSolver.advect(this.velocityBuffer, this.velocityBuffer.readBuffer, 0.1);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // apply force
            if(this.forceApplied) {
                this.fluidSolver.applyForce(this.velocityBuffer, 0, 0, 0.5, 0.5);
                this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            }
            
             // compute divergence
            this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);

            //calc pressures
            // maybe iterate in asm for speed int he future
            //clear buffers
            Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);

            for(let i = 0; i < 10; i++) {
                this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
                this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
            }

            // subtractGradient
            this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

            // draw velocity
            this.drawingProgram.drawBuffer(this.velocityBuffer.readBuffer);
            //this.drawingProgram.drawBuffer(this.divergenceBuffer);
            //this.drawingProgram.drawBuffer(this.pressureBuffer.readBuffer);
            console.log("update");
        }

        private getCursorPosition(canvas, event) {
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;
            console.log("x: " + x + " y: " + y);
        }
    }
}