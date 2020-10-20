import { refreshApex } from '@salesforce/apex';
import updateGroupSetData from '@salesforce/apex/QuestionController.updateGroupSetData';
import GroupUpdateReq from 'c/groupUpdateReq';
import DropHandler from 'c/dropHandler';

export default class GroupDropHandler extends DropHandler {
    questionSetData;
    questionListNoGroup;
    questionGroups;

    /* "interface" */
    constructor(questionSetData, questionListNoGroup, questionGroups) {
        super();
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
            updateRequests : this.createQuestionUpdateRequestsParameter(this.questionListNoGroup, groupsWithNewOrder)
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

}