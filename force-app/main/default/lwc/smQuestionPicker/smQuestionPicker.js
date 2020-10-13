import { LightningElement, track, wire } from 'lwc';
import resetAllQuestionsNew from '@salesforce/apex/QuestionController.resetAllQuestionsNew';
import getQuestionSetData from '@salesforce/apex/QuestionController.getQuestionSetData';
import updateQuestionSetData from '@salesforce/apex/QuestionController.updateQuestionSetData';
import { updateRecord} from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { GroupContentItem, TYPE_GAP, TYPE_QUESTION } from 'c/groupContentItem';

//The fields required for the update of the Drag target record
import FIELD_QUESTION_ID from '@salesforce/schema/SM_QuestionSetQuestion__c.Id';
import FIELD_QUESTION_GROUP_ID from '@salesforce/schema/SM_QuestionSetQuestion__c.Group__c';

//Constants for the status picklist
const GROUP_NONE = undefined;

export default class SmQuestionPicker extends LightningElement {

    //A list of all cases for all status
    @track questionListAll;

    //Filtered arrays
    @track questionListNoGroup;
    @track groupNone = GROUP_NONE;
    
    //Vars to track the DRAG COURSE data
    @track draggingId = "";
    @track draggingGroupId = "";

    /*
    [ // sorted by groupNo
        {
            group : {the group},
            content : [array of gaps and questions] // sorted by question number
        }
        .
        .
        .
    ]
    */
   @track questionGroups;
   @track questionSetData;

    initializeGroups(data) {
        this.questionListNoGroup = {
            content : [
                { 
                    gapNumber : 0, 
                    layoutKey : 'G-0-0',
                    isQuestion : false
                } 
            ]
        };
        this.questionGroups = [];
        data.forEach( nextItem => {
            this.questionGroups.push(
                {
                    group : nextItem,
                    layoutKey : 'GR-' + nextItem.GroupNumber__c,
                    content : [ 
                        { 
                            gapNumber : 0, 
                            layoutKey : 'G-' + nextItem.GroupNumber__c + '-0',
                            isQuestion : false
                        } 
                    ]
                }
            )
        });
    }

    initializeGroupContent(data) {
        this.questionListAll = [];
        let nextGapNumber = 1;
        data.forEach( nextQuestion => {
            this.questionListAll.push(nextQuestion);

            let myGroup = this.questionGroups.find( nextGrp => nextGrp.group.Id === nextQuestion.Group__c);
            if  (!myGroup) { myGroup = this.questionListNoGroup; }
            myGroup.content.push({
                layoutKey : 'Q-' + myGroup.GroupNumber__c + '-' + nextQuestion.QuestionNumber__c + '-' + nextQuestion.Id, 
                question : nextQuestion,
                isQuestion : true 
            });
            myGroup.content.push({
                gapNumber : nextGapNumber,
                layoutKey : 'G-' + myGroup.GroupNumber__c + '-' + nextGapNumber,
                isQuestion : false 
            });
            nextGapNumber++;
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

    reorderAfterDrop(draggedItem, newGroupNumber, gapNumber) {
        let groupsWithNewOrderOfQuestions = [];
        // care for the case when a question is dropped into the orphan (no group) list
        if (newGroupNumber === 0) {
            groupsWithNewOrderOfQuestions.push({
                content : [ draggedItem ]
            });
        }

        this.questionGroups.forEach(nextGroup => {
            let currentContent = [];
            groupsWithNewOrderOfQuestions.push( {
                group : nextGroup.group,
                content : currentContent
            });
            nextGroup.content.forEach(nextContentItem => {
                if (nextContentItem.isQuestion) {
                    if (nextContentItem.question.Id !== draggedItem.Id) {
                        // this is just another question, so insert
                        currentContent.push(nextContentItem.question);
                    }
                    // otherwise do not insert; this is the question we're dragging
                }
                else { // then it's a gap
                    if (nextGroup.group.GroupNumber__c === newGroupNumber && nextContentItem.gapNumber === gapNumber) {
                        // insert the dragged question here
                        currentContent.push(draggedItem);
                    }

                }
            })
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
    handleItemDrop(evt) {

        //Set the DRAG SOURCE Id and new DROP TARGET Status for the update
        let draggedId = this.draggingId;
        let draggedItem = this.questionListAll.find( item => item.Id === this.draggingId );
        let newGroupId = evt.detail.groupId;
        let newGroupNumber = evt.detail.groupNumber;
        let gapNumber = evt.detail.gapNumber;
        
        console.log('Dropped - Id is: ' + draggedId);
        console.log('newGroupNumber is ' + newGroupNumber + ', gapNumber is ' + gapNumber);

        if (newGroupId == this.groupNone) {
                   
            //Don't allow any record to be assigned to the New list
            this.showToast(this,'Drop Not Allowed','Question may not be reset as new!', 'error');

        }
        else {
            let parameter = this.createApexMethodParameter(this.reorderAfterDrop(draggedItem, newGroupNumber, gapNumber));
            let theRequest = {
                updateRequests : parameter
            }
            updateQuestionSetData({ request : theRequest})
                .then( () => {
                    refreshApex(this.questionSetData);
                });
                /*
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
            */
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