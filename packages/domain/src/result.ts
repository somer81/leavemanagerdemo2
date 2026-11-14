// The one blessed error pattern of packages/domain (docs/conventions.md, Error handling):
// rule violations are returned, never thrown.
export interface DomainError<Code extends string = string> {
  readonly code: Code;
  readonly message: string;
}

export type Result<Value, Code extends string = string> =
  | { readonly ok: true; readonly value: Value }
  | { readonly ok: false; readonly error: DomainError<Code> };

export const ok = <Value>(value: Value): { readonly ok: true; readonly value: Value } => ({
  ok: true,
  value,
});

export const fail = <Code extends string>(
  code: Code,
  message: string,
): { readonly ok: false; readonly error: DomainError<Code> } => ({
  ok: false,
  error: { code, message },
});
