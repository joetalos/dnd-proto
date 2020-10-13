public with sharing class QuestionDndUpdateRequest {
    public class QuestionUpdateReq {
        @AuraEnabled
        public String questionId { get; set; }
        @AuraEnabled
        public Integer questionNumber { get; set; }
        @AuraEnabled
        public String groupId { get; set; }
    }

    @AuraEnabled
    public List<QuestionUpdateReq> updateRequests { get; set; }
}
