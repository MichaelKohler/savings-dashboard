import * as React from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";

import Button from "~/components/button";
import type { SerializedAccount } from "~/models/accounts.server";

type ActionDataResponse = {
  errors: {
    name?: string;
    color?: string;
    generic?: string;
  };
};

export default function AccountForm({
  initialData,
}: {
  initialData?: SerializedAccount | null;
}) {
  const actionData = useActionData<ActionDataResponse>();
  const navigation = useNavigation();

  const nameRef = React.useRef<HTMLInputElement>(null);
  const colorRef = React.useRef<HTMLInputElement>(null);

  const isEdit = !!initialData?.id;

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.color) {
      colorRef.current?.focus();
    }
  }, [actionData]);

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
          <span>Name: </span>
          <input
            ref={nameRef}
            type="text"
            name="name"
            className="flex-1 rounded-md border-2 border-mk px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors.name ? true : undefined}
            aria-errormessage={
              actionData?.errors.name ? "name-error" : undefined
            }
            data-testid="new-account-name-input"
            defaultValue={initialData?.name}
          />
        </label>
        {actionData?.errors.name && (
          <div className="pt-1 text-mkerror" id="name=error">
            {actionData.errors.name}
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
            aria-invalid={actionData?.errors.color ? true : undefined}
            aria-errormessage={
              actionData?.errors.color ? "color-error" : undefined
            }
            data-testid="new-account-color-input"
            defaultValue={initialData?.color}
          />
        </label>
        {actionData?.errors.color && (
          <div className="pt-1 text-mkerror" id="color=error">
            {actionData.errors.color}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-row gap-2">
          <input
            type="checkbox"
            name="showInGraphs"
            data-testid="new-account-graph-input"
            defaultChecked={initialData?.showInGraphs}
          />
          <span>Show in graphs</span>
        </label>
      </div>

      {isEdit && <input type="hidden" name="id" value={initialData?.id} />}

      {actionData?.errors.generic && (
        <div className="pt-1 text-mkerror" id="generic=error">
          {actionData.errors.generic}
        </div>
      )}

      <Button isSubmit isDisabled={!!navigation.formData}>
        {navigation.formData ? (
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
