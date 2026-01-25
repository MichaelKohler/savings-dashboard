import { useEffect, useRef, useState } from "react";
import { actions, isInputError } from "astro:actions";

interface LoginFormProps {
  redirectTo: string;
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (errors.email) {
      emailRef.current?.focus();
    } else if (errors.password) {
      passwordRef.current?.focus();
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);

    const { data, error } = await actions.login(formData);

    if (error) {
      if (isInputError(error)) {
        setErrors(error.fields as { email?: string; password?: string });
      } else {
        setErrors({
          email: error.message || "An error occurred. Please try again.",
        });
      }
      setIsSubmitting(false);
      return;
    }

    if (data) {
      window.location.href = data.redirect || redirectTo;
    }
  };

  return (
    <main className="mx-auto my-12 flex min-h-full w-full max-w-md flex-col px-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="text-mk-text block text-sm font-medium"
          >
            Email address
          </label>
          <div className="mt-1">
            <input
              ref={emailRef}
              id="email"
              required
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby="email-error"
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {errors.email && (
              <div className="text-mkerror pt-1" id="email-error">
                {errors.email}
              </div>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-mk-text block text-sm font-medium"
          >
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              ref={passwordRef}
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby="password-error"
              className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
            />
            {errors.password && (
              <div className="text-mkerror pt-1" id="password-error">
                {errors.password}
              </div>
            )}
          </div>
        </div>

        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-mk hover:bg-mk-secondary focus:bg-mk-secondary w-full rounded px-4 py-2 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember"
              name="remember"
              type="checkbox"
              className="text-mk focus:ring-mk h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="remember"
              className="text-mk-text ml-2 block text-sm"
            >
              Remember me
            </label>
          </div>
        </div>
      </form>
    </main>
  );
}
