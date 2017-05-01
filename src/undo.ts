/// <reference path="paintCanvas.ts" />

// this class is designed to act like a queue / stack but without the creation and deletion of objects. 
// this is because i want to generate a set amount of buffers at the beginning and keep reususing them.
// gonna do this circular buffer style
// this will only work nicely on object arrays due to javascript passing anything that isnt and object by value not ref.
class Undo {
    
    private undoQueue : any[] = [];
    private currentIndex : number = 0;
    private maxSize : number = 0;
    private undoDepth : number = 0;

    private undoEnabled : boolean = false;
    private redoEnabled : boolean = false;

    constructor(data : [Object]) {
        this.undoQueue = data;
        this.maxSize = data.length;
    };

    public getCurrentIndex() : number {
        return this.currentIndex;
    };

    public getMaxQueueSize() : number {
        return this.maxSize;
    }

    // this can be used for finding out if we're on our first undo or not.
    public isRedoEnabled() : boolean {
        return this.redoEnabled;
    }

    // this gives the current item. to be used before first undo.
    // must set this if you want to use redo!!!!!!
    public getCurrentItem() : any {
        let index : number = this.currentIndex + 1;
        if(index > this.maxSize) {
            this.undoDepth = index;
            return this.doShift();
        };
        this.undoDepth = this.currentIndex;
        return this.undoQueue[this.currentIndex];
    };

    // returns item that can be overwritten
    public getItemToStoreTo() : any {

        // unod can now happen because we have values to revert to
        this.undoEnabled = true;
        // we now cannot redo because we are at the head.
        this.redoEnabled = false;

        // increase the index
        this.currentIndex++;

        if(this.currentIndex > this.maxSize) {
            return this.doShift();
        }
        
        return this.undoQueue[this.currentIndex - 1];
    };

    private doShift() : any {
        // perform a shift
        let tmp = this.deepCopy(this.undoQueue[0]);

        for(let i = 0; i < (this.maxSize - 1); i++) {
            this.undoQueue[i] = this.deepCopy(this.undoQueue[i+1]);
        };

        this.currentIndex = this.maxSize;
        this.undoQueue[this.currentIndex] = tmp;
        return tmp;
    };

    // returns undo item
    public undo() : any {
        if(this.undoEnabled === false) return null;
        // we have undone so we can redo now.
        this.redoEnabled = true;

        if(this.currentIndex > 0) {
            this.currentIndex--;
        };
        return this.undoQueue[this.currentIndex];
    };

    // returns item;
    public redo() : any {
        if(this.redoEnabled === false) return null;

        if(this.currentIndex < this.undoDepth) {
            this.currentIndex++;
        };
        return this.undoQueue[this.currentIndex];
    };

    private deepCopy(obj : Object) : any {
        return JSON.parse(JSON.stringify(obj));
    }
}