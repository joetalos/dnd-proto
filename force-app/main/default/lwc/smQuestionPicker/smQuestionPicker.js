import { LightningElement, track, wire } from 'lwc';
import getQuestionSetData from '@salesforce/apex/QuestionController.getQuestionSetData';
import { refreshApex } from '@salesforce/apex';
import GapItemModel from 'c/gapItemModel';
import GroupItemModel from 'c/groupItemModel';
import QuestionItemModel from 'c/questionItemModel';
import QuestionGapItemModel from 'c/questionGapItemModel';
import GroupDropHandler from 'c/groupDropHandler';
import QuestionDropHandler from 'c/questionDropHandler';

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

    resetDraggingBuffers() {
        this.draggingQuestion = "";
        this.draggingGroup = "";
    }

    //Handle the custom event dispatched from a DROP TARGET     
    handleQuestionItemDrop(evt) {
        console.log('Dropped - questionId is: ' + this.draggingQuestion.Id);

        // only if we're dragging a Question
        if (this.draggingQuestion) {
            let dropHandler = new QuestionDropHandler(this.questionSetData, this.questionListNoGroup, this.questionGroups);
            dropHandler.handleQuestionItemDrop(evt, this.draggingQuestion);
        }
        this.resetDraggingBuffers();
    }

    handleGroupGapDrop(evt) {
        console.log('Dropped - groupId is: ' + this.draggingGroup.group.Id);

        if (!this.draggingQuestion) { // if we're only dragging a group!!!
            let dropHandler = new GroupDropHandler(this.questionSetData, this.questionListNoGroup, this.questionGroups);
            dropHandler.handleGroupGapDrop(evt, this.draggingGroup);
        }
        this.resetDraggingBuffers();
    }
}