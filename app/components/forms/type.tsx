import * as React from "react";

import { Form, useActionData, useNavigation } from "react-router";

import Button from "~/components/button";
import type { Type } from "~/models/types.server";

interface ActionDataResponse {
  errors: {
    name?: string;
  };
}

export default function GroupForm({
  initialData,
}: {
  initialData?: Type | null;
}) {
  const actionData = useActionData<ActionDataResponse>();
  const navigation = useNavigation();

  const nameRef = React.useRef<HTMLInputElement>(null);

  const isEdit = !!initialData?.id;

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
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
              actionData?.errors.name ? "date-error" : undefined
            }
            data-testid="new-group-name-input"
            defaultValue={initialData?.name}
          />
        </label>
        {actionData?.errors.name && (
          <div className="pt-1 text-mkerror" id="name=error">
            {actionData.errors.name}
          </div>
        )}
      </div>

      {isEdit && <input type="hidden" name="id" value={initialData?.id} />}

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
