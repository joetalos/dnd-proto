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
}

