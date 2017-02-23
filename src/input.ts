
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

class forcePacket {

    public pos : vec2;
    public force : vec2;

    constructor( _pos : vec2, _force : vec2) {
        this.pos = _pos;
        this.force = _force;
    }
}

class InputController {

    private forceApplied : boolean = false;
    private bMouseDown : boolean = false;

    private lastPos : vec2 = new vec2(0,0);
    private currentPos : vec2 = new vec2(0,0);

    // store the list of 
    private forceList : Array<forcePacket> = [];

    constructor(private canvas: HTMLCanvasElement) {

        canvas.onmousedown = this.mouseDown.bind(this);
        canvas.onmouseup = this.mouseUp.bind(this);
        canvas.onmousemove = this.mouseMove.bind(this);
        canvas.onmouseleave = this.mouseUp.bind(this);
    }

    public isForceAvailable() : boolean {
        return this.forceList.length > 0;
    }

    public resetForceList() {
        this.forceList = [];
    }

    public getForceList() : Array<forcePacket> {
        return this.forceList;
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

        // normalize
        let xforce : number = dist.x / this.canvas.width;
        let yforce : number = dist.y / this.canvas.height;

        this.forceList.push(new forcePacket(this.currentPos, new vec2(xforce, yforce)));
    }

    private getCursorPosition(canvas, event) : any {
        var rect = canvas.getBoundingClientRect();
        return new vec2(event.clientX - rect.left, event.clientY - rect.top);
    }
}