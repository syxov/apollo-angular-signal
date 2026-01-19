import { Component, signal } from '@angular/core';
import { GqlSignalResult, GqlSignalStatus } from 'apollo-angular-signal';

@Component({
  selector: 'app-root',
  imports: [GqlSignalStatus],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('test');
  protected readonly gql: GqlSignalResult<string> = {
    data: 'Test message',
    hasError: false,
    loading: false,
  };
}
