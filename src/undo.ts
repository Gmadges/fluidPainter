/// <reference path="paintCanvas.ts" />

// this class is designed to act like a queue / stack but without the creation and deletion of objects. 
// this is because i want to generate a set amount of buffers at the beginning and keep reususing them.
// gonna do this circular buffer style
class Undo {
    
    private undoQueue : any[] = [];
    private currentIndex : number = 0;
    private maxSize : number = 0;

    private undoEnabled : boolean = false;
    private redoEnabled : boolean = false;

    constructor(data : [any]) {
        this.undoQueue = data;
        this.maxSize = data.length;
    };

    public getCurrentIndex() : number {
        return this.currentIndex;
    };

    public getMaxQueueSize() : number {
        return this.maxSize;
    }

    // returns item that can be overwritten
    public getItemToStoreTo() : any {
        // shift everything down
        let returnItem = this.undoQueue[this.currentIndex];
        this.currentIndex++;
        this.undoEnabled = true;
        return returnItem;
    };

    // returns undo item
    public undo() : any {
        if(this.undoEnabled === false) return null;

        if(this.currentIndex > 0) {
            this.currentIndex--;
        };
        return this.undoQueue[this.currentIndex];
    };

    // returns item;
    public redo() : any {
        if(this.redoEnabled === false) return null;

        if(this.currentIndex < this.maxSize) {
            this.currentIndex++;
        };
        return this.undoQueue[this.currentIndex];
    };
}