import { api } from 'lwc';
import SmGap from 'c/smGap';

export default class SmQuestionGap extends SmGap {
    @api group;

    getGroupId() {
        return this.group ? this.group.Id : 'none';
    }

    //DROP TARGET drop event handler
    handleDrop(evt) {
            
        console.log('Handling Drop into drop tagert for QUESTION gap [' + this.gapNumber + ']');
        
        //Cancel the event
        this.cancel(evt);

        //Dispatch the custom event to raise the detail payload up one level        
        const event = new CustomEvent('gapdrop', {
            detail: {
                groupId : this.getGroupId(),
                groupNumber : (this.group ? this.group.GroupNumber__c : 0),
                gapNumber : this.gapNumber 
            }
        });
        console.log('raising gapdrop event...');
        this.dispatchEvent(event);

        this.removeDragOverStyle();
 
    }

}