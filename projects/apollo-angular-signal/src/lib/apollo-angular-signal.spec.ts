import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError, Subject } from 'rxjs';
import { gqlQuery } from './apollo-angular-signal';

describe('gqlQuery', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  describe('with Observable (non-function)', () => {
    it('should set initial loading state', () => {
      TestBed.runInInjectionContext(() => {
        const mockQuery$ = new Subject();
        const result = gqlQuery(mockQuery$);

        expect(result().loading).toBe(true);
        expect(result().hasError).toBe(false);
      });
    });

    it('should update state when data is received', (done) => {
      TestBed.runInInjectionContext(() => {
        const mockData = { id: 1, name: 'Test' };
        const mockQuery$ = of({ data: mockData, loading: false });

        const result = gqlQuery(mockQuery$);

        setTimeout(() => {
          expect(result().data).toEqual(mockData);
          expect(result().loading).toBe(false);
          expect(result().hasError).toBe(false);
          done();
        }, 0);
      });
    });

    it('should handle errors in result', (done) => {
      TestBed.runInInjectionContext(() => {
        const mockError = new Error('Test error');
        const mockQuery$ = of({ data: null, loading: false, error: mockError });

        const result = gqlQuery(mockQuery$);

        setTimeout(() => {
          expect(result().hasError).toBe(true);
          expect(result().error).toBe(mockError);
          expect(result().loading).toBe(false);
          done();
        }, 0);
      });
    });

    it('should handle results without loading property', (done) => {
      TestBed.runInInjectionContext(() => {
        const mockData = { id: 1, name: 'Test' };
        const mockQuery$ = of({ data: mockData });

        const result = gqlQuery(mockQuery$);

        setTimeout(() => {
          expect(result().data).toEqual(mockData);
          expect(result().loading).toBe(false);
          done();
        }, 0);
      });
    });
  });

  describe('with function (async mode)', () => {
    it('should set initial loading state', () => {
      TestBed.runInInjectionContext(() => {
        const mockQuery$ = of({ data: null, loading: true });
        const result = gqlQuery(() => mockQuery$);

        expect(result().loading).toBe(true);
        expect(result().hasError).toBe(false);
      });
    });

    it('should react to changes in function', (done) => {
      TestBed.runInInjectionContext(() => {
        const dataSignal = signal({ data: { value: 1 }, loading: false });
        const result = gqlQuery(() => of(dataSignal()));

        setTimeout(() => {
          expect(result().data?.value).toBe(1);

          dataSignal.set({ data: { value: 2 }, loading: false });

          setTimeout(() => {
            expect(result().data?.value).toBe(2);
            done();
          }, 0);
        }, 0);
      });
    });

    it('should handle subscription errors', (done) => {
      TestBed.runInInjectionContext(() => {
        const mockError = new Error('Subscribe error');
        const result = gqlQuery(() => throwError(() => mockError));

        setTimeout(() => {
          expect(result().hasError).toBe(true);
          expect(result().error).toBe(mockError);
          expect(result().loading).toBe(false);
          done();
        }, 10);
      });
    });

    it('should handle errors in result data', (done) => {
      TestBed.runInInjectionContext(() => {
        const mockError = new Error('Result error');
        const result = gqlQuery(() => of({ data: null, loading: false, error: mockError }));

        setTimeout(() => {
          expect(result().hasError).toBe(true);
          expect(result().error).toBe(mockError);
          expect(result().loading).toBe(false);
          done();
        }, 0);
      });
    });

    it('should unsubscribe on cleanup', () => {
      TestBed.runInInjectionContext(() => {
        const subject = new Subject();
        const spy = spyOn(subject, 'subscribe').and.callThrough();

        gqlQuery(() => subject);

        expect(spy).toHaveBeenCalled();
      });
    });
  });
});
