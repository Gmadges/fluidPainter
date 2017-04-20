/// <reference path="inputController.ts" />
/// <reference path="paintCanvas.ts" />

var $ : JQueryStatic;

class InputSettings {

    public brushColor : any = {r:0, g:0, b:0};
    public saveImage : boolean = false;

    private canvasScale : number = 1.0;

    constructor(private inputControl : InputController, private paintCanvas : PaintCanvas.Program) {

        $('#brushSizeRange').on("change",  this.brushSizeChange.bind(this));
        $('#canvasSizeRange').on("change",  this.canvasSizeChange.bind(this));
        $('#brushForceRange').on('change', this.brushForceChange.bind(this));

        $('#brushColor').colorpicker({
            color: '#000000',
            format: 'rgb'
        }).on('changeColor', this.brushColorChange.bind(this));
        
        $('#saveButton').on('click', this.enableSaveImage.bind(this));
        
        $('#resetButton').on('click', this.resize.bind(this));

        $('#pressureIterations').on('change', this.jacobiChange.bind(this));
        $('#fpsNumber').on('change', this.fpsChange.bind(this));
        $('#timeoutNumber').on('change', this.timeoutChange.bind(this));
        $('#dissipationNumber').on('change', this.dissipationChange.bind(this));

        this.initBrushDropDown();
        this.initScaleDropDown();
    }

    private initBrushDropDown() {
        
        $('#circleBrush').click(function(e){
            this.paintCanvas.updateBrush(0);
            $('#brushDropdownMenuButton').html($('#circleBrush').html());
            e.preventDefault();
        }.bind(this));

        $('#spottyBrush').click(function(e){
            this.paintCanvas.updateBrush(1);
            $('#brushDropdownMenuButton').html($('#spottyBrush').html());
            e.preventDefault();
        }.bind(this));

        $('#lineBrush').click(function(e){
            this.paintCanvas.updateBrush(2);
            $('#brushDropdownMenuButton').html($('#lineBrush').html());
            e.preventDefault();
        }.bind(this));

        $('#crossBrush').click(function(e){
            this.paintCanvas.updateBrush(3);
            $('#brushDropdownMenuButton').html($('#crossBrush').html());
            e.preventDefault();
        }.bind(this));
    
        $('#starBrush').click(function(e){
            this.paintCanvas.updateBrush(4);
            $('#brushDropdownMenuButton').html($('#starBrush').html());
            e.preventDefault();
        }.bind(this));
    }

    private initScaleDropDown() {
        $('#scale1').click(function(e) {
            this.canvasScale = 1.0;
            this.inputControl.scaleFactor = 1;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale1').html());
            e.preventDefault();
        }.bind(this));
    
        $('#scale075').click(function(e){
            this.canvasScale = 0.86;
            this.inputControl.scaleFactor = 0.75;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale075').html());
            e.preventDefault();
        }.bind(this));

        $('#scale050').click(function(e) {
            this.canvasScale = 0.7;
            this.inputControl.scaleFactor = 0.5;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale050').html());
            e.preventDefault();
        }.bind(this));

        $('#scale025').click(function(e){
            this.canvasScale = 0.5;
            this.inputControl.scaleFactor = 0.25;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale025').html());
            e.preventDefault();
        }.bind(this));
    }

    private enableSaveImage() {
        this.saveImage = true;
    }

    private brushColorChange() {
        let color : any = $('#brushColor').data('colorpicker').color.toRGB();
        this.brushColor.r = color.r / 255;
        this.brushColor.g = color.g / 255;
        this.brushColor.b = color.b / 255;
    }

    private resize() {
        this.paintCanvas.resetBuffers();
    }

    private brushForceChange() {
        //TODO maybe change the values we use give a bigger range
        this.inputControl.brushForce = $('#brushForceRange').val() / 100;
    }

    private dissipationChange() {
        this.paintCanvas.updateDissipation(parseFloat($('#dissipationNumber').val()));
    }

    private timeoutChange() {
        this.paintCanvas.updateTimeout(parseFloat($('#timeoutNumber').val()));
    }

    private jacobiChange() {
        this.paintCanvas.updateJacobiIterations(parseFloat($('#pressureIterations').val()));
    }

    private fpsChange() {
        this.paintCanvas.updateFPS(parseInt($('#fpsNumber').val()));
    }

    private brushSizeChange() {
        this.inputControl.brushSize = parseInt($('#brushSizeRange').val());
        $('#brushSizeText').text('Size: ' + this.inputControl.brushSize + 'px');
    }

    private canvasSizeChange() {
        let scale : number = parseInt($('#canvasSizeRange').val()) / 100;
        
        // get the max size we can have
        let newWidth : number = Math.floor($('#canvasContainer').outerWidth() * scale);
        let newHeight : number = Math.floor(newWidth * 0.75);

        // set the new canvas
        let canvas = <HTMLCanvasElement> document.getElementById("canvas");
        canvas.height = newHeight;
        canvas.width = newWidth;
        
        $('#easel').css({'height': newHeight + 'px', 'width': newWidth + 'px'});

        this.updateCanvasSizing();

        $('#canvasSizeText').text('Size: ' + newWidth + ' x ' + newHeight + 'px');
    }

    private updateCanvasSizing() {
        let scale : number = this.canvasScale;
        let w : number = $('#canvas').width();
        let h : number = $('#canvas').height()
        this.paintCanvas.reset(w, h, scale, scale);
    }
}