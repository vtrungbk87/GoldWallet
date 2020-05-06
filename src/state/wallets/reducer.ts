import { Wallet } from 'app/consts';

import { WalletsAction, WalletsActionType } from './actions';

export interface WalletsState {
  wallets: Wallet[];
  isLoading: boolean;
}

const initialState: WalletsState = {
  wallets: [],
  isLoading: true,
};

export const walletsReducer = (state = initialState, action: WalletsActionType): WalletsState => {
  switch (action.type) {
    case WalletsAction.LoadWallets:
      return {
        wallets: action.wallets,
        isLoading: false,
      };
    case WalletsAction.UpdateWallet:
      return {
        ...state,
        wallets: state.wallets.map(wallet => (wallet !== action.wallet ? wallet : action.wallet)),
      };
    default:
      return state;
  }
};
