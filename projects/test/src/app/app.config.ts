import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideGqlSignalConfig } from 'apollo-angular-signal';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideGqlSignalConfig({
      errorDefaultTemplate: 'Error',
      loadingDefaultTemplate: 'Loading...',
    }),
  ],
};
