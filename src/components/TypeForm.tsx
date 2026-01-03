import { useEffect, useRef, useState } from "react";
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

    try {
      const endpoint = isEdit
        ? `/api/types/${type.id}/update`
        : "/api/types/create";

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors(data.errors || {});
        setIsSubmitting(false);
        return;
      }

      // Redirect on success
      window.location.href = "/types";
    } catch (_error) {
      setErrors({ generic: "Failed to save type" });
      setIsSubmitting(false);
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
            defaultValue={type?.name}
            required
          />
        </label>
        {errors.name && (
          <div className="pt-1 text-mkerror" id="name-error">
            {errors.name}
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
