import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GqlSignalStatus } from './gql-signal-status';
import { GqlSignalResult } from '../apollo-angular-signal';
import { GqlLibConfigToken } from '../config';

@Component({
  standalone: true,
  imports: [GqlSignalStatus],
  template: `
    <gql-signal-status [gql]="gql()">
      <div gqlLoading class="test-loading"></div>
      <div gqlError class="test-error"></div>
      <div class="test-content">{{ gql().data }}</div>
    </gql-signal-status>
  `,
})
class TestWrapperWithContent {
  gql = input.required<GqlSignalResult<string>>();
}

@Component({
  standalone: true,
  imports: [GqlSignalStatus],
  template: `
    <gql-signal-status [gql]="gql()">
      <div>Smth ...</div>
    </gql-signal-status>
  `,
})
class TestWrapperWithoutContent {
  gql = input.required<GqlSignalResult<string>>();
}

@Component({
  selector: 'gql-error-template',
  standalone: true,
  template: ``,
})
class ErrorTemplateComponent {}

@Component({
  selector: 'gql-loading-template',
  standalone: true,
  template: ``,
})
class LoadingTemplateComponent {}

describe('GqlSignalStatus', () => {
  const createLoadingState = (): GqlSignalResult<string> => ({
    loading: true,
    hasError: false,
    data: undefined,
  });

  const createErrorState = (): GqlSignalResult<string> => ({
    loading: false,
    hasError: true,
    data: undefined,
  });

  const createSuccessState = (data: string): GqlSignalResult<string> => ({
    loading: false,
    hasError: false,
    data,
  });

  const updateGqlState = (
    fixture: ComponentFixture<TestWrapperWithContent>,
    state: GqlSignalResult<string>,
  ): void => {
    fixture.componentRef.setInput('gql', state);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GqlSignalStatus,
        TestWrapperWithContent,
        TestWrapperWithoutContent,
        ErrorTemplateComponent,
        LoadingTemplateComponent,
      ],
    }).compileComponents();
  });

  describe('without global config', () => {
    it('should render loading state', () => {
      const fixture = TestBed.createComponent(TestWrapperWithContent);
      const element = fixture.nativeElement as HTMLElement;

      updateGqlState(fixture, createLoadingState());

      expect(element.querySelector('.test-loading')).not.toBeNullable();
    });

    it('should render error state', () => {
      const fixture = TestBed.createComponent(TestWrapperWithContent);
      const element = fixture.nativeElement as HTMLElement;

      updateGqlState(fixture, createErrorState());

      expect(element.querySelector('.test-error')).not.toBeNullable();
    });

    it('should render content with data', () => {
      const fixture = TestBed.createComponent(TestWrapperWithContent);
      const element = fixture.nativeElement as HTMLElement;

      updateGqlState(fixture, createSuccessState('test'));

      const content = element.querySelector('.test-content');
      expect(content).not.toBeNullable();
      expect(content?.textContent).toEqual('test');
    });
  });

  describe('with global config', () => {
    it('should render string templates', () => {
      TestBed.overrideProvider(GqlLibConfigToken, {
        useValue: {
          errorDefaultTemplate: 'Error template',
          loadingDefaultTemplate: 'Loading template',
        },
      });
      const fixture = TestBed.createComponent(TestWrapperWithoutContent);
      const element = fixture.nativeElement as HTMLElement;

      updateGqlState(fixture, createLoadingState());
      expect(element.textContent.trim()).toEqual('Loading template');

      updateGqlState(fixture, createErrorState());
      expect(element.textContent.trim()).toEqual('Error template');
    });

    it('should render component templates', () => {
      TestBed.overrideProvider(GqlLibConfigToken, {
        useValue: {
          errorDefaultTemplate: ErrorTemplateComponent,
          loadingDefaultTemplate: LoadingTemplateComponent,
        },
      });
      const fixture = TestBed.createComponent(TestWrapperWithoutContent);
      const element = fixture.nativeElement as HTMLElement;

      updateGqlState(fixture, createLoadingState());
      expect(element.querySelector('gql-loading-template')).not.toBeNullable();
      expect(element.querySelector('gql-error-template')).toBeNullable();

      updateGqlState(fixture, createErrorState());
      expect(element.querySelector('gql-loading-template')).toBeNullable();
      expect(element.querySelector('gql-error-template')).not.toBeNullable();
    });
  });
});
