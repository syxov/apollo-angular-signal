# Apollo Angular Signal

A lightweight Angular library that converts Apollo GraphQL queries into Angular signals, enabling seamless integration between Apollo Client and Angular's signal-based reactive programming.

## Installation

```bash
npm install apollo-angular-signal
```

## What It Does

This library takes Apollo Angular `ObservableQuery` results and transforms them into Angular signals, providing a more idiomatic way to work with GraphQL data in modern Angular applications.

## Usage

### Basic Query

```typescript
import { Component, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { gqlQuery } from 'apollo-angular-signal';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

@Component({
  selector: 'app-users',
  template: `
    @if (users().loading) {
      <div>Loading...</div>
    }
    @if (users().hasError) {
      <div>Error: {{ users().error }}</div>
    }
    @if (users().data) {
      <ul>
        @for (user of users().data.users; track user.id) {
          <li>{{ user.name }} - {{ user.email }}</li>
        }
      </ul>
    }
  `
})
export class UsersComponent {
  private apollo = inject(Apollo);

  users = gqlQuery<{ users: Array<{ id: string; name: string; email: string }> }>(
    this.apollo.watchQuery({
      query: GET_USERS
    }).valueChanges
  );
}
```

### Query with Variables

```typescript
import { Component, inject, signal } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { gqlQuery } from 'apollo-angular-signal';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

@Component({
  selector: 'app-user-detail',
  template: `
    <input [(ngModel)]="userId" placeholder="Enter user ID">

    @if (user().loading) {
      <div>Loading...</div>
    }
    @if (user().data) {
      <div>
        <h2>{{ user().data.user.name }}</h2>
        <p>{{ user().data.user.email }}</p>
      </div>
    }
  `
})
export class UserDetailComponent {
  private apollo = inject(Apollo);

  userId = signal('1');

  // Reactive query that re-executes when userId changes
  user = gqlQuery<{ user: { id: string; name: string; email: string } }>(() => {
    const id = this.userId();
    if (!id) return null;

    return this.apollo.watchQuery({
      query: GET_USER,
      variables: { id }
    }).valueChanges;
  });
}
```

### Subscriptions

```typescript
import { Component, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { gqlQuery } from 'apollo-angular-signal';

const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded {
    messageAdded {
      id
      text
      author
    }
  }
`;

@Component({
  selector: 'app-messages',
  template: `
    @if (messages().data) {
      <div>
        <p><strong>{{ messages().data.messageAdded.author }}:</strong></p>
        <p>{{ messages().data.messageAdded.text }}</p>
      </div>
    }
  `
})
export class MessagesComponent {
  private apollo = inject(Apollo);

  messages = gqlQuery<{ messageAdded: { id: string; text: string; author: string } }>(
    this.apollo.subscribe({
      query: MESSAGE_SUBSCRIPTION
    })
  );
}
```

### Using the GqlSignalStatus Component

The `GqlSignalStatus` component simplifies handling loading and error states with a declarative approach:

```typescript
import { Component, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { gqlQuery, GqlSignalStatus } from 'apollo-angular-signal';

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
    }
  }
`;

@Component({
  selector: 'app-users',
  imports: [GqlSignalStatus],
  template: `
    <gql-signal-status [gql]="users()">
      <div gqlLoading>Loading users...</div>
      <div gqlError>Failed to load users</div>

      <ul>
        @for (user of users().data?.users; track user.id) {
          <li>{{ user.name }} - {{ user.email }}</li>
        }
      </ul>
    </gql-signal-status>
  `
})
export class UsersComponent {
  private apollo = inject(Apollo);

  users = gqlQuery<{ users: Array<{ id: string; name: string; email: string }> }>(
    this.apollo.watchQuery({
      query: GET_USERS
    }).valueChanges
  );
}
```

**Features:**
- Automatically shows loading state while query is in progress
- Displays error state if query fails
- Renders main content when data is available
- Supports custom loading and error templates via `gqlLoading` and `gqlError` attributes
- Falls back to global defaults if no custom templates provided

### Global Configuration

You can configure default loading and error templates globally:

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideGqlSignalConfig } from 'apollo-angular-signal';

// With string templates
export const appConfig: ApplicationConfig = {
  providers: [
    provideGqlSignalConfig({
      loadingDefaultTemplate: 'Loading...',
      errorDefaultTemplate: 'An error occurred'
    })
  ]
};

// Or with component templates
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { ErrorMessageComponent } from './error-message.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideGqlSignalConfig({
      loadingDefaultTemplate: LoadingSpinnerComponent,
      errorDefaultTemplate: ErrorMessageComponent
    })
  ]
};
```

## API

### `gqlQuery<T>(query)`

Converts an Apollo query/subscription observable into an Angular signal.

**Parameters:**
- `query`: Either an `Observable<QueryResult<T>>` or a function returning one (for reactive queries)

**Returns:**
A `Signal<GqlSignalResult<T>>` where `GqlSignalResult` contains:
- `data?: T` - The query result data
- `loading: boolean` - Loading state
- `hasError: boolean` - Whether an error occurred
- `error?: unknown` - Error object if present

**Two modes:**

1. **Static mode**: Pass observable directly
```typescript
gqlQuery(apollo.watchQuery({ query: GET_DATA }).valueChanges)
```

2. **Reactive mode**: Pass a function for reactive re-execution
```typescript
gqlQuery(() => {
  const id = someSignal();
  return apollo.watchQuery({ query: GET_DATA, variables: { id } }).valueChanges;
})
```

## License

MIT
