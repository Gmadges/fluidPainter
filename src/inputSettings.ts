/// <reference path="inputController.ts" />
/// <reference path="paintCanvas.ts" />

var $ : JQueryStatic;

class InputSettings {

    public brushColor : any = {r:0, g:0, b:0};
    public saveImage : boolean = false;

    constructor(private inputControl : InputController, private paintCanvas : PaintCanvas.Program) {

        $('#sizeRange').on("change",  this.sizeChange.bind(this));
        // set value on drop down
        $(".dropdown-item").click(function(ev) {
            $(".dropdown-toggle").html($(this).html());
            let option : string = $(this).text();
        });
        $('#brushColor').colorpicker({
            color: '#000000',
            format: 'rgb'
        }).on('changeColor', this.brushColorChange.bind(this));
        $('#saveButton').on('click', this.enableSaveImage.bind(this));
        $('#resetButton').on('click', this.resize.bind(this));
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
        this.paintCanvas.reset();
    }

    private brushChange() {

    }

    private sizeChange() {
        this.inputControl.brushSize = parseInt($('#sizeRange').val());
        $('#brushSizeText').text('Size: ' + this.inputControl.brushSize + 'px');
    }
}