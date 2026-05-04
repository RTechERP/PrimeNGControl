/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TestPdfComponent } from './test-pdf.component';

describe('TestPdfComponent', () => {
  let component: TestPdfComponent;
  let fixture: ComponentFixture<TestPdfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestPdfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
