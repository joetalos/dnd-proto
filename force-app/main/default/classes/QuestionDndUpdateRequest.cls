public with sharing class QuestionDndUpdateRequest {
    public class QuestionUpdateReq {
        @AuraEnabled
        public String questionId { get; set; }
        @AuraEnabled
        public Integer questionNumber { get; set; }
        @AuraEnabled
        public String groupId { get; set; }
    }

    public class GroupUpdateReq {
        @AuraEnabled
        public String groupId { get; set; }
        @AuraEnabled
        public Integer groupNumber { get; set; }
    }

    @AuraEnabled
    public List<QuestionUpdateReq> updateRequests { get; set; }

    @AuraEnabled
    public List<GroupUpdateReq> groupUpdateRequests { get; set; }
}
