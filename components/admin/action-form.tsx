"use client";

import { useActionState, type ReactNode } from "react";

type State = { error?: string };

export function AdminActionForm({
  action,
  children,
  className,
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, {} satisfies State);

  return (
    <form action={formAction} className={className}>
      {state?.error ? (
        <p role="alert" className="mb-3 rounded-lg border border-[color:var(--brand-burgundy-soft)]/40 bg-[color:var(--card-cream)] px-2 py-1.5 text-xs text-[color:var(--brand-burgundy-soft)]">
          {state.error}
        </p>
      ) : null}
      {children}
    </form>
  );
}
