
class vec2 {

    public x : number;
    public y : number;

    constructor( _x : number, _y : number) {
        this.x = _x;
        this.y = _y;
    }

    public distance( pos : vec2) : any {
        return new vec2(this.x - pos.x, this.y - pos.y);
    }

    public length() : number {
        return Math.sqrt((Math.pow(this.x, 2) + Math.pow(this.y, 2)));
    }
}

class InputController {

    private forceApplied : boolean = false;
    private bMouseDown : boolean = false;

    private lastlastPos : vec2 = new vec2(-1,-1);
    private lastPos : vec2 = new vec2(-1,-1);
    private currentPos : vec2 = new vec2(-1,-1);

    private debugDrawState : string = "visualise";
    public brushSize : number = 100;
    public brushForce : number = 0.01;

    public scaleFactor : number = 1;

    constructor(private paintCanvas : PaintCanvas, 
                    private forceHandler : ForceHandler) {

        this.paintCanvas.canvas.onmousedown = this.mouseDown.bind(this);
        this.paintCanvas.canvas.onmouseup = this.mouseUp.bind(this);
        this.paintCanvas.canvas.onmousemove = this.mouseMove.bind(this);
        this.paintCanvas.canvas.onmouseleave = this.mouseUp.bind(this);
    }

    private mouseUp(e : Event) {
        this.bMouseDown = false;

        this.lastlastPos = new vec2(-1,-1);
        this.lastPos = new vec2(-1,-1);
        this.currentPos = new vec2(-1,-1);
    }

    private mouseDown(e : Event) {
        // is the mouse over the canvas
        this.paintCanvas.storeLastBuffer();

        this.currentPos = this.getCursorPosition(this.paintCanvas.canvas, e);
        this.lastPos = this.currentPos;
        this.bMouseDown = true;
        this.addForce();
    }

    private mouseMove(e : Event) {
        if(!this.bMouseDown) return;
        
        this.lastlastPos = this.lastPos;
        this.lastPos = this.currentPos;
        this.currentPos = this.getCursorPosition(this.paintCanvas.canvas, e);
        this.addForce();
    }

    private addForce() {
        // calc the distance
        let dist : vec2 = this.currentPos.distance(this.lastPos);

        let xforce : number = 0;
        let yforce : number = 0;
        
        if(dist.x !== 0){
            xforce = (dist.x / dist.length()) * this.brushForce;
        }    

        if(dist.y !== 0){
            yforce = (dist.y / dist.length()) * this.brushForce;
        }      

        let brush : number = this.brushSize * this.scaleFactor;

        // add for paint
        if(this.lastlastPos.y > -1 && dist.length() > brush * 0.25){

            this.forceHandler.addForce(this.lastlastPos.x, this.lastlastPos.y, xforce, yforce, brush);
            this.forceHandler.addForce(this.lastPos.x, this.lastPos.y, xforce, yforce, brush);
            this.forceHandler.addForce(this.currentPos.x, this.currentPos.y,  xforce, yforce, brush);
        }
        else {
            this.forceHandler.addForce(this.currentPos.x, this.currentPos.y,  xforce, yforce, brush);
        }

        this.paintCanvas.applyPaint();
        this.paintCanvas.applyForce();

        this.forceHandler.reset();
    }

    private getCursorPosition(canvas, event) : any {
        var rect = canvas.getBoundingClientRect();
        var X = (event.clientX - rect.left) * this.scaleFactor;
        var Y = (event.clientY - rect.top) * this.scaleFactor;
        return new vec2(X, Y);
    }
}