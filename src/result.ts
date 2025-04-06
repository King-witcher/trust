/**
 * A Result type inspired by Rust that represents either success (Ok) or failure (Err)
 */
export type Result<T, E> = Ok<T, E> | Err<T, E>

export namespace Result {
  export function fromPromise<T, E>(
    promise: Promise<T>
  ): Promise<Result<T, unknown>> {
    return promise
      .then((value) => new Ok(value))
      .catch((error) => new Err(error))
  }
}

class Ok<T, E> {
  readonly _tag = 'Ok'
  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true
  }

  isErr(): this is Err<T, E> {
    return false
  }

  unwrap(): T {
    return this.value
  }

  unwrapOr(_default: T): T {
    return this.value
  }

  unwrapErr(): never {
    throw new Error('Called unwrapErr on an Ok value')
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value))
  }

  mapErr<F>(_fn: (err: E) => F): Result<T, F> {
    return new Ok(this.value)
  }

  andThen<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value)
  }

  match<U>(patterns: { ok: (value: T) => U; err: (error: E) => U }): U {
    return patterns.ok(this.value)
  }

  asPromise(): Promise<T> {
    return Promise.resolve(this.value)
  }
}

class Err<T, E> {
  readonly _tag = 'Err'
  constructor(readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false
  }

  isErr(): this is Err<T, E> {
    return true
  }

  unwrap(): never {
    throw new Error(`Called unwrap on an Err value: ${this.error}`)
  }

  unwrapOr(defaultValue: T): T {
    return defaultValue
  }

  unwrapErr(): E {
    return this.error
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Err(this.error)
  }

  mapErr<F>(fn: (err: E) => F): Result<T, F> {
    return new Err(fn(this.error))
  }

  andThen<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Err(this.error)
  }

  match<U>(patterns: { ok: (value: T) => U; err: (error: E) => U }): U {
    return patterns.err(this.error)
  }

  asPromise(): Promise<T> {
    return Promise.reject(this.error)
  }
}

export function ok<T, E>(value: T): Result<T, E> {
  return new Ok(value)
}

export function err<T, E>(error: E): Result<T, E> {
  return new Err(error)
}
