/// <reference path="inputController.ts" />

var $ : JQueryStatic;

class InputSettings {

    constructor(private inputControl : InputController) {
        $('#sizeRange').on("change",  this.sizeChange.bind(this));
    }

    private brushChange() {

    }

    private sizeChange() {
        this.inputControl.brushSize = parseInt($('#sizeRange').val());
        $('#brushSizeText').text('Size: ' + this.inputControl.brushSize + 'px');
    }
}