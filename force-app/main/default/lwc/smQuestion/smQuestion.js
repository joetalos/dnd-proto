import { api } from 'lwc';
import SmDraggableRecordContainer from 'c/smDraggableRecordContainer';

export default class SmQuestionItem extends SmDraggableRecordContainer {
    @api get smQuestionRecord() {
        return this.theRecord;
    }
    set smQuestionRecord(value) {
        this.theRecord = value;
    };

}