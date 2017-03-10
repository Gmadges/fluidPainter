var vec2 = (function () {
    function vec2(_x, _y) {
        this.x = _x;
        this.y = _y;
    }
    vec2.prototype.distance = function (pos) {
        return new vec2(this.x - pos.x, this.y - pos.y);
    };
    return vec2;
}());
var InputController = (function () {
    function InputController(canvas, forceHandler) {
        this.canvas = canvas;
        this.forceHandler = forceHandler;
        this.forceApplied = false;
        this.bMouseDown = false;
        this.lastPos = new vec2(0, 0);
        this.currentPos = new vec2(0, 0);
        this.debugDrawState = "visualise";
        canvas.onmousedown = this.mouseDown.bind(this);
        canvas.onmouseup = this.mouseUp.bind(this);
        canvas.onmousemove = this.mouseMove.bind(this);
        canvas.onmouseleave = this.mouseUp.bind(this);
        canvas.addEventListener("touchstart", this.touchDown.bind(this), false);
        canvas.addEventListener("touchend", this.mouseUp.bind(this), false);
        canvas.addEventListener("touchmove", this.touchMove.bind(this), false);
        window.onkeyup = this.debugDrawing.bind(this);
    }
    InputController.prototype.mouseUp = function (e) {
        this.bMouseDown = false;
    };
    InputController.prototype.mouseDown = function (e) {
        this.currentPos = this.getCursorPosition(this.canvas, e);
        this.bMouseDown = true;
    };
    InputController.prototype.touchDown = function (e) {
        this.currentPos = this.getTouchPosition(this.canvas, e);
        this.bMouseDown = true;
    };
    InputController.prototype.touchMove = function (e) {
        if (!this.bMouseDown)
            return;
        this.lastPos = this.currentPos;
        this.currentPos = this.getTouchPosition(this.canvas, e);
        this.addForce();
    };
    InputController.prototype.mouseMove = function (e) {
        if (!this.bMouseDown)
            return;
        this.lastPos = this.currentPos;
        this.currentPos = this.getCursorPosition(this.canvas, e);
        this.addForce();
    };
    InputController.prototype.addForce = function () {
        var dist = this.currentPos.distance(this.lastPos);
        var xforce = dist.x;
        var yforce = dist.y;
        this.forceHandler.addForce(this.currentPos.x, this.currentPos.y, xforce, yforce, 10);
    };
    InputController.prototype.getCursorPosition = function (canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return new vec2(event.clientX - rect.left, event.clientY - rect.top);
    };
    InputController.prototype.getTouchPosition = function (canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return new vec2(event.touches[0].clientX - rect.left, event.touches[0].clientY - rect.top);
    };
    InputController.prototype.getDebugDrawState = function () {
        return this.debugDrawState;
    };
    InputController.prototype.debugDrawing = function (e) {
        var code = e.keyCode;
        switch (code) {
            case 49: {
                this.debugDrawState = "visualise";
                break;
            }
            case 50: {
                this.debugDrawState = "velocity";
                break;
            }
            case 51: {
                this.debugDrawState = "divergence";
                break;
            }
            case 52: {
                this.debugDrawState = "pressure";
                break;
            }
        }
    };
    return InputController;
}());
//# sourceMappingURL=input.js.map