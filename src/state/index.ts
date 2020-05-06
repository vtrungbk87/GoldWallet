import { combineReducers } from 'redux';

import { contactsReducer, ContactsState } from './contacts/reducer';
import { transactionsReducer, TransactionsState } from './transactions/reducer';
import { WalletsState, walletsReducer } from './wallets/reducer';

export interface ApplicationState {
  contacts: ContactsState;
  transactions: TransactionsState;
  wallets: WalletsState;
}

export const rootReducer = combineReducers({
  contacts: contactsReducer,
  transactions: transactionsReducer,
  wallets: walletsReducer,
});
