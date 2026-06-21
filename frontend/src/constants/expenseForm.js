export const INITIAL_EXPENSE_FORM = {
  Name: '',
  Amount__c: '',
  Category__c: '',
  Date__c: new Date().toISOString().split('T')[0],
  Is_Recurring__c: false,
};
