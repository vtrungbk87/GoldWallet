import { Wallet } from 'app/consts';

export enum WalletsAction {
  LoadWallets = 'LoadWallets',
  UpdateWallet = 'UpdateWallet',
}

export interface LoadWalletsAction {
  type: WalletsAction.LoadWallets;
  wallets: Wallet[];
}

export interface UpdateWalletAction {
  type: WalletsAction.UpdateWallet;
  wallet: Wallet;
}

export type WalletsActionType = LoadWalletsAction | UpdateWalletAction;

export const loadWallets = (wallets: Wallet[]): LoadWalletsAction => ({
  type: WalletsAction.LoadWallets,
  wallets,
});

export const updateWallet = (wallet: Wallet): UpdateWalletAction => ({
  type: WalletsAction.UpdateWallet,
  wallet,
});
