import { LightningElement, track, wire } from 'lwc';
import getQuestionSetData from '@salesforce/apex/QuestionController.getQuestionSetData';
import updateQuestionSetData from '@salesforce/apex/QuestionController.updateQuestionSetData';
import updateGroupSetData from '@salesforce/apex/QuestionController.updateGroupSetData';
import { refreshApex } from '@salesforce/apex';
import SmGroupGap from 'c/smGroupGap';
import GapItemModel from 'c/gapItemModel';
import GroupItemModel from 'c/groupItemModel';
import QuestionItemModel from 'c/questionItemModel';
import QuestionGapItemModel from 'c/questionGapItemModel';
import GroupUpdateReq from 'c/groupUpdateReq';

//Constants for the status picklist
const GROUP_NONE = undefined;

export default class SmQuestionPicker extends LightningElement {

    // cache to search on the question after dropping
    @track questionListAll;

    //Filtered arrays
    @track questionListNoGroup;
    @track groupNone = GROUP_NONE;
    
    @track draggingQuestion = "";
    @track draggingGroup = "";

    /*
    [ // sorted by groupNo
        {
            group : {the group},
            content : [array of gaps and questions] // sorted by question number
        }
        .
        .
        .
        OR
        {
            gapNumber : <a number>
        }
    ]
    */
   @track questionGroups;
   @track questionSetData;

    initializeGroups(data) {
        this.questionListNoGroup = new GroupItemModel({ Id : 0, GroupNumber__c : 0}, [new QuestionGapItemModel(0, 0)]);

        // one item representing the gap between the "no group"-group and the first group
        this.questionGroups = [new GapItemModel(0)];
        data.forEach( nextItem => {
            // one item representing the group
            this.questionGroups.push(
                new GroupItemModel(nextItem, [new QuestionGapItemModel(nextItem.GroupNumber__c, 0)])
            );
            // one item representing the gap after the group
            this.questionGroups.push(
                // can use the groupNumber here, because it starts from one, and the collection we're processing is ordered
                new GapItemModel(nextItem.GroupNumber__c)
            );
        });
    }

    initializeGroupContent(data) {
        this.questionListAll = [];
        let nextGapNumber = 1;
        data.forEach( nextQuestion => {
            this.questionListAll.push(nextQuestion);

            let myGroup = this.questionGroups.find( nextGrp => (nextGrp instanceof GroupItemModel && nextGrp.group.Id === nextQuestion.Group__c));
            if  (!myGroup) { myGroup = this.questionListNoGroup; }
            myGroup.content.push(
                new QuestionItemModel(myGroup.GroupNumber__c, nextQuestion)
            );
            myGroup.content.push(
                new QuestionGapItemModel(myGroup.GroupNumber__c, nextGapNumber++)
            );
        })
    }

    @wire( getQuestionSetData )
    wired_getQuestionSetData(result) {
        this.questionSetData = result;
        if (this.questionSetData.data) {
            if (this.questionSetData.data.Question_Set_Groups__r) {
                this.initializeGroups(this.questionSetData.data.Question_Set_Groups__r);
            }
            if (this.questionSetData.data.Question_Set_Questions__r) {
                this.initializeGroupContent(this.questionSetData.data.Question_Set_Questions__r);
            }
        }
    }

    //Getter indicates if any items in the list
    get areGroups() {
        if(this.questionGroups) {
           return this.questionGroups.length > 0;
        } else {
           return false; 
        }
    }
    
    //Manually refresh the data and the reactive DROP TARGET lists 
    refreshData() {
        refreshApex(this.questionGroups);
    }

    // Handle the custom event dispatched originally from a DRAG SOURCE 
    // and proxied from a DROP TARGET
    handleItemDrag(evt) {

        let draggingItem = this.questionListAll.find(nextItem => nextItem.Id === evt.detail.dragTargetId);
        if (draggingItem) {
            console.log('Setting draggingQuestion to: ' + evt.detail.dragTargetId);
            this.draggingQuestion = draggingItem;
        }
        else {
            draggingItem = this.questionGroups.find(nextItem => (nextItem instanceof GroupItemModel && nextItem.group.Id === evt.detail.dragTargetId));

            console.log('Setting draggingGroup to: ' + evt.detail.dragTargetId);
            this.draggingGroup = draggingItem;
        }
    }

