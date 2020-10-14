import { LightningElement, api } from 'lwc';

export default class SmDraggableRecordContainer extends LightningElement {
    @api theRecord;

    //DRAG SOURCE dragstart event handler
    itemDragStart(evt) {

        console.log('Handling DragStart for item: ' + this.theRecord.Id);

        //Fetch the element to set the style
        let draggableElement = this.template.querySelector('[data-id="' + this.theRecord.Id + '"]');
        draggableElement.classList.add('drag');
        
        //Dispatch the custom event and pass the record Id and Status
        const event = new CustomEvent('itemdrag', {
            detail: {
                dragTargetId: this.theRecord.Id,
            }
        });
        this.dispatchEvent(event);
    }

    //DRAG SOURCE dragend event handler
    itemDragEnd(evt) {

        console.log('Handling DragEnd for item: ' + this.theRecord.Id);
 
        //Reset the style
        let draggableElement = this.template.querySelector('[data-id="' + this.theRecord.Id + '"]');
        draggableElement.classList.remove('drag');
    }   

}