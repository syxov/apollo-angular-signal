import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { GqlSignalStatus } from './gql-signal-status';
import { GqlSignalResult } from '../apollo-angular-signal';

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
class TestWrapperComponent {
  gql = input.required<GqlSignalResult<string>>();
}

describe('GqlSignalStatus', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GqlSignalStatus, TestWrapperComponent],
    }).compileComponents();
  });

  describe('it should work without global config', () => {
    it('render different states', () => {
      const fixture = TestBed.createComponent(TestWrapperComponent);

      fixture.componentRef.setInput('gql', {
        loading: true,
        hasError: false,
        data: undefined,
      });

      fixture.detectChanges();

      const loadingContainer =
        fixture.nativeElement.querySelector('.test-loading');
      expect(loadingContainer).not.toBeNullable();

      fixture.componentRef.setInput('gql', {
        loading: false,
        hasError: true,
        data: undefined,
      });

      fixture.detectChanges();

      const error = fixture.nativeElement.querySelector('.test-error');
      expect(error).not.toBeNullable();

      fixture.componentRef.setInput('gql', {
        loading: false,
        hasError: false,
        data: 'test',
      });

      fixture.detectChanges();

      const content: HTMLDivElement =
        fixture.nativeElement.querySelector('.test-content');
      expect(content).not.toBeNullable();
      expect(content.textContent).toEqual('test');
    });
  });
});
