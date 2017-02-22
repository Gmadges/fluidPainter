
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
}

class InputController {

    private forceApplied : boolean = false;
    private bMouseDown : boolean = false;

    private lastPos : vec2 = new vec2(0,0);
    private currentPos : vec2 = new vec2(0,0);

    constructor(private canvas: HTMLCanvasElement) {

        canvas.onmousedown = this.mouseDown.bind(this);
        canvas.onmouseup = this.mouseUp.bind(this);
        canvas.onmousemove = this.mouseMove.bind(this);
        canvas.onmouseleave = this.mouseUp.bind(this); 
    }

    public isForceApplied() : boolean {
        return false;
    }

    private mouseUp(e : Event) {
        this.bMouseDown = false;
    }

    private mouseDown(e : Event) {
        this.bMouseDown = true;
    }

    private mouseMove(e : Event) {
        if(!this.bMouseDown) return;
        
        this.lastPos = this.currentPos;

        this.currentPos = this.getCursorPosition(this.canvas, e);

        // calc the distance
        var dist : vec2 = this.currentPos.distance(this.lastPos);

        console.log("dist x: " + dist.x + " y: " + dist.y);
    }

    private getCursorPosition(canvas, event) : any {
        var rect = canvas.getBoundingClientRect();
        return new vec2(event.clientX - rect.left, event.clientY - rect.top);
    }
}