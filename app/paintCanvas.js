//<reference path="input.ts"/>
// uneeded anymore
var Module;
var PaintCanvas;
(function (PaintCanvas) {
    var Program = (function () {
        function Program(canvas) {
            this.canvas = canvas;
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
            this.update();
            this.timer = setInterval(function () {
                this.update();
            }.bind(this), 100);
        }
        Program.prototype.cleanup = function () {
            console.log("clean up");
            this.drawingProgram.delete();
            this.fluidSolver.delete();
        };
        Program.prototype.update = function () {
            // advect
            this.fluidSolver.advect(this.velocityBuffer, this.velocityBuffer.readBuffer, 0.1);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            // apply force
            this.fluidSolver.applyForce(this.velocityBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            // compute divergence
            this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);
            //calc pressures
            // maybe iterate in asm for speed int he future
            //clear buffers
            //Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            //Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);
            for (var i = 0; i < 10; i++) {
                this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
                this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
            }
            // subtractGradient
            this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            // draw velocity
            this.drawingProgram.drawBuffer(this.velocityBuffer.readBuffer);
            //drawingProgram.drawBuffer(divergenceBuffer);
            //drawingProgram.drawBuffer(pressureBuffer.readBuffer);
            console.log("update");
        };
        return Program;
    })();
    PaintCanvas.Program = Program;
})(PaintCanvas || (PaintCanvas = {}));
