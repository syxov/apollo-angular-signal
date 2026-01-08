import { computed, effect, signal, Signal } from '@angular/core';
import { Observable, ObservableQuery } from '@apollo/client';
import { Apollo } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

type Result<T> =
  | Apollo.QueryResult<T>
  | Apollo.SubscribeResult<T>
  | ObservableQuery.Result<T>;

export type ObservableResult<T> = Observable<Result<T>>;

type Maybe<T> = T | null | undefined;

interface LibResult<T> {
  data?: T;
  loading: boolean;
  hasError: boolean;
  error?: unknown;
}

export function gqlQuery<T>(
  query: ObservableResult<T> | (() => Maybe<ObservableResult<T>>),
): Signal<LibResult<T>> {
  if (typeof query === 'function') {
    return gqlAsync(query);
  } else {
    const state = signal<LibResult<T>>({
      loading: true,
      hasError: false,
    });

    query.pipe(takeUntilDestroyed()).subscribe({
      next: (res) => {
        state.set({
          data: res.data as T,
          hasError: !!res.error,
          error: res.error,
          loading: 'loading' in res ? res.loading : false,
        });
      },
      error: (error: unknown) => {
        state.set({
          loading: false,
          hasError: true,
          error,
        });
      },
    });

    return state;
  }
}

function gqlAsync<T>(
  fn: () => Maybe<ObservableResult<T>>,
): Signal<LibResult<T>> {
  const state = signal<LibResult<T>>({
    loading: true,
    hasError: false,
  });

  const source$ = computed(fn);

  effect((onCleanup) => {
    const observable = source$();
    let sub: Maybe<Subscription>;
    if (observable) {
      sub = observable.pipe(takeUntilDestroyed()).subscribe({
        next: (res) => {
          state.set({
            data: res.data as T,
            loading: 'loading' in res ? res.loading : false,
            hasError: !!res.error,
            error: res.error,
          });
        },
        error: (error: unknown) => {
          state.set({
            loading: false,
            hasError: true,
            error,
          });
        },
      });
    }

    onCleanup(() => {
      sub?.unsubscribe();
    });
  });

  return state;
}
