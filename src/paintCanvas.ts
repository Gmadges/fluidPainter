/// <reference path="inputController.ts" />
/// <reference path="inputSettings.ts" />
/// <reference path="moduleInterface.ts" />
/// <reference path="undo.ts"/>

// declare the module with our interface.
var Module : emModule;

class PaintCanvas {

    // helper classes
    private inputControl : InputController;
    private inputSettings : InputSettings;
    private undoHandler : Undo;

    // buffers
    private velocityBuffer : DoubleBuffer;
    private divergenceBuffer : Buffer;
    private pressureBuffer : DoubleBuffer;
    private forceBuffer : DoubleBuffer;
    private visBuffer : DoubleBuffer;
    
    // emscripten classes classes
    private drawingProgram : Drawing;
    private fluidSolver : GridFluidSolver;
    private forceHandler : ForceHandler;

    // update loop timer
    private timer : number;
    
    // paint drying values
    private dryTimer : number;
    private paintIsDry : boolean = true;

    // fluid solver variables
    private solverIterations : number = 5;
    private dissipation : number = 0.9;
    private timeout : number = 0.5;

    constructor(public canvas: HTMLCanvasElement) {

        // VERY important line. must be called before anything related to webGL is done. 
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

    private init(width : number, height: number) : void {

        this.fluidSolver = new Module.GridFluidSolver();
        this.fluidSolver.init(width, height);

        // create all the buffers we will need.
        this.velocityBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
        this.pressureBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
        this.forceBuffer = Module.BufferUtils.createDoubleBuffer(width, height);
        this.divergenceBuffer = Module.BufferUtils.createBuffer(width, height);
        this.visBuffer = Module.BufferUtils.createDoubleBuffer(width, height);

        let bufferArray : Buffer[] = [];
        for(let i = 0; i < 5; i++) {
            bufferArray.push(Module.BufferUtils.createBuffer(width, height));
        }
        this.undoHandler = new Undo(bufferArray);

        // make this buffer white.
        this.drawingProgram.resetBuffer(this.visBuffer.readBuffer);

        // start our render loop.
        this.timer = setInterval(function() { 
            this.update();
            this.draw();
        }.bind(this), 1000 / 30);
    }

    // we have to delete our emscripten classes due to some memory issues.
    public cleanup() : void {
        clearInterval(this.timer);
        this.drawingProgram.delete();
        this.fluidSolver.delete();
        this.forceHandler.delete();
    }

    public reset(width : number, height : number, scaleX : number, scaleY: number) : void {

        let w = Math.floor(width * scaleX);
        let h = Math.floor(height * scaleY);
        
        clearInterval(this.timer);
        this.fluidSolver.delete();
        this.drawingProgram.setSize(width, height);
        this.init(w, h);
    }

    // clears and restarts the FPS at the new rate.
    public updateFPS(fps : number) : void {

        clearInterval(this.timer);
        
        this.timer = setInterval(function() { 
            this.update();
            this.draw();
        }.bind(this), 1000 / fps);
    }

    private resetSimBuffers() : void {
        Module.BufferUtils.clearBuffer(this.velocityBuffer.readBuffer);
        Module.BufferUtils.clearBuffer(this.velocityBuffer.writeBuffer);

        Module.BufferUtils.clearBuffer(this.pressureBuffer.readBuffer);
        Module.BufferUtils.clearBuffer(this.pressureBuffer.writeBuffer);

        Module.BufferUtils.clearBuffer(this.forceBuffer.readBuffer);
        Module.BufferUtils.clearBuffer(this.forceBuffer.writeBuffer);

        Module.BufferUtils.clearBuffer(this.divergenceBuffer);
    }

    public resetBuffers() : void {

        this.resetSimBuffers();

        // clear vis and reset;
        Module.BufferUtils.clearBuffer(this.visBuffer.readBuffer);
        Module.BufferUtils.clearBuffer(this.visBuffer.writeBuffer);

        this.drawingProgram.resetBuffer(this.visBuffer.readBuffer);

        // clear the undo buffers too
        let undoBuffers : Buffer[] = <Buffer[]> this.undoHandler.getDataArray();
        for(let i = 0; i < undoBuffers.length; i++) {
            Module.BufferUtils.clearBuffer(undoBuffers[i]);
        }
        this.undoHandler.reset();
    }

    private update() : void {

        if(this.paintIsDry) return;

        // advect
        this.fluidSolver.advect(this.velocityBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.velocityBuffer.readBuffer, this.dissipation);
        this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);

        // add our force buffer to the velocity buffer and then clear it.
        this.fluidSolver.addBuffers(this.velocityBuffer.readBuffer, this.forceBuffer.readBuffer, this.velocityBuffer.writeBuffer);
        this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
        Module.BufferUtils.clearBuffer(this.forceBuffer.readBuffer);
        
        //compute divergence
        this.fluidSolver.computeDivergance(this.divergenceBuffer, this.velocityBuffer.readBuffer);

        // solve pressures.
        for(let i = 0; i < this.solverIterations; i++) {
            this.fluidSolver.pressureSolve(this.pressureBuffer, this.divergenceBuffer);
            this.pressureBuffer = Module.BufferUtils.swapBuffers(this.pressureBuffer);
        }

        //subtractGradient
        this.fluidSolver.subtractGradient(this.velocityBuffer, this.pressureBuffer.readBuffer);
        this.velocityBuffer = Module.BufferUtils.swapBuffers(this.velocityBuffer);
    }

