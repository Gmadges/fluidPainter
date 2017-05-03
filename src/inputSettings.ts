/// <reference path="inputController.ts" />
/// <reference path="paintCanvas.ts" />

// color picker is a javascript library with no typescript typings.
// Therefore I'm going to extend the Jquery interface to have a function that resembles it.
// This will stop the annoying error we get.
interface JQuery  {
    colorpicker(settings : Object): JQuery;
}

interface Color {
    r : number;
    g : number;
    b : number;
}

class InputSettings {

    // make this public for because their just settings.
    public dryBrush : boolean = false;
    public brushColor : Color = { r:0, g:0, b:0 };
    public brushAlpha : number = 0.5;
    public saveImage : boolean = false;

    private canvasScale : number = 1.0;

    constructor(private inputControl : InputController, private paintCanvas : PaintCanvas) {

        // set up all our gui connections.
        $('#brushSizeRange').on("change",  this.brushSizeChange.bind(this));
        $('#canvasSizeRange').on("change",  this.canvasSizeChange.bind(this));
        $('#brushForceRange').on('change', this.brushForceChange.bind(this));
        $('#brushAlphaRange').on('change', this.brushAlphaChange.bind(this));

        // set write values on size
        let canvas = <HTMLCanvasElement> document.getElementById("canvas");
        this.updateCanvasSizeText(canvas.width, canvas.height);

        $('#brushColor').colorpicker({
            color: '#000000',
            format: 'rgb'
        }).on('changeColor', this.brushColorChange.bind(this));
        
        $('#saveButton').on('click', this.enableSaveImage.bind(this));
        
        $('#resetButton').on('click', this.reset.bind(this));

        $('#undoButton').on('click', this.undo.bind(this));
        $('#redoButton').on('click', this.redo.bind(this));

        $('#dryBrushCheck').on('click', this.dryBrushChange.bind(this));
        $('#dryBrushCheck').click();

        $('#pressureIterations').on('change', this.jacobiChange.bind(this));
        $('#fpsNumber').on('change', this.fpsChange.bind(this));
        $('#timeoutNumber').on('change', this.timeoutChange.bind(this));
        $('#dissipationNumber').on('change', this.dissipationChange.bind(this));

        $('#imageUpload').on('change', this.loadImage.bind(this));

        this.initBrushDropDown();
        this.initScaleDropDown();
        this.initKeypress();
    }

    private initKeypress() : void {

        $(document).keydown(function(e : JQueryKeyEventObject) {
            switch(e.which) {
                case 85: {
                    // U
                    this.undo();
                    break;
                }
                case 82: {
                    // R
                    this.redo();
                    break;
                }
                case 90: {
                    // Z
                    if(e.ctrlKey) {
                        this.undo();
                    }
                    break;
                }
                case 89: {
                    // Y
                    if(e.ctrlKey) {
                        this.redo();
                    }
                    break;
                }
            }
        }.bind(this));
    }

    private initBrushDropDown() : void {
        
        $('#circleBrush').click(function(e : Event){
            this.paintCanvas.updateBrush(0);
            $('#brushDropdownMenuButton').html($('#circleBrush').html());
            e.preventDefault();
        }.bind(this));

        $('#spottyBrush').click(function(e : Event){
            this.paintCanvas.updateBrush(1);
            $('#brushDropdownMenuButton').html($('#spottyBrush').html());
            e.preventDefault();
        }.bind(this));

        $('#lineBrush').click(function(e : Event){
            this.paintCanvas.updateBrush(2);
            $('#brushDropdownMenuButton').html($('#lineBrush').html());
            e.preventDefault();
        }.bind(this));

        $('#crossBrush').click(function(e : Event){
            this.paintCanvas.updateBrush(3);
            $('#brushDropdownMenuButton').html($('#crossBrush').html());
            e.preventDefault();
        }.bind(this));
    
        $('#starBrush').click(function(e : Event){
            this.paintCanvas.updateBrush(4);
            $('#brushDropdownMenuButton').html($('#starBrush').html());
            e.preventDefault();
        }.bind(this));
    }

