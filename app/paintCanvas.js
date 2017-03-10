var Module;
var PaintCanvas;
(function (PaintCanvas) {
    var Program = (function () {
        function Program(canvas) {
            this.canvas = canvas;
            Module.initGL(canvas.width, canvas.height);
            var gl = canvas.getContext('webgl');
            if (gl.getExtension('OES_texture_float') === null)
                console.error('no texture float support');
            if (gl.getExtension('OES_texture_float_linear') === null)
                console.error('no float linear support');
            this.velocityBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.pressureBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.divergenceBuffer = Module.BufferUtils.createBuffer(canvas.width, canvas.height);
            this.visBuffer = Module.BufferUtils.createDoubleBuffer(canvas.width, canvas.height);
            this.drawingProgram = new Module.Drawing();
            this.fluidSolver = new Module.GridFluidSolver();
            this.forceHandler = new Module.ForceHandler();
            this.drawingProgram.init();
            console.log("initialised");
            this.inputControl = new InputController(canvas, this.forceHandler);
            this.draw();
        }
        Program.prototype.cleanup = function () {
            console.log("clean up");
            this.drawingProgram.delete();
            this.fluidSolver.delete();
            this.forceHandler.delete();
        };
        Program.prototype.update = function () {
            this.fluidSolver.advect(this.velocityBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.velocityBuffer.readBuffer, 0.33);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            if (this.forceHandler.isForceAvailable()) {
                console.log("force");
                this.fluidSolver.applyForces(this.velocityBuffer, this.forceHandler.getForces(), Module.ForceType.circle);
                this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
                this.forceHandler.reset();
            }
            this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
            Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);
            for (var i = 0; i < 10; i++) {
                this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
                this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
            }
            this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer.readBuffer);
            this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
            this.draw();
        };
        Program.prototype.draw = function () {
            var debugDraw = this.inputControl.getDebugDrawState();
            if (debugDraw === "visualise") {
                this.drawingProgram.drawBuffer(this.visBuffer.readBuffer);
            }
            else if (debugDraw === "velocity") {
                this.drawingProgram.drawBuffer(this.velocityBuffer.readBuffer);
            }
            else if (debugDraw === "divergence") {
                this.drawingProgram.drawBuffer(this.divergenceBuffer);
            }
            else if (debugDraw === "pressure") {
                this.drawingProgram.drawBuffer(this.pressureBuffer.readBuffer);
            }
        };
        return Program;
    }());
    PaintCanvas.Program = Program;
})(PaintCanvas || (PaintCanvas = {}));
//# sourceMappingURL=paintCanvas.js.map