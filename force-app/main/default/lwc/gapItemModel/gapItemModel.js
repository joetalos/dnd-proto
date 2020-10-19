import LayoutItemModel from 'c/layoutItemModel';

export default class GapItemModel extends LayoutItemModel {

    // an integer
    gapNumber;

    constructor(gapNumber) {
        super('GAP-' + gapNumber);
        this.gapNumber = gapNumber;
    }

    get isGap() { return true; }

}