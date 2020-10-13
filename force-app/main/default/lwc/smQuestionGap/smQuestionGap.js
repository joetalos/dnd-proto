import { LightningElement, api } from 'lwc';

export default class SmQuestionGap extends LightningElement {
    @api gapNumber;
    @api group;

    getGroupId() {
        return this.group ? this.group.Id : 'none';
    }

    //Function to cancel drag n drop events
    cancel(evt) {
        if (evt.stopPropagation) evt.stopPropagation();
        if (evt.preventDefault) evt.preventDefault();
        return false;
    };

    //DRAG SOURCE drag event handler dispatched from the child component
    handleItemDrag(evt) {
        
        console.log('Drag event from the drag target: ' + evt.detailinto + ' for drop target: group [' + this.getGroupId() + '], question [' + this.gapNumber + ']');
        this.cancel(evt);

        //Dispatch the custom event to raise the detail payload up one level
        const event = new CustomEvent('listitemdrag', {
            detail: evt.detail
        });
        this.dispatchEvent(event);
    }

    //DROP TARGET dragenter event handler
    handleDragEnter(evt) {

        console.log('Drag Enter event for group [' + this.getGroupId() + '], question [' + this.gapNumber + ']');

        //Cancel the event
        this.cancel(evt);

    }

    //DROP TARGET dragover event handler
    handleDragOver(evt) {
        
        console.log('Drag Over event for group [' + this.getGroupId() + '], question [' + this.gapNumber + ']');
        
        //Cancel the event
        this.cancel(evt);

        this.addDragOverStyle()
 
    }

    //DROP TARGET dragleave event handler
    handleDragLeave(evt) {
        
        console.log('Drag Leave event for group [' + this.getGroupId() + '], question [' + this.gapNumber + ']');
        
        //Cancel the event
        this.cancel(evt);
        
        this.removeDragOverStyle();

    }

    //DROP TARGET drop event handler
    handleDrop(evt) {
            
        console.log('Handling Drop into drop tagert for group [' + this.getGroupId() + '], question [' + this.gapNumber + ']');
        
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

    //Set the style to indicate the element is being dragged over
    addDragOverStyle() {
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        draggableElement.classList.add('over');
    }

    //Reset the style
    removeDragOverStyle() {
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        draggableElement.classList.remove('over');
    }
}