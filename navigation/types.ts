export type RootStackParamList = {
  Home: undefined;

  CreateGroup: undefined;

  GroupDetails: {
    groupId: string;
  };

  AddMember: {
    groupId: string;
  };

  AddExpense: {
    groupId: string;
  };

  DivideResult: {
    expenseId: string;
  };

  Payments: {
    groupId: string;
  };

  History: {
    groupId: string;
  };
};