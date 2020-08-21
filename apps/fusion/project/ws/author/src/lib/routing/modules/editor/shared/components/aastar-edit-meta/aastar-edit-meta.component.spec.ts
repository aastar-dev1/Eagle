import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AastarEditMetaComponent } from './aastar-edit-meta.component';

describe('AastarEditMetaComponent', () => {
  let component: AastarEditMetaComponent;
  let fixture: ComponentFixture<AastarEditMetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AastarEditMetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AastarEditMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
