import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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

  it('it should work without global config', () => {
    const fixture = TestBed.createComponent(TestWrapperWithContent);
    const fixtureElement = fixture.nativeElement as HTMLElement;

    fixture.componentRef.setInput('gql', {
      loading: true,
      hasError: false,
      data: undefined,
    });

    fixture.detectChanges();

    const loadingContainer = fixtureElement.querySelector('.test-loading');
    expect(loadingContainer).not.toBeNullable();

    fixture.componentRef.setInput('gql', {
      loading: false,
      hasError: true,
      data: undefined,
    });

    fixture.detectChanges();

    const error = fixtureElement.querySelector('.test-error');
    expect(error).not.toBeNullable();

    fixture.componentRef.setInput('gql', {
      loading: false,
      hasError: false,
      data: 'test',
    });

    fixture.detectChanges();

    const content = fixtureElement.querySelector('.test-content');
    expect(content).not.toBeNullable();
    expect(content?.textContent).toEqual('test');
  });

  describe('it should work with global config', () => {
    it('should work with string templates', () => {
      TestBed.overrideProvider(GqlLibConfigToken, {
        useValue: {
          errorDefaultTemplate: 'Error template',
          loadingDefaultTemplate: 'Loading template',
        },
      });
      const fixture = TestBed.createComponent(TestWrapperWithoutContent);
      const fixtureElement = fixture.nativeElement as HTMLElement;

      fixture.componentRef.setInput('gql', {
        loading: true,
        hasError: false,
        data: undefined,
      });

      fixture.detectChanges();
      expect(fixtureElement.textContent.trim()).toEqual('Loading template');

      fixture.componentRef.setInput('gql', {
        loading: false,
        hasError: true,
        data: undefined,
      });

      fixture.detectChanges();
      expect(fixtureElement.textContent.trim()).toEqual('Error template');
    });

    it('should work with component templates', () => {
      TestBed.overrideProvider(GqlLibConfigToken, {
        useValue: {
          errorDefaultTemplate: ErrorTemplateComponent,
          loadingDefaultTemplate: LoadingTemplateComponent,
        },
      });
      const fixture = TestBed.createComponent(TestWrapperWithoutContent);
      const fixtureElement = fixture.nativeElement as HTMLElement;

      fixture.componentRef.setInput('gql', {
        loading: true,
        hasError: false,
        data: undefined,
      });

      fixture.detectChanges();
      expect(
        fixtureElement.querySelector('gql-loading-template'),
      ).not.toBeNullable();
      expect(fixtureElement.querySelector('gql-error-template')).toBeNullable();

      fixture.componentRef.setInput('gql', {
        loading: false,
        hasError: true,
        data: undefined,
      });

      fixture.detectChanges();
      expect(
        fixtureElement.querySelector('gql-loading-template'),
      ).toBeNullable();
      expect(
        fixtureElement.querySelector('gql-error-template'),
      ).not.toBeNullable();
    });
  });
});
