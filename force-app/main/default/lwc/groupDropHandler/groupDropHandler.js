import { refreshApex } from '@salesforce/apex';
import updateGroupSetData from '@salesforce/apex/QuestionController.updateGroupSetData';
import GroupUpdateReq from 'c/groupUpdateReq';
import QuestionUpdateReq from 'c/questionUpdateReq';

export default class GroupDropHandler {
    questionSetData;
    questionListNoGroup;
    questionGroups;

    /* "interface" */
    constructor(questionSetData, questionListNoGroup, questionGroups) {
        this.questionSetData = questionSetData;
        this.questionListNoGroup = questionListNoGroup;
        this.questionGroups = questionGroups;
    }

    handleGroupGapDrop(evt, draggedItem) {

        // the number of groupgap the group has been dropped into:
        let newGapNumber = evt.detail.gapNumber;
        console.log('newGapNumber is ' + newGapNumber);

        let groupsWithNewOrder = this.reorderEverything(this.questionGroups, newGapNumber, draggedItem);
        let theRequest = {
            groupUpdateRequests : this.createGroupUpdateRequestsParameter(groupsWithNewOrder),
            updateRequests : this.createQuestionUpdateRequestsParameter(groupsWithNewOrder)
        }
        updateGroupSetData({ request : theRequest})
            .then( () => {
                refreshApex(this.questionSetData);
            });
    }

    /* "private" functions */
    reorderEverything(questionGroups, newGapNumber, draggedItem) {
        let groupsWithNewOrder = [];

        questionGroups.forEach(nextItem => {
            if (nextItem.isGap) {
                if (nextItem.gapNumber === newGapNumber) {
                    groupsWithNewOrder.push(draggedItem);
                }
            }
            else {
                if (nextItem.group.Id !== draggedItem.group.Id) {
                    groupsWithNewOrder.push(nextItem);
                }
            }
        });
        return groupsWithNewOrder;
    }

    createGroupUpdateRequestsParameter(groupsWithQuestions) {
        let parameter = [];
        let nextGroupNumber = 1;
        groupsWithQuestions.forEach(nextGroup => {
            parameter.push(new GroupUpdateReq(nextGroup.group.Id, nextGroupNumber++));
        });
        return parameter;
    }

    createQuestionUpdateRequestsParameter(groupsWithQuestions) {
        let parameter = [];

        this.questionListNoGroup.content.forEach(nextItem => {
            if (!nextItem.isGap) {
                parameter.push(new QuestionUpdateReq(nextItem.question.Id, 0)); // make Group__c undefined 
            }
        });

        let nextQuestionNumber = 1;
        groupsWithQuestions.forEach(nextGroup => {
            nextGroup.content.forEach( nextItem => {
                if (!nextItem.isGap) {
                    parameter.push(new QuestionUpdateReq(nextItem.question.Id, nextQuestionNumber++, nextGroup.group.Id));
                }
            })
        })
        return parameter;
    }
}