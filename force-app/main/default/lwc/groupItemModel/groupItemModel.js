import { api } from 'lwc';
import LayoutItemModel from 'c/layoutItemModel';

export default class GroupItemModel extends LayoutItemModel {

    // an instance of SM_QuestionSetGroup__c
    group;

    // an array of GapItemModel's and QuestionItemModel's
    content;

    constructor(group, content) {
        super('GR-' + group.GroupNumber__c);
        this.group = group ;
        this.content = content;
    }
}