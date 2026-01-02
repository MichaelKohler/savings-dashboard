import { login, logoutAction } from "./auth";
import {
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "./accounts";
import {
  createBalanceAction,
  updateBalanceAction,
  deleteBalanceAction,
} from "./balances";
import {
  createGroupAction,
  updateGroupAction,
  deleteGroupAction,
} from "./groups";
import { createTypeAction, updateTypeAction, deleteTypeAction } from "./types";

export const server = {
  login,
  logout: logoutAction,
  createAccount: createAccountAction,
  updateAccount: updateAccountAction,
  deleteAccount: deleteAccountAction,
  createBalance: createBalanceAction,
  updateBalance: updateBalanceAction,
  deleteBalance: deleteBalanceAction,
  createGroup: createGroupAction,
  updateGroup: updateGroupAction,
  deleteGroup: deleteGroupAction,
  createType: createTypeAction,
  updateType: updateTypeAction,
  deleteType: deleteTypeAction,
};
