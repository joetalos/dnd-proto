import GapItemModel from 'c/gapItemModel';

export default class QuestionGapItemModel extends GapItemModel {

    // any string
    parentId;

    constructor(parentId, gapNumber) {
        super(gapNumber);
        this.layoutKey = 'QGAP-' + parentId + '-' + gapNumber;
        this.parentId = parentId;
    }

}