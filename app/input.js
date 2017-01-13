var TriangleExample;
(function (TriangleExample) {
    var MouseController = (function () {
        function MouseController(canvas, area) {
            this.canvas = canvas;
            this.area = area;
            this.isMouseDown = false;
            this.lastMouseCoord = null;
            this.zoomSensitivity = 2.0;
            $(canvas).mousewheel(this.onMouseWheel.bind(this));
            canvas.onmousedown = this.onMouseDown.bind(this);
            canvas.onmouseup = this.onMouseUp.bind(this);
            canvas.onmousemove = this.onMouseMove.bind(this);
            canvas.onmouseleave = this.onMouseLeave.bind(this);
        }
        MouseController.prototype.getLocalCoord = function (ev) {
            return { x: ev.clientX - this.canvas.offsetLeft, y: ev.clientY - this.canvas.offsetTop };
        };
        MouseController.prototype.onMouseDown = function (ev) {
            var e = this.getLocalCoord(ev);
            this.isMouseDown = true;
            this.lastMouseCoord = e;
        };
        MouseController.prototype.onMouseUp = function (ev) {
            var e = this.getLocalCoord(ev);
            this.isMouseDown = false;
            this.lastMouseCoord = null;
        };
        MouseController.prototype.onMouseMove = function (ev) {
            var e = this.getLocalCoord(ev);
            if (this.isMouseDown) {
                var offset = { x: e.x - this.lastMouseCoord.x, y: e.y - this.lastMouseCoord.y };
                this.lastMouseCoord = e;
                this.area.pan(offset);
            }
        };
        MouseController.prototype.onMouseLeave = function (ev) {
            this.isMouseDown = false;
        };
        MouseController.prototype.onMouseWheel = function (ev) {
            ev.wheelDelta = ev.deltaY * 120.0;
            var e = this.getLocalCoord(ev);
            this.area.zoom(1.0 + ev.wheelDelta / 1200.0 * this.zoomSensitivity, e);
            return false;
        };
        return MouseController;
    }());
    TriangleExample.MouseController = MouseController;
})(TriangleExample || (TriangleExample = {}));
