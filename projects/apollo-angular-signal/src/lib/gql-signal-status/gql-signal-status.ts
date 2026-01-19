import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { GqlSignalResult } from '../apollo-angular-signal';
import { GqlLibConfigToken } from '../config';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'gql-signal-status',
  templateUrl: './gql-signal-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgComponentOutlet],
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class GqlSignalStatus<T> {
  protected readonly config = inject(GqlLibConfigToken, {
    optional: true,
  });

  readonly gql = input.required<GqlSignalResult<T>>();
}
