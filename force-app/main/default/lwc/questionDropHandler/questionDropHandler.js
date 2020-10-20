import updateQuestionSetData from '@salesforce/apex/QuestionController.updateQuestionSetData';
import { refreshApex } from '@salesforce/apex';
import GroupItemModel from 'c/groupItemModel';
import QuestionItemModel from 'c/questionItemModel';

import DropHandler from 'c/dropHandler';

export default class QuestionDropHandler extends DropHandler {
    questionSetData;
    questionListNoGroup;
    questionGroups;

    constructor(questionSetData, questionListNoGroup, questionGroups) {
        super();
        this.questionSetData = questionSetData;
        this.questionListNoGroup = questionListNoGroup;
        this.questionGroups = questionGroups;
    }

    //Handle the custom event dispatched from a DROP TARGET     
    handleQuestionItemDrop(evt, draggedItem) {

        let newGroupNumber = evt.detail.groupNumber;
        let gapNumber = evt.detail.gapNumber;
        console.log('newGroupNumber is ' + newGroupNumber + ', gapNumber is ' + gapNumber);

        // pass in the dragged question
        let newOrder = this.reorderAfterDrop(draggedItem, newGroupNumber, gapNumber);
        let theRequest = {
            updateRequests : this.createQuestionUpdateRequestsParameter(this.questionListNoGroup, newOrder)
        }
        updateQuestionSetData({ request : theRequest})
            .then( () => {
                refreshApex(this.questionSetData);
            });
    }

    /* "private" functions */
    reorderAfterDrop(draggedItem, newGroupNumber, gapNumber) {
        let groupsWithNewOrderOfQuestions = [];

        // care for the case when a question is dropped into the orphan (no group) list
        if (newGroupNumber === 0) {
            this.questionListNoGroup.content.push(new QuestionItemModel(newGroupNumber, draggedItem));
        }

        // if we're dragging an orphan question
        if (!draggedItem.Group__c) {
            // remove it from the orphan group
            let indexOfDraggedItem = this.questionListNoGroup.content.findIndex(item => (!item.isGap && item.question.Id === draggedItem.Id));
            this.questionListNoGroup.content.splice(indexOfDraggedItem, 1);
        }

        this.questionGroups.forEach(nextItem => {
            // skip if it's a gap
            if (!nextItem.isGap) {
                let currentContent = [];
                groupsWithNewOrderOfQuestions.push(new GroupItemModel(nextItem.group, currentContent));
                nextItem.content.forEach(nextContentItem => {
                    if (nextContentItem.isGap) {
                        if (nextItem.group.GroupNumber__c === newGroupNumber && nextContentItem.gapNumber === gapNumber) {
                            // insert the dragged question here
                            currentContent.push(new QuestionItemModel(newGroupNumber, draggedItem));
                        }
                    }
                    else { // then it's a question
                        if (nextContentItem.question.Id !== draggedItem.Id) {
                            // this is just another question, so insert
                            currentContent.push(nextContentItem);
                        }
                        // otherwise do not insert; this is the question we're dragging
                    }
                })
            }
        })
        return groupsWithNewOrderOfQuestions;
    }

}