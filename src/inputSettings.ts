/// <reference path="inputController.ts" />
/// <reference path="paintCanvas.ts" />

var $ : JQueryStatic;

class InputSettings {

    public brushColor : any = {r:0, g:0, b:0};
    public saveImage : boolean = false;

    constructor(private inputControl : InputController, private paintCanvas : PaintCanvas.Program) {

        $('#brushSizeRange').on("change",  this.brushSizeChange.bind(this));
        $('#canvasSizeRange').on("change",  this.canvasSizeChange.bind(this));

        $('#brushColor').colorpicker({
            color: '#000000',
            format: 'rgb'
        }).on('changeColor', this.brushColorChange.bind(this));
        
        $('#saveButton').on('click', this.enableSaveImage.bind(this));
        
        $('#resetButton').on('click', this.resize.bind(this));

        $('#pressureIterations').on('change', this.jacobiChange.bind(this));
        $('#fpsNumber').on('change', this.fpsChange.bind(this));
        $('#brushForceRange').on('change', this.brushForceChange.bind(this));

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
        $('#scale1').click(function(e){
            this.paintCanvas.reset(1, 1);
            this.inputControl.scaleFactor = 1;
            $('#scaleDropdownMenuButton').html($('#scale1').html());
            e.preventDefault();
        }.bind(this));
    
        $('#scale075').click(function(e){
            this.paintCanvas.reset(0.86, 0.86);
            this.inputControl.scaleFactor = 0.75;
            $('#scaleDropdownMenuButton').html($('#scale075').html());
            e.preventDefault();
        }.bind(this));

        $('#scale050').click(function(e){
            this.paintCanvas.reset(0.7, 0.7);
            this.inputControl.scaleFactor = 0.5;
            $('#scaleDropdownMenuButton').html($('#scale050').html());
            e.preventDefault();
        }.bind(this));

        $('#scale025').click(function(e){
            this.paintCanvas.reset(0.5, 0.5);
            this.inputControl.scaleFactor = 0.25;
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

    private jacobiChange() {
        this.paintCanvas.updateJacobiIterations($('#pressureIterations').val());
    }

    private fpsChange() {
        this.paintCanvas.updateFPS($('#fpsNumber').val());
    }

    private brushSizeChange() {
        this.inputControl.brushSize = parseInt($('#brushSizeRange').val());
        $('#brushSizeText').text('Size: ' + this.inputControl.brushSize + 'px');
    }

    private canvasSizeChange() {
        let scale = parseInt($('#canvasSizeRange').val()) / 100;
        
        // get the max size we can have
        let newWidth = Math.floor($('#canvasContainer').outerWidth() * scale);
        let newHeight = Math.floor(newWidth * 0.75);

        // set the new canvas
        $('#canvas').width(newWidth);
        $('#canvas').height(newHeight);
        
        $('#easel').css({'height': newHeight + 'px', 'width': newWidth + 'px'});

        this.paintCanvas.reset(this.inputControl.scaleFactor, this.inputControl.scaleFactor);

        $('#canvasSizeText').text('Size: ' + newWidth + ' x ' + newHeight + 'px');
    }
}