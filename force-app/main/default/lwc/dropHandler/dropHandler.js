import QuestionUpdateReq from 'c/questionUpdateReq';

export default class DropHandler {

    createQuestionUpdateRequestsParameter(questionListNoGroup, groupsWithQuestions) {
        let parameter = [];

        questionListNoGroup.content.forEach(nextItem => {
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