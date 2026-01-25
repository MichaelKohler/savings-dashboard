import { useEffect, useRef, useState } from "react";
import { actions, isInputError } from "astro:actions";
import Button from "~/components/button";
import type { Type } from "~/models/types.server";

interface TypeFormProps {
  type?: Type | null;
}

export default function TypeForm({ type }: TypeFormProps) {
  const [errors, setErrors] = useState<{
    name?: string;
    generic?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  const isEdit = !!type?.id;

  useEffect(() => {
    if (errors.name) {
      nameRef.current?.focus();
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    if (isEdit && type?.id) {
      formData.append("typeId", type.id);
    }

    const { data, error } = isEdit
      ? await actions.updateType(formData)
      : await actions.createType(formData);

    if (error) {
      if (isInputError(error)) {
        setErrors(error.fields as typeof errors);
      } else {
        setErrors({ generic: error.message || "Failed to save type" });
      }
      setIsSubmitting(false);
      return;
    }

    if (data) {
      window.location.href = "/types";
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
            className="border-mk flex-1 rounded-md border-2 px-3 text-lg leading-loose"
            aria-invalid={errors.name ? true : undefined}
            aria-errormessage={errors.name ? "name-error" : undefined}
            defaultValue={type?.name}
            required
          />
        </label>
        {errors.name && (
          <div className="text-mkerror pt-1" id="name-error">
            {errors.name}
          </div>
        )}
      </div>

      {errors.generic && (
        <div className="text-mkerror pt-1" id="generic-error">
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
