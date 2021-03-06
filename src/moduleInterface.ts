// These Interfaces allow us to use the Typescripts type system nicely.
// I have defined the emscripten generated codes interface.

interface emModule {
    createContext(canvas : HTMLCanvasElement, useWebGL : boolean, setInModule : boolean, attributes : WebGLContextAttributes) : WebGLRenderingContext;
    GridFluidSolver : GridFluidSolver;
    Drawing : Drawing;
    BufferUtils : BufferUtils;
    ForceHandler : ForceHandler;
}

interface GridFluidSolver {
    () : void;
    init(width : number, height : number) : void;
    advect(output : Buffer, velocity : Buffer, input : Buffer, dissipation : number) : void;
    applyForces(buffer : DoubleBuffer, forces : Object) : void;
    applyPaint(buffer : DoubleBuffer, forces : Object, r : number , g : number , b : number, a : number) : void;
    computeDivergance(divergence : Buffer, velocity : Buffer) : void;
    pressureSolve(pressure : DoubleBuffer, divergence : Buffer) : void;
    subtractGradient(velocity : DoubleBuffer, pressure : Buffer) : void;
    addBuffers(input1 : Buffer, input2 : Buffer, output : Buffer) : void;
    copyBuffer(input : Buffer, output : Buffer) : void;
    setBrush(index : number) : void;
    delete() : void;
}

interface Drawing {
    () : void;
    init(width : number, height : number) : void;
    drawBuffer(buffer : Buffer) : void;
    setSize(width : number, height : number) : void;
    resetBuffer(buffer : Buffer) : void;
    delete() : void ;
}

interface Buffer {
    fboHandle : number;
    texhandle : number;
}

interface DoubleBuffer {
    writeBuffer : Buffer;
    readBuffer : Buffer;
}

interface BufferUtils {
    createDoubleBuffer(width : number, height : number) : DoubleBuffer;
    createBuffer(width : number, height : number) : Buffer;
    swapBuffers(buffers : DoubleBuffer) : DoubleBuffer;
    clearBuffer(buffer : Buffer) : void;
}

interface ForceHandler {
    () : void;
    addForce(xPix : number, yPix : number, xForce : number, yForce : number, size : number) : void;
    reset() : void;
    getForces() : any[];
    isForceAvailable() : boolean;
    getNumberForces() : number;
    delete() : void;
}



