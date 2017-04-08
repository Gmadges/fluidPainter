
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

    private XScaleFactor : number = 1.0;
    private YScaleFactor : number = 1.0;

    private debugDrawState : string = "visualise";
    public brushSize : number = 10;

    constructor(private canvas: HTMLCanvasElement, 
                    private forceHandler : any, 
                    private mouseHandler : any, 
                    width : number, 
                    height: number, 
                    private paintCanvas : any) {

        canvas.onmousedown = this.mouseDown.bind(this);
        canvas.onmouseup = this.mouseUp.bind(this);
        canvas.onmousemove = this.mouseMove.bind(this);
        canvas.onmouseleave = this.mouseUp.bind(this);

        this.XScaleFactor = width / canvas.width;
        this.YScaleFactor = height / canvas.height;

        // for debugging
        window.onkeyup = this.debugDrawing.bind(this);
    }

    private mouseUp(e : Event) {
        this.bMouseDown = false;

        this.lastlastPos = new vec2(-1,-1);
        this.lastPos = new vec2(-1,-1);
        this.currentPos = new vec2(-1,-1);
    }

    private mouseDown(e : Event) {
        this.currentPos = this.getCursorPosition(this.canvas, e);
        this.lastPos = this.currentPos;
        this.bMouseDown = true;
        this.addForce();
    }

    private mouseMove(e : Event) {
        if(!this.bMouseDown) return;
        
        this.lastlastPos = this.lastPos;
        this.lastPos = this.currentPos;
        this.currentPos = this.getCursorPosition(this.canvas, e);
        
        this.addForce();
    }

    private addForce() {
        // calc the distance
        let dist : vec2 = this.currentPos.distance(this.lastPos);

        let xforce : number = 0;
        let yforce : number = 0;
        
        if(dist.x !== 0){
            xforce = (dist.x / dist.length()) * 0.001;
        }    

        if(dist.y !== 0){
            yforce = (dist.y / dist.length()) * 0.001;
        }      

        let brush : number = this.brushSize * ((this.YScaleFactor + this.XScaleFactor) / 2);
        this.forceHandler.addForce(this.currentPos.x, this.currentPos.y, xforce, yforce, brush);

        // add for paint
        if(this.lastlastPos.y > -1 && dist.length() > brush * 0.25){
            this.mouseHandler.addForce(this.lastlastPos.x, this.lastlastPos.y, 0, 0, brush);
            this.mouseHandler.addForce(this.lastPos.x, this.lastPos.y, 0, 0, brush);
            this.mouseHandler.addForce(this.currentPos.x, this.currentPos.y, 0, 0, brush);
        }
        else {
            this.mouseHandler.addForce(this.currentPos.x, this.currentPos.y, 0, 0, brush);
        }

        this.paintCanvas.applyPaint();

        this.mouseHandler.reset();
    }

    private getCursorPosition(canvas, event) : any {
        var rect = canvas.getBoundingClientRect();
        var X = (event.clientX - rect.left) * this.XScaleFactor;
        var Y = (event.clientY - rect.top) * this.YScaleFactor;
        return new vec2(X, Y);
    }

    // for testing debugDrawing
    public getDebugDrawState() : string {
        return this.debugDrawState;
    }

    private debugDrawing(e : KeyboardEvent) {
        let code = e.keyCode;

        switch(code) {
            case 49: {
                // key 1
                this.debugDrawState = "visualise";
                break;
            }
            case 50: {
                // key 1
                this.debugDrawState = "velocity";
                break;
            }
            case 51: {
                // key 2
                this.debugDrawState = "divergence";
                break;
            }
            case 52: {
                // key 3
                this.debugDrawState = "pressure";
                break;
            }
        }
    }
}