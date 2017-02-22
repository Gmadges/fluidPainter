
class InputController {

    private forceApplied : boolean = false;
    private bMouseDown : boolean = false;

    constructor(private canvas: HTMLCanvasElement) {

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

    }

    public isForceApplied() : boolean {
        return false;
    }

    private getCursorPosition(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y);
    }
}