    public updateJacobiIterations(val : number) : void {
        this.solverIterations = val;
    }

    public updateTimeout(val : number) : void {
        this.timeout = val;
    }

    public updateDissipation(val : number) : void {
        this.dissipation = val;
    }

    public updateBrush(b : number) : void {
        this.fluidSolver.setBrush(b);
    }

    public applyPaint() : void {
        if(this.inputSettings.dryBrush) return;
        
        // this applies colored paint to the vis buffer.
        let color : Color = this.inputSettings.brushColor;
        let alpha : number = this.inputSettings.brushAlpha;
        this.fluidSolver.applyPaint(this.visBuffer, this.forceHandler.getForces(), color.r, color.g, color.b, alpha);
        this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);
    }

    public applyForce() : void {
        // add the forces to the force buffer
        this.fluidSolver.applyForces(this.forceBuffer, this.forceHandler.getForces());
        this.forceBuffer = Module.BufferUtils.swapBuffers(this.forceBuffer);
        this.paintIsDry = false;

        // set a timer to continue to simulate the fluid.
        clearTimeout(this.dryTimer);

        if(this.timeout === 0) return;

        this.dryTimer = setTimeout(() => {
            this.resetSimBuffers();
            this.paintIsDry = true;
        }, this.timeout * 1000);
    }

    // this method add stores a snapshot of the canvas for undo functionality.
    public storeLastBuffer() : void {
        let buffer : Buffer = this.undoHandler.getItemToStoreTo();
        this.fluidSolver.copyBuffer(this.visBuffer.readBuffer, buffer);
    }

    public undo() : void {

        // this check tells us if this is the first undo being performed.
        // if so, it takes a snapshot of the canvas. so we can redo later back to it.
        if(this.undoHandler.isRedoEnabled() === false) {
            let buffer : Buffer = this.undoHandler.getCurrentItemToStore();
            this.fluidSolver.copyBuffer(this.visBuffer.readBuffer, buffer);
        }

        let buffer : Buffer = this.undoHandler.undo();
        if(buffer !== null){
            this.fluidSolver.copyBuffer(buffer, this.visBuffer.readBuffer);
        }
    }

    public redo() : void {
        let buffer : Buffer = this.undoHandler.redo();
        if(buffer !== null){
            this.fluidSolver.copyBuffer(buffer, this.visBuffer.readBuffer);
        }
    }

    private draw() : void {
        // advect vis buffer with velocity.
        this.fluidSolver.advect(this.visBuffer.writeBuffer, this.velocityBuffer.readBuffer, this.visBuffer.readBuffer, 1.0);
        this.visBuffer = Module.BufferUtils.swapBuffers(this.visBuffer);

        // draw 
        this.drawingProgram.drawBuffer(this.visBuffer.readBuffer);

        // save image if requested.
        if(this.inputSettings.saveImage === true){
            this.inputSettings.saveImage = false;
            window.open(this.canvas.toDataURL(), '_blank');
            window.focus();
        }
    }
}