import { useEffect, useRef, useState } from "react";
import { actions, isInputError } from "astro:actions";
import Button from "~/components/button";
import type { Account } from "~/models/accounts.server";
import type { Group } from "~/models/groups.server";
import type { Type } from "~/models/types.server";

interface AccountFormProps {
  account?: Account | null;
  groups: Group[];
  types: Type[];
}

export default function AccountForm({
  account,
  groups,
  types,
}: AccountFormProps) {
  const [errors, setErrors] = useState<{
    name?: string;
    color?: string;
    generic?: string;
    groupId?: string;
    typeId?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  const isEdit = !!account?.id;

  useEffect(() => {
    if (errors.name) {
      nameRef.current?.focus();
    } else if (errors.color) {
      colorRef.current?.focus();
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    if (isEdit && account?.id) {
      formData.append("accountId", account.id);
    }

    const { data, error } = isEdit
      ? await actions.updateAccount(formData)
      : await actions.createAccount(formData);

    if (error) {
      if (isInputError(error)) {
        setErrors(error.fields as typeof errors);
      } else {
        setErrors({ generic: error.message || "Failed to save account" });
      }

      setIsSubmitting(false);

      return;
    }

    if (data) {
      window.location.href = "/accounts";
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
          <span>Name: </span>
          <input
            ref={nameRef}
            type="text"
            name="name"
            className="flex-1 rounded-md border-2 border-mk px-3 text-lg leading-loose"
            aria-invalid={errors.name ? true : undefined}
            aria-errormessage={errors.name ? "name-error" : undefined}
            data-testid="new-account-name-input"
            defaultValue={account?.name}
          />
        </label>
        {errors.name && (
          <div className="pt-1 text-mkerror" id="name-error">
            {errors.name}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Type: </span>
          <select
            name="typeId"
            className="flex-1 rounded-md border-2 border-mk px-3 py-2 leading-loose"
            defaultValue={account?.typeId || ""}
          >
            <option value="">Select type</option>
            {types?.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        {errors.typeId && (
          <div className="pt-1 text-mkerror" id="typeId-error">
            {errors.typeId}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Group: </span>
          <select
            name="groupId"
            className="flex-1 rounded-md border-2 border-mk px-3 py-2 leading-loose"
            defaultValue={account?.groupId || ""}
          >
            <option value="">Select group</option>
            {groups?.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </label>
        {errors.groupId && (
          <div className="pt-1 text-mkerror" id="groupId-error">
            {errors.groupId}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Color: </span>
          <input
            ref={colorRef}
            type="color"
            name="color"
            aria-invalid={errors.color ? true : undefined}
            aria-errormessage={errors.color ? "color-error" : undefined}
            data-testid="new-account-color-input"
            defaultValue={account?.color}
          />
        </label>
        {errors.color && (
          <div className="pt-1 text-mkerror" id="color-error">
            {errors.color}
          </div>
        )}
      </div>

      {isEdit && (
        <div>
          <label className="flex w-full flex-row gap-2">
            <input
              type="checkbox"
              name="archived"
              data-testid="new-account-archived-input"
              defaultChecked={account?.archived}
            />
            <span>Archived</span>
          </label>
        </div>
      )}

      <div>
        <label className="flex w-full flex-row gap-2">
          <input
            type="checkbox"
            name="showInGraphs"
            data-testid="new-account-graph-input"
            defaultChecked={account?.showInGraphs}
          />
          <span>Show in graphs</span>
        </label>
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
