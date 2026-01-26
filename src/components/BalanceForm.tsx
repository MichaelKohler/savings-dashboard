import { useEffect, useRef, useState } from "react";
import { actions, isInputError } from "astro:actions";
import Button from "~/components/button";
import type { Balance } from "~/models/balances.server";
import type { getAccounts } from "~/models/accounts.server";

type AccountWithGroup = Awaited<ReturnType<typeof getAccounts>>[number];

interface BalanceFormProps {
  balance?: Balance | null;
  accounts: AccountWithGroup[];
}

export default function BalanceForm({ balance, accounts }: BalanceFormProps) {
  const [errors, setErrors] = useState<{
    balance?: string;
    date?: string;
    accountId?: string;
    generic?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const balanceRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const isEdit = !!balance?.id;

  const groupedAccounts = accounts.reduce(
    (acc, account) => {
      const groupName = account.group?.name || "Ungrouped";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(account);
      return acc;
    },
    {} as Record<string, AccountWithGroup[]>
  );

  const sortedGroupNames = Object.keys(groupedAccounts).sort((a, b) => {
    if (a === "Ungrouped") return 1;
    if (b === "Ungrouped") return -1;
    return a.localeCompare(b);
  });

  useEffect(() => {
    if (errors.balance) {
      balanceRef.current?.focus();
    } else if (errors.date) {
      dateRef.current?.focus();
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    if (isEdit && balance?.id) {
      formData.append("balanceId", balance.id);
    }

    const { data, error } = isEdit
      ? await actions.updateBalance(formData)
      : await actions.createBalance(formData);

    if (error) {
      if (isInputError(error)) {
        setErrors(error.fields as typeof errors);
      } else {
        setErrors({ generic: error.message || "Failed to save balance" });
      }

      setIsSubmitting(false);

      return;
    }

    if (data) {
      window.location.href = "/balances";
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Account: </span>
          <select
            name="accountId"
            className="flex-1 rounded-md border-2 border-mk px-3 py-2 leading-loose"
            defaultValue={balance?.accountId || ""}
            required
          >
            <option value="">Select account</option>
            {sortedGroupNames.map((groupName) => (
              <optgroup key={groupName} label={groupName}>
                {groupedAccounts[groupName].map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        {errors.accountId && (
          <div className="pt-1 text-mkerror" id="accountId-error">
            {errors.accountId}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Date: </span>
          <input
            ref={dateRef}
            type="date"
            name="date"
            className="flex-1 rounded-md border-2 border-mk px-3 text-lg leading-loose"
            aria-invalid={errors.date ? true : undefined}
            aria-errormessage={errors.date ? "date-error" : undefined}
            defaultValue={
              balance?.date
                ? new Date(balance.date).toISOString().split("T")[0]
                : ""
            }
            required
          />
        </label>
        {errors.date && (
          <div className="pt-1 text-mkerror" id="date-error">
            {errors.date}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Balance: </span>
          <input
            ref={balanceRef}
            type="text"
            name="balance"
            className="flex-1 rounded-md border-2 border-mk px-3 text-lg leading-loose"
            aria-invalid={errors.balance ? true : undefined}
            aria-errormessage={errors.balance ? "balance-error" : undefined}
            defaultValue={balance?.balance}
            required
          />
        </label>
        {errors.balance && (
          <div className="pt-1 text-mkerror" id="balance-error">
            {errors.balance}
          </div>
        )}
      </div>

      {errors.generic && (
        <div className="pt-1 text-mkerror" id="generic-error">
          {errors.generic}
        </div>
      )}

      <Button isSubmit isDisabled={isSubmitting}>
        {isSubmitting ? (
          <div
            className="spinner-border inline-block h-4 w-4 animate-spin rounded-full border-2"
            role="status"
          ></div>
        ) : (
          "Save"
        )}
      </Button>
    </form>
  );
}
