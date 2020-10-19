import { api } from 'lwc';
import SmGap from 'c/smGap';

export default class SmGroupGap extends SmGap {

    constructor(groupGapNumber) {
        super(groupGapNumber);
    }

    @api get groupGapNumber() {
        return this.gapNumber;
    }
    set groupGapNumber(value) {
        this.gapNumber = value;
    }

    getTargetLabel() {
        return('groupgap #' + this.gapNumber);
    }

    //DROP TARGET drop event handler
    handleDrop(evt) {
            
        console.log('Handling Drop into drop tagert for GROUP gap [' + this.groupGapNumber + ']');
        
        //Cancel the event
        this.cancel(evt);

        //Dispatch the custom event to raise the detail payload up one level        
        const event = new CustomEvent('groupgapdrop', {
            detail: {
                gapNumber : this.groupGapNumber 
            }
        });
        console.log('raising groupgapdrop event...');
        this.dispatchEvent(event);

        this.removeDragOverStyle();
 
    }
}