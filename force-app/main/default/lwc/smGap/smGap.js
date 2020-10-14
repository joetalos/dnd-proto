import { api } from 'lwc';
import SmDropTarget from 'c/smDropTarget';

export default class SmGap extends SmDropTarget {
    @api gapNumber;

    getTargetLabel() {
        return('gap #' + this.gapNumber);
    }
}