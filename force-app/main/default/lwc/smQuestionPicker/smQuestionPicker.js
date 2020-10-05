import { LightningElement, track, wire } from 'lwc';
import getAllQuestions from '@salesforce/apex/QuestionController.getAllQuestions';
import getQuestionGroups from '@salesforce/apex/QuestionController.getAllQuestionGroups';
import resetAllQuestionsNew from '@salesforce/apex/QuestionController.resetAllQuestionsNew';
import getQuestionSetData from '@salesforce/apex/QuestionController.getQuestionSetData';
import { updateRecord} from 'lightning/uiRecordApi';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

//The fields required for the update of the Drag target record
import FIELD_QUESTION_ID from '@salesforce/schema/SM_QuestionSetQuestion__c.Id';
import FIELD_QUESTION_GROUP_ID from '@salesforce/schema/SM_QuestionSetQuestion__c.Group__c';

//Constants for the status picklist
const GROUP_NONE = undefined;
const GROUP_FIRST = 'a003D000003PWyyQAG';
const GROUP_SECOND = 'a003D000003PWz8QAG';
const KEY_GROUP = 'group';
const KEY_QUESTIONS = 'questions';

export default class SmQuestionPicker extends LightningElement {

    //A list of all cases for all status
    @track questionListAll;

    //Filtered arrays
    @track questionListNoGroup; 
    @track questionListFirstGroup; 
    @track questionListSecondGroup;

    //Status values for the lists
    @track groupNone = GROUP_NONE;
    @track groupFirst = GROUP_FIRST;
    @track groupSecond = GROUP_SECOND;
    
    //Vars to track the DRAG COURSE data
    @track draggingId = "";
    @track draggingGroupId = "";

    /*
    [ // sorted by groupNo
        {
            group : {the group},
            questions : [array of questions] // sorted by question number
        }
        .
        .
        .
    ]
    */
   @track questionGroups;
   @track questionSetData;

    initializeGroups(data) {
        this.questionGroups = [];
        data.forEach( nextItem => {
            this.questionGroups.push(
                {
                    group : nextItem,
                    spaceKey : nextItem.Id + '-space',
                    questions : []
                }
            )
        });
    }

    initializeQuestions(data) {
        data.forEach( nextQuestion => {
            let myGroup = this.questionGroups.find( nextGrp => nextGrp.group.Id === nextQuestion.Group__c);
            if (myGroup) {
                myGroup.questions.push(nextQuestion);
            };
        })
    }

    //
    @wire( getQuestionSetData )
    wired_getQuestionSetData(result) {
        this.questionSetData = result;
        if (this.questionSetData.data) {
            if (this.questionSetData.data.Question_Set_Groups__r) {
                this.initializeGroups(this.questionSetData.data.Question_Set_Groups__r);
            }
            if (this.questionSetData.data.Question_Set_Questions__r) {
                this.initializeQuestions(this.questionSetData.data.Question_Set_Questions__r);
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
    
    //Manually reset all Cases to New    
    resetData() {
        resetAllQuestionsNew()
        .then( () => {
            this.refreshData();
        })
        .catch(error => {
            //Notify any error
            this.showToast(this,'Error Resetting Data', error.body.message, 'error');
        });
    }   

    //Manually refresh the data and the reactive DROP TARGET lists 
    refreshData() {
        refreshApex(this.questionGroups);
    }

    //Handle the custom event dispatched originally from a DRAG SOURCE 
    //and proxied from a DROP TARGET
    handleListItemDrag(evt) {

        console.log('Setting draggingId to: ' + evt.detail);

        //Capture the detail passed with the event from the DRAG target
        this.draggingId = evt.detail.dragTargetId;
        this.draggingGroupId = evt.detail.dragTargetGroupId;

    }

    //Handle the custom event dispatched from a DROP TARGET     
    handleItemDrop(evt) {

        //Set the DRAG SOURCE Id and new DROP TARGET Status for the update
        let draggedId = this.draggingId;
        let updatedGroupId = evt.detail;
        
        console.log('Dropped - Id is: ' + draggedId + ', new groupId is ' + updatedGroupId);

        //Handle custom validations before allowing an update
        if (updatedGroupId === this.draggingGroupId) {

            //DO NOTHING if the DRAG status is NOT the DROP target Status

        } else if (updatedGroupId == this.groupNone) { 
                   
            //Don't allow any record to be assigned to the New list
            this.showToast(this,'Drop Not Allowed','Case may not be reset as New!', 'error');

        } else {

            //Update the DRAG SOURCE record with its new status    
            let fieldsToSave = {};
            fieldsToSave[FIELD_QUESTION_ID.fieldApiName] = draggedId;
            fieldsToSave[FIELD_QUESTION_GROUP_ID.fieldApiName] = updatedGroupId;
            const recordInput = { fields:fieldsToSave }

            updateRecord(recordInput)
            .then(() => {
                refreshApex(this.questionSetData);
            })
            .catch(error => {
                //Notify any error
                this.showToast(this,'Error Updating Record', error.body.message, 'error');
            });
        }
    }

    //Notification utility function
    showToast = (firingComponent, toastTitle, toastBody, variant)  => {
        const evt = new ShowToastEvent({
            title: toastTitle,
            message: toastBody,
            variant: variant
        });
        firingComponent.dispatchEvent(evt);
    }

}