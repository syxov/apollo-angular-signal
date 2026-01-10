import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { GqlSignalResult } from '../apollo-angular-signal';

@Component({
  selector: 'gql-signal-status',
  templateUrl: './gql-signal-status.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    style: 'display: contents;',
  }
})
export class GqlSignalStatus<T> {
  readonly gql = input.required<GqlSignalResult<T>>();
}
