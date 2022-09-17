import * as React from "react";
import { Form, useActionData, useTransition } from "@remix-run/react";

import Button from "~/components/button";
import type { Account } from "~/models/accounts.server";
import type { Balance } from "~/models/balances.server";

export default function BalanceForm({
  initialData,
  accounts = [],
}: {
  initialData?: Balance & { date: string };
  accounts?: Account[];
}) {
  const actionData = useActionData();
  const transition = useTransition();

  const dateRef = React.useRef<HTMLInputElement>(null);
  const accountRef = React.useRef<HTMLInputElement>(null);
  const balanceRef = React.useRef<HTMLInputElement>(null);

  const isEdit = !!initialData?.id;

  React.useEffect(() => {
    if (actionData?.errors?.date) {
      dateRef.current?.focus();
    } else if (actionData?.errors?.accountId) {
      accountRef.current?.focus();
    } else if (actionData?.errors?.balance) {
      balanceRef.current?.focus();
    }
  }, [actionData]);

  const dateDefaultInput = initialData
    ? initialData?.date.substring(0, 10)
    : "";

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Date: </span>
          <input
            ref={dateRef}
            type="date"
            name="date"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors.date ? true : undefined}
            aria-errormessage={
              actionData?.errors.date ? "date-error" : undefined
            }
            data-testid="new-balance-date-input"
            defaultValue={dateDefaultInput}
          />
        </label>
        {actionData?.errors.date && (
          <div className="pt-1 text-red-700" id="date=error">
            {actionData.errors.date}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Account: </span>
          <select
            name="accountId"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 py-2 leading-loose"
            defaultValue={initialData?.accountId}
          >
            <option value="">Select account</option>
            {accounts?.map((account: Account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        {actionData?.errors.accountId && (
          <div className="pt-1 text-red-700" id="accountId=error">
            {actionData.errors.accountId}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Balance (rounded to the nearest number): </span>
          <input
            ref={balanceRef}
            type="number"
            name="balance"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors.balance ? true : undefined}
            aria-errormessage={
              actionData?.errors.balance ? "balance-error" : undefined
            }
            data-testid="new-account-balance-input"
            defaultValue={initialData?.balance}
          />
        </label>
        {actionData?.errors.balance && (
          <div className="pt-1 text-red-700" id="balance=error">
            {actionData.errors.balance}
          </div>
        )}
      </div>

      {isEdit && <input type="hidden" name="id" value={initialData?.id} />}

      {actionData?.errors.generic && (
        <div className="pt-1 text-red-700" id="generic=error">
          {actionData.errors.generic}
        </div>
      )}

      <Button isSubmit isDisabled={!!transition.submission}>
        {transition.submission ? (
          <div
            className="spinner-border inline-block h-4 w-4 animate-spin rounded-full border-2"
            role="status"
          ></div>
        ) : (
          "Save"
        )}
      </Button>
    </Form>
  );
}
