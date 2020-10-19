import { LightningElement, api } from 'lwc';
import SmDraggableRecordContainer from 'c/smDraggableRecordContainer';

export default class SmQuestionGroup2 extends SmDraggableRecordContainer {

    @api smContentList;
    @api get group() {
        return this.theRecord;
    }
    set group(value) {
        this.theRecord = value;
    };

    //Function to cancel drag n drop events
    cancel(evt) {
        if (evt.stopPropagation) evt.stopPropagation();
        if (evt.preventDefault) evt.preventDefault();
        return false;
    };

    //DRAG SOURCE drag event handler dispatched from the child component
    handleItemDrag(evt) {
        
        console.log('Drag event from the drag target: ' + evt.detailinto + ' for drop target: ' + this.group.Id);
        this.cancel(evt);

        //Dispatch the custom event to raise the detail payload up one level
        const event = new CustomEvent('listitemdrag', {
            detail: evt.detail
        });
        this.dispatchEvent(event);
    }

    //drop event handler dispatched from the child component
    handleGapDrop(evt) {
            
        console.log('handleGapDrop groupId: ' + this.group.Id);
        
        //Cancel the event
        this.cancel(evt);

        //Dispatch the custom event to raise the detail payload up one level        
        const event = new CustomEvent('itemdrop', {
            detail: evt.detail
        });
        this.dispatchEvent(event);
    }

}