    reorderAfterDrop(draggedItem, newGroupNumber, gapNumber) {
        let groupsWithNewOrderOfQuestions = [];
        // care for the case when a question is dropped into the orphan (no group) list
        if (newGroupNumber === 0) {
            groupsWithNewOrderOfQuestions.push({
                content : [ draggedItem ]
            });
        }

        this.questionGroups.forEach(nextGroup => {
            // skip if it's a gap
            if (nextGroup instanceof GroupItemModel) {
                let currentContent = [];
                groupsWithNewOrderOfQuestions.push( {
                    group : nextGroup.group,
                    content : currentContent
                });
                nextGroup.content.forEach(nextContentItem => {
                    if (nextContentItem.isGap) {
                        if (nextGroup.group.GroupNumber__c === newGroupNumber && nextContentItem.gapNumber === gapNumber) {
                            // insert the dragged question here
                            currentContent.push(draggedItem);
                        }
                    }
                    else { // then it's a question
                        if (nextContentItem.question.Id !== draggedItem.Id) {
                            // this is just another question, so insert
                            currentContent.push(nextContentItem.question);
                        }
                        // otherwise do not insert; this is the question we're dragging
                }
                })
            }
        })
        return groupsWithNewOrderOfQuestions;
    }

    createApexMethodParameter(groupsWithQuestions) {
        let parameter = [];
        let nextQuestionNumber = 1;
        groupsWithQuestions.forEach(nextGroup => {
            if (!nextGroup.group) {
                let newlyOrphanedQuestion = nextGroup.content[0];
                parameter.push({
                    questionId : newlyOrphanedQuestion.Id,
                    questionNumber : 0
                });
            }
            else {
                nextGroup.content.forEach( nextQuestion => {
                    parameter.push({
                        questionId : nextQuestion.Id,
                        questionNumber : nextQuestionNumber++,
                        groupId : nextGroup.group.Id
                    })
                })
            }
        })
        return parameter;
    }

    //Handle the custom event dispatched from a DROP TARGET     
    handleQuestionItemDrop(evt) {

        console.log('Dropped - Id is: ' + this.draggingQuestion.Id);

        // only if we're dragging a Question
        if (this.draggingQuestion) {
            let newGroupNumber = evt.detail.groupNumber;
            let gapNumber = evt.detail.gapNumber;
            console.log('newGroupNumber is ' + newGroupNumber + ', gapNumber is ' + gapNumber);

            // pass in the dragged question
            let parameter = this.createApexMethodParameter(this.reorderAfterDrop(this.draggingQuestion, newGroupNumber, gapNumber));
            let theRequest = {
                updateRequests : parameter
            }
            updateQuestionSetData({ request : theRequest})
                .then( () => {
                    refreshApex(this.questionSetData);
                });
        }
        this.resetDraggingBuffers();
    }

    resetDraggingBuffers() {
        this.draggingQuestion = "";
        this.draggingGroup = "";
    }

    handleGroupGapDrop(evt) {

        console.log('Dropped - groupId is: ' + this.draggingGroup.group.Id);

        if (!this.draggingQuestion) { // if we're only dragging a group!!!
            // get the dragged item (in this case the group)
            let draggedItem = this.draggingGroup;

            // the number of groupgap the group has been dropped into:
            let newGapNumber = evt.detail.gapNumber;
            console.log('newGapNumber is ' + newGapNumber);

            let groupsWithNewOrder = [];

            this.questionGroups.forEach(nextItem => {
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

            let parameter = this.createApexMethodParameter2(groupsWithNewOrder);

            let theRequest = {
                groupUpdateRequests : parameter
            }
            updateGroupSetData({ request : theRequest})
                .then( () => {
                    refreshApex(this.questionSetData);
                });
        }
        this.resetDraggingBuffers();
   }

   createApexMethodParameter2(groupsWithQuestions) {
        let parameter = [];
        let nextGroupNumber = 1;
        let nextQuestionNumber = 1;
        groupsWithQuestions.forEach(nextGroup => {
            parameter.push(new GroupUpdateReq(nextGroup.group.Id, nextGroupNumber++));
        });
        return parameter;
    }

}