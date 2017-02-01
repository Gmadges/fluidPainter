//<reference path="input.ts"/>
// uneeded anymore

var Module : any;

module PaintCanvas {
    export class Program {
        
        constructor(private canvas: HTMLCanvasElement) {
            // testing a new binding system;
            var instance = new Module.MyClass(10, "hello");
            instance.incrementX();
            instance.x; // 12
            instance.x = 20; // 20

            console.log(Module.MyClass.getStringFromInstance(instance));

            instance.delete();
        }
    }
}