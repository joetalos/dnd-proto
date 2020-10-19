
export default class LayoutItemModel {

    // a string
    mlayoutKey;

    get layoutKey() {
        return this.mlayoutKey; 
    }
    set layoutKey(value) {
        this.mlayoutKey = value;
    }

    constructor(layoutKey) {
        this.mlayoutKey = layoutKey;
    }

    get isGap() { return false; }
}