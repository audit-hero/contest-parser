export type Result2<T> =
  | { ok: true; value: T }
  | { ok: false; error: any }

  export type Result<T> = {
    error?: string
    result?: T
  }
  