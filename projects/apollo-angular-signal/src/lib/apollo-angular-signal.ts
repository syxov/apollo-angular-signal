import {
  computed,
  effect,
  signal,
  type Signal,
  type WritableSignal,
} from '@angular/core';
import type { ObservableQuery } from '@apollo/client';
import type { Apollo } from 'apollo-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Subscription, Observable } from 'rxjs';
import { debounce } from 'es-toolkit';

export type GqlQueryResult<T> =
  | Apollo.QueryResult<T>
  | Apollo.SubscribeResult<T>
  | ObservableQuery.Result<T>;

type ObservableResult<T> = Observable<GqlQueryResult<T>>;

type Maybe<T> = T | null | undefined;

export interface GqlSignalResult<T> {
  data?: T;
  loading: boolean;
  hasError: boolean;
  error?: unknown;
}

export function gqlQuery<T>(
  query: ObservableResult<T> | (() => Maybe<ObservableResult<T>>),
): Signal<GqlSignalResult<T>> {
  if (typeof query === 'function') {
    return gqlAsync(query);
  } else {
    const state = signal<GqlSignalResult<T>>(getInitialState());

    query.pipe(takeUntilDestroyed()).subscribe({
      next: (res) => {
        processRes(state, res);
      },
      error: (error: unknown) => {
        processErr(state, error);
      },
    });

    return state;
  }
}

function gqlAsync<T>(
  fn: () => Maybe<ObservableResult<T>>,
): Signal<GqlSignalResult<T>> {
  const state = signal<GqlSignalResult<T>>(getInitialState());

  const source$ = computed(fn);

  let sub: Maybe<Subscription>;

  // Use debounce to ensure we only subscribe once when multiple dependent signals
  // update synchronously, avoiding unnecessary subscription churn
  const subscribeOnObservable = debounce((observable: ObservableResult<T>) => {
    sub = observable.subscribe({
      next: (res) => {
        processRes(state, res);
      },
      error(error: unknown) {
        processErr(state, error);
      },
    });
  }, 0);

  effect((onCleanup) => {
    const observable = source$();
    if (observable) {
      subscribeOnObservable(observable);
    } else {
      state.set(getInitialState());
    }

    onCleanup(() => {
      sub?.unsubscribe();
      sub = null;
    });
  });

  return state;
}

function processRes<T>(
  state: WritableSignal<GqlSignalResult<T>>,
  res: GqlQueryResult<T>,
): void {
  state.set({
    data: res.data as T,
    loading: 'loading' in res ? res.loading : false,
    hasError: !!res.error,
    error: res.error,
  });
}

function processErr<T>(
  state: WritableSignal<GqlSignalResult<T>>,
  error: unknown,
): void {
  state.set({
    loading: false,
    hasError: true,
    error,
  });
}

function getInitialState<T>(): GqlSignalResult<T> {
  return {
    loading: true,
    hasError: false,
  };
}