    private initScaleDropDown() : void {
        $('#scale1').click(function(e : Event) {
            this.canvasScale = 1.0;
            this.inputControl.scaleFactor = 1;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale1').html());
            e.preventDefault();
        }.bind(this));
    
        $('#scale075').click(function(e : Event){
            this.canvasScale = 0.86;
            this.inputControl.scaleFactor = 0.75;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale075').html());
            e.preventDefault();
        }.bind(this));

        $('#scale050').click(function(e : Event) {
            this.canvasScale = 0.7;
            this.inputControl.scaleFactor = 0.5;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale050').html());
            e.preventDefault();
        }.bind(this));

        $('#scale025').click(function(e : Event){
            this.canvasScale = 0.5;
            this.inputControl.scaleFactor = 0.25;
            this.updateCanvasSizing();
            $('#scaleDropdownMenuButton').html($('#scale025').html());
            e.preventDefault();
        }.bind(this));
    }

    private loadImage() : void {
        let files = $('#imageUpload').prop('files'); 

        if(files.length === 0) return;

        if(files.length > 1) {
            alert("Too Many files!");
            return;
        }

        let img : HTMLImageElement = new Image();
        
        img.onload = function() {
            this.paintCanvas.loadUserImage(img);
        }.bind(this);

        img.src = window.URL.createObjectURL(files[0]);
    }

    private enableSaveImage() : void {
        this.saveImage = true;
    }

    private brushColorChange() : void {
        let color : any = $('#brushColor').data('colorpicker').color.toRGB();
        this.brushColor.r = color.r / 255;
        this.brushColor.g = color.g / 255;
        this.brushColor.b = color.b / 255;
    }

    private brushAlphaChange() : void {
        this.brushAlpha = $('#brushAlphaRange').val() / 100;
        $('#brushAlphaText').text('Alpha: ' + this.brushAlpha);
    }

    private dryBrushChange() : void {
        // bit of a hack
        let checked : boolean = $('#dryBrushCheck').hasClass('active');
        if(checked) {
            $('#dryBrushCheck').html('ON <i class="fa fa-check" aria-hidden="true"></i>');
        } else {
            $('#dryBrushCheck').html('OFF <i class="fa fa-close" aria-hidden="true"></i>');
        }
        this.dryBrush = checked;
    }

    private reset() : void {
        this.paintCanvas.resetBuffers();
    }

    private undo() : void {
        this.paintCanvas.undo();
    }

    private redo() : void {
        this.paintCanvas.redo();
    }

    private brushForceChange() : void {
        this.inputControl.brushForce = $('#brushForceRange').val() / 100;
    }

    private dissipationChange() : void {
        this.paintCanvas.updateDissipation(parseFloat($('#dissipationNumber').val()));
    }

    private timeoutChange() : void {
        this.paintCanvas.updateTimeout(parseFloat($('#timeoutNumber').val()));
    }

    private jacobiChange() : void {
        this.paintCanvas.updateJacobiIterations(parseFloat($('#pressureIterations').val()));
    }

    private fpsChange() : void {
        this.paintCanvas.updateFPS(parseInt($('#fpsNumber').val()));
    }

    private brushSizeChange() : void {
        this.inputControl.brushSize = parseInt($('#brushSizeRange').val());
        $('#brushSizeText').text('Size: ' + this.inputControl.brushSize + 'px');
    }

    private canvasSizeChange() : void {
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
        this.updateCanvasSizeText(newWidth, newHeight);
    }

    private updateCanvasSizeText(width : number, height : number) : void {
        let text = $('#canvasSizeText');
        let info = text.find('i'); 
        text.text('Size: ' + width + ' x ' + height + 'px ');
        text.append(info);
    }

    private updateCanvasSizing() : void {
        let scale : number = this.canvasScale;
        let w : number = $('#canvas').width();
        let h : number = $('#canvas').height()
        this.paintCanvas.reset(w, h, scale, scale);
    }
}