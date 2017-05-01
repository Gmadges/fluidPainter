/// <reference path="paintCanvas.ts" />

// this class is designed to act like a queue / stack but without the creation and deletion of objects. 
// this is because i want to generate a set amount of buffers at the beginning and keep reususing them.
// gonna do this circular buffer style
// this will only work nicely on object arrays due to javascript passing anything that isnt and object by value not ref.
class Undo {
    
    private activeArray : any[] = [];
    private reserveArray : any[] = [];

    private undoEnabled : boolean = false;
    // private redoEnabled : boolean = false;

    constructor(data : Object[]) {
        this.reserveArray = data;
    };

    public getActiveSize() : number {
        return this.activeArray.length;
    };

    public getReserveSize() : number {
        return this.reserveArray.length;
    };

    public getMaxSize() : number {
        return this.activeArray.length + this.reserveArray.length;
    }

    // // this can be used for finding out if we're on our first undo or not.
    // public isRedoEnabled() : boolean {
    //     return this.redoEnabled;
    // }

    // public storeCurrentItem() : any {

    //     if(this.reserveArray.length !== 0) {
    //         return this.reserveArray[this.reserveArray.length - 1];
    //     }

    //     this.doShift();
    //     let item = this.activeArray.pop();
    //     this.reserveArray.push(item);
    //     return item;
    // };

    // returns item that can be overwritten
    public getItemToStoreTo() : any {

        // unod can now happen because we have values to revert to
        this.undoEnabled = true;
        // we now cannot redo because we are at the head.
        // this.redoEnabled = false;

        if(this.reserveArray.length !== 0) {
            let item = this.reserveArray.pop();
            this.activeArray.push(item);
            return item;
        }

        return this.doShift();
    };

    private doShift() : any {
        // perform a shift
        let tmp = this.deepCopy(this.activeArray[0]);

        for(let i = 0; i < this.activeArray.length - 1; i++) {
            this.activeArray[i] = this.deepCopy(this.activeArray[i+1]);
        };

        this.activeArray[this.activeArray.length - 1] = tmp;
        return tmp;
    };

    // returns undo item
    public undo() : any {
        if(this.undoEnabled === false) return null;
        // we have undone so we can redo now.
        // this.redoEnabled = true;

        if(this.activeArray.length === 0) {
            return this.reserveArray[this.reserveArray.length - 1];
        };

        let item = this.activeArray.pop();
        this.reserveArray.push(item);
        return item;
    };

    // // returns item;
    // public redo() : any {
    //     if(this.redoEnabled === false) return null;

    //     if(this.reserveArray.length === 0) {
    //         return this.activeArray[this.activeArray.length - 1];
    //     };

    //     let item = this.reserveArray.pop();
    //     this.activeArray.push(item);
    //     return item;
    // };

    private deepCopy(obj : Object) : any {
        return JSON.parse(JSON.stringify(obj));
    };
}