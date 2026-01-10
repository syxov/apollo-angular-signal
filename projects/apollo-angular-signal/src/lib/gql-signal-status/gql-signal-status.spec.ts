import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GqlSignalStatus } from './gql-signal-status';

describe('GqlSignalStatus', () => {
  let component: GqlSignalStatus<unknown>;
  let fixture: ComponentFixture<GqlSignalStatus<unknown>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GqlSignalStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(GqlSignalStatus);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
