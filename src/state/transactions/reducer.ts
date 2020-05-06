import { Transaction } from 'app/consts';

import { TransactionsAction, TransactionsActionType } from './actions';

export interface TransactionsState {
  transactions: Record<string, Transaction>;
  // TODO rename old transactions to transactionNotes
  transactionList: Transaction[];
}

const initialState: TransactionsState = {
  transactions: {},
  transactionList: [],
};

export const transactionsReducer = (state = initialState, action: TransactionsActionType): TransactionsState => {
  switch (action.type) {
    case TransactionsAction.LoadTransactions:
      return {
        ...state,
        transactionList: action.transactions,
      };
    case TransactionsAction.CreateTransaction:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.transaction.txid]: action.transaction,
        },
      };
    case TransactionsAction.UpdateTransaction:
      return {
        ...state,
        transactions: {
          ...state.transactions,
          [action.transaction.txid]: action.transaction,
        },
      };
    case TransactionsAction.DeleteTransaction:
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.transaction.txid]: deleted, ...transactions } = state.transactions;
      return {
        ...state,
        transactions,
      };
    default:
      return state;
  }
};
