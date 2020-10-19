export default class QuestionUpdateReq {
    questionId;
    questionNumber;
    groupId;

    constructor(questionId, questionNumber, groupId) {
        this.questionId = questionId;
        this.questionNumber = questionNumber;
        this.groupId = groupId;
    }
}