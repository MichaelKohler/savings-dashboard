import { vi } from "vitest";

const createMockAction = () =>
  vi.fn().mockResolvedValue({ data: { success: true }, error: undefined });

export const actions = {
  login: createMockAction(),
  logout: createMockAction(),
  createAccount: createMockAction(),
  updateAccount: createMockAction(),
  deleteAccount: createMockAction(),
  createBalance: createMockAction(),
  updateBalance: createMockAction(),
  deleteBalance: createMockAction(),
  createGroup: createMockAction(),
  updateGroup: createMockAction(),
  deleteGroup: createMockAction(),
  createType: createMockAction(),
  updateType: createMockAction(),
  deleteType: createMockAction(),
};

export const isInputError = vi.fn().mockReturnValue(false);
export const isActionError = vi.fn().mockReturnValue(false);

export class ActionError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
  }
}
