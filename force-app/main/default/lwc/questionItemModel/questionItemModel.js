import LayoutItemModel from 'c/layoutItemModel';

export default class QuestionItemModel extends LayoutItemModel {
    
    // an instance of SM_QuestionSetQuestion__c
    question;

    constructor(groupNumber, question) {
        super('Q-' + groupNumber + '-' + question.QuestionNumber__c + '-' + question.Id);
        this.question = question;
    }
}