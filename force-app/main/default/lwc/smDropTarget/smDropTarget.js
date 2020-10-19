import { LightningElement } from 'lwc';

export default class SmDropTarget extends LightningElement {

    constructor() {
        super();
    }

    getTargetLabel() { return 'NO LABEL'; }

    //Function to cancel drag n drop events
    cancel(evt) {
        if (evt.stopPropagation) evt.stopPropagation();
        if (evt.preventDefault) evt.preventDefault();
        return false;
    }

    //DROP TARGET dragenter event handler
    handleDragEnter(evt) {

        console.log('DragEnter event for [' + this.getTargetLabel() + ']');

        //Cancel the event
        this.cancel(evt);

    }

    //DROP TARGET dragover event handler
    handleDragOver(evt) {
        
        console.log('DragOver event for [' + this.getTargetLabel() + ']');
        
        //Cancel the event
        this.cancel(evt);

        this.addDragOverStyle()
 
    }

    //DROP TARGET dragleave event handler
    handleDragLeave(evt) {
        
        console.log('Drag Leave event for [' + this.getTargetLabel() + ']');
        
        //Cancel the event
        this.cancel(evt);
        
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