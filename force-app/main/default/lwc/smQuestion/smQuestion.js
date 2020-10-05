import { LightningElement, api } from 'lwc';

export default class SmQuestionItem extends LightningElement {
    @api smQuestionRecord;

    //Property to track the original status of the DRAG target
    originalGroupId;

    //DRAG SOURCE dragstart event handler
    itemDragStart(evt) {

        console.log('Handling DragStart for item: ' + this.smQuestionRecord.Id);

        //Store the original status
        this.originalGroupId = this.smQuestionRecord.Group__c;
       
        //Fetch the element to set the style
        let draggableElement = this.template.querySelector('[data-id="' + this.smQuestionRecord.Id + '"]');
        draggableElement.classList.add('drag');
        
        //Dispatch the custom event and pass the record Id and Status
        const event = new CustomEvent('itemdrag', {
            detail: {
                dragTargetId: this.smQuestionRecord.Id,
                dragTargetGroupId: this.originalGroupId 
            }
        });
        this.dispatchEvent(event);
    }

    //DRAG SOURCE dragend event handler
    itemDragEnd(evt) {

        console.log('Handling DragEnd for item: ' + this.smQuestionRecord.Id);
 
        //Reset the style
        let draggableElement = this.template.querySelector('[data-id="' + this.smQuestionRecord.Id + '"]');
        draggableElement.classList.remove('drag');
    }   

}