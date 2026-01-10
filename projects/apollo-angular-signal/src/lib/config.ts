import { InjectionToken, Provider, Type } from '@angular/core';

export interface GqlLibConfig {
  errorDefaultTemplate?: string | Type<unknown>;
  loadingDefaultTemplate?: string | Type<unknown>;
}

export const GqlLibConfigToken = new InjectionToken<GqlLibConfig>(
  'GqlLibConfig',
);

export function provideGqlSignalConfig(config: GqlLibConfig): Provider {
  return {
    provide: GqlLibConfigToken,
    useValue: config,
  };
}
