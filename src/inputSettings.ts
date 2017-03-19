/// <reference path="inputController.ts" />

var $ : JQueryStatic;

class InputSettings {

    constructor(private inputControl : InputController) {

        $('#sizeRange').on("change",  this.sizeChange.bind(this));

        // set value on drop down
        $(".dropdown-item").click(function(ev) {
            $(".dropdown-toggle").html($(this).html());
            let option : string = $(this).text();
        });
    }
            
    private brushChange() {

    }

    private sizeChange() {
        this.inputControl.brushSize = parseInt($('#sizeRange').val());
        $('#brushSizeText').text('Size: ' + this.inputControl.brushSize + 'px');
    }
}