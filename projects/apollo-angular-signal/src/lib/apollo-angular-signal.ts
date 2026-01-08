import {computed, effect, signal, Signal} from '@angular/core';
import {Observable, ObservableQuery} from '@apollo/client';
import {Apollo} from 'apollo-angular';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

type Result<T> = Apollo.QueryResult<T> | Apollo.SubscribeResult<T> | ObservableQuery.Result<T>;
type ObservableResult<T> = Observable<Result<T>>;

interface LibResult<T> {
  data?: T;
  loading: boolean;
  hasError: boolean;
  error?: unknown;
}

export function gqlQuery<T>(
  query: ObservableResult<T> | (() => ObservableResult<T>)
): Signal<LibResult<T>> {
  if (typeof query === 'function') {
    return gqlAsync(query);
  } else {
    const state = signal<LibResult<T>>({
      loading: true,
      hasError: false
    });

    query.pipe(
      takeUntilDestroyed()
    ).subscribe({
      next: (res) => {
        state.set({
          data: res.data as T,
          hasError: !!res.error,
          error: res.error,
          loading: 'loading' in res ? res.loading : false
        })
      }}
    );

    return state;
  }
}

function gqlAsync<T>(
  fn: () => ObservableResult<T>
): Signal<LibResult<T>> {

  const state = signal<LibResult<T>>({
    loading: true,
    hasError: false
  });

  const source$ = computed(fn);

  effect((onCleanup) => {
    const sub = source$()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => {
          state.set({
            data: res.data as T,
            loading: 'loading' in res ? res.loading : false,
            hasError: !!res.error,
            error: res.error
          });
        },
        error: (error: unknown) => {
          state.set({
            loading: false,
            hasError: true,
            error
          });
        }
      });

    onCleanup(() => {
      sub.unsubscribe()
    });
  });

  return state;
}
