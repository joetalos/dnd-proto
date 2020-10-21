public without sharing class QuestionController {

    //Fetch all Questions
    @AuraEnabled(cacheable=true)
    public static List<SM_QuestionSetQuestion__c> getAllQuestions() {
        string query = 'SELECT Id, Name, QuestionNumber__c, Group__c, Group__r.Name FROM SM_QuestionSetQuestion__c';
		return Database.query(query);
    }

    //Fetch all QuestionGroups
    @AuraEnabled(cacheable=true)
    public static List<SM_QuestionSetGroup__c> getAllQuestionGroups() {
        string query = 'SELECT Id, Name, GroupNumber__c FROM SM_QuestionSetGroup__c ORDER BY GroupNumber__c ASC';
		return Database.query(query);
    }

    //Reset all Questions to New status
    @AuraEnabled
    public static void resetAllQuestionsNew() {
      list<SM_QuestionSetQuestion__c> allQuestions = [SELECT Id, Name, QuestionNumber__c, Group__c FROM SM_QuestionSetQuestion__c];
      for (SM_QuestionSetQuestion__c q : allQuestions) {
        q.Group__c = null;
      }
		  Database.update(allQuestions);
    }

    @AuraEnabled(cacheable=true)
    public static SM_QuestionSet__c getQuestionSetData() {
        string query = 
            'SELECT Id, Name, ' +
              '(SELECT Id, Name, GroupNumber__c FROM Question_Set_Groups__r ORDER BY GroupNumber__c), ' +
              '(SELECT Id, Name, QuestionNumber__c, Group__c FROM Question_Set_Questions__r ORDER BY QuestionNumber__c) ' +
            'FROM SM_QuestionSet__c ' +
            'WHERE Id = \'a023D000004aGIiQAM\'';
        return Database.query(query);
    }

    private static List<SM_QuestionSetQuestion__c> createQuestionUpdateArray(QuestionDndUpdateRequest request) {
      List<SM_QuestionSetQuestion__c> questionsToUpdate = new List<SM_QuestionSetQuestion__c>();
      if (request.updateRequests != null) {
        for (QuestionDndUpdateRequest.QuestionUpdateReq nextReq : request.updateRequests) {
          SM_QuestionSetQuestion__c qToUpdate = new SM_QuestionSetQuestion__c(
            Id = nextReq.questionId,
            QuestionNumber__c = nextReq.questionNumber,
            Group__c = nextReq.groupId
          );
          questionsToUpdate.add(qToUpdate);
        }
      }
      return questionsToUpdate;
    }

    private static List<SM_QuestionSetGroup__c> createGroupUpdateArray(QuestionDndUpdateRequest request) {
      List<SM_QuestionSetGroup__c	> groupsToUpdate = new List<SM_QuestionSetGroup__c	>();
      if (request.groupUpdateRequests != null) {
        for (QuestionDndUpdateRequest.GroupUpdateReq nextReq : request.groupUpdateRequests) {
          SM_QuestionSetGroup__c grToUpdate = new SM_QuestionSetGroup__c	(
            Id = nextReq.groupId,
            GroupNumber__c = nextReq.groupNumber
          );
          groupsToUpdate.add(grToUpdate);
        }
      }
      return groupsToUpdate;
    }

    @AuraEnabled
    public static SM_QuestionSet__c updateGroupSetData(QuestionDndUpdateRequest request) {
      List<SM_QuestionSetGroup__c	> groupsToUpdate = createGroupUpdateArray(request);
      List<SM_QuestionSetQuestion__c> questionsToUpdate = createQuestionUpdateArray(request);

      Savepoint sp = Database.setSavepoint();

      try {
        update questionsToUpdate;
        update groupsToUpdate;
      }
      catch (Exception  e) {
        Database.rollback(sp);
      }

      return getQuestionSetData();
    }
}

