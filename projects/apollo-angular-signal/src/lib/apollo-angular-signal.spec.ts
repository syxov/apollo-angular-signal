import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { gqlQuery } from './apollo-angular-signal';
import { Apollo } from 'apollo-angular';
import { signal } from '@angular/core';

describe('gqlQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
  });

  describe('with Observable (non-function)', () => {
    it('should work fine', () => {
      TestBed.runInInjectionContext(() => {
        const query = new Subject<Apollo.QueryResult<string>>();
        const result = gqlQuery(query);

        expect(result().loading).toBe(true);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(false);

        query.next({ data: 'foo' });

        expect(result().loading).toBe(false);
        expect(result().data).toBe('foo');
        expect(result().hasError).toBe(false);

        const error = new Error('error');
        query.error(error);

        expect(result().loading).toBe(false);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(true);
        expect(result().error).toBe(error);
      });
    });
  });

  describe('with function (async mode)', () => {
    it('should work fine with static query', async () => {
      await TestBed.runInInjectionContext(async () => {
        const query = new Subject<Apollo.QueryResult<string>>();
        const result = gqlQuery(() => query);

        TestBed.tick();
        await vi.runAllTimersAsync();

        expect(result().loading).toBe(true);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(false);

        query.next({ data: 'foo' });

        expect(result().loading).toBe(false);
        expect(result().data).toBe('foo');
        expect(result().hasError).toBe(false);

        const error = new Error('error');
        query.error(error);

        expect(result().loading).toBe(false);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(true);
        expect(result().error).toBe(error);
      });
    });

    it('should work fine with dynamic query', async () => {
      await TestBed.runInInjectionContext(async () => {
        const query = new Subject<Apollo.QueryResult<string>>();
        const queryCanBeReturned = signal(false);
        const result = gqlQuery(() => {
          return queryCanBeReturned() ? query : null;
        });

        TestBed.tick();

        expect(result().loading).toBe(true);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(false);

        query.next({ data: 'foo' });

        expect(result().loading).toBe(true);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(false);

        queryCanBeReturned.set(true);
        TestBed.tick();
        await vi.runAllTimersAsync();
        query.next({ data: 'foo' });

        expect(result().loading).toBe(false);
        expect(result().data).toBe('foo');
        expect(result().hasError).toBe(false);
      });
    });

    it('should work fine after reseting a query', async () => {
      await TestBed.runInInjectionContext(async () => {
        const query = new Subject<Apollo.QueryResult<string>>();
        const queryCanBeReturned = signal(false);
        const result = gqlQuery(() => {
          return queryCanBeReturned() ? query : null;
        });

        TestBed.tick();

        expect(result().loading).toBe(true);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(false);

        queryCanBeReturned.set(true);
        TestBed.tick();
        await vi.runAllTimersAsync();
        query.next({ data: 'foo' });

        expect(result().loading).toBe(false);
        expect(result().data).toBe('foo');
        expect(result().hasError).toBe(false);

        queryCanBeReturned.set(false);
        TestBed.tick();
        await vi.runAllTimersAsync();

        expect(result().loading).toBe(true);
        expect(result().data).toBe(undefined);
        expect(result().hasError).toBe(false);
      });
    });
  });
});
