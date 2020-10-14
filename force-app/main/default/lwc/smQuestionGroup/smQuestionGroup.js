import { api } from 'lwc';
import SmDropTarget from 'c/smDropTarget';

export default class SmQuestionGroup extends SmDropTarget {

    @api smContentList;
    @api groupId;

    getTargetLabel() { return 'NoGroup'; }

    //DRAG SOURCE drag event handler dispatched from the child component
    handleItemDrag(evt) {
        
        console.log('Drag event from the drag target: ' + evt.detailinto + ' for drop target: ' + this.groupId);
        this.cancel(evt);

        //Dispatch the custom event to raise the detail payload up one level
        const event = new CustomEvent('listitemdrag', {
            detail: evt.detail
        });
        this.dispatchEvent(event);
    }

    //DROP TARGET drop event handler
    handleDrop(evt) {
            
        console.log('Handling Drop into drop tagert for groupId: ' + this.groupId);
        
        //Cancel the event
        this.cancel(evt);

        //Dispatch the custom event to raise the detail payload up one level        
        const event = new CustomEvent('itemdrop', {
            detail: {
                groupId: 'noGroup',
                groupNumber : 0
            }
        });
        this.dispatchEvent(event);

        this.removeDragOverStyle();
 
    }

}