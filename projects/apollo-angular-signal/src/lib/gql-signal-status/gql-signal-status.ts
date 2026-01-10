import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { GqlSignalResult } from '../apollo-angular-signal';
import { GqlLibConfigToken } from '../config';
import { NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'gql-signal-status',
  templateUrl: './gql-signal-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: contents',
  },
  imports: [NgComponentOutlet],
})
export class GqlSignalStatus<T> {
  protected readonly config = inject(GqlLibConfigToken, {
    optional: true,
  });

  readonly gql = input.required<GqlSignalResult<T>>();
}
