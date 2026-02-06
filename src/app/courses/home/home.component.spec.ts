import {
  ComponentFixture,
  fakeAsync,
  flush,
  flushMicrotasks,
  TestBed,
  tick,
  waitForAsync,
} from "@angular/core/testing";
import { CoursesModule } from "../courses.module";
import { DebugElement } from "@angular/core";

import { HomeComponent } from "./home.component";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { CoursesService } from "../services/courses.service";
import { HttpClient } from "@angular/common/http";
import { COURSES } from "../../../../server/db-data";
import { setupCourses } from "../common/setup-test-data";
import { By } from "@angular/platform-browser";
import { async, of } from "rxjs";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { click } from "../common/test-utils";
import { Course } from "../model/course";
import { delay } from "rxjs/operators";

describe("HomeComponent", () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let el: DebugElement;
  let coursesService: jasmine.SpyObj<CoursesService>;

  const beginnerCourses: Course[] = setupCourses().filter(
    (course) => course.category === "BEGINNER",
  );

  const advancedCourses: Course[] = setupCourses().filter(
    (course) => course.category === "ADVANCED",
  );

  beforeEach(async () => {
    const coursesServiceSpy = jasmine.createSpyObj<CoursesService>(
      "CoursesService",
      ["findAllCourses"],
    );

    await TestBed.configureTestingModule({
      imports: [CoursesModule, NoopAnimationsModule],
      providers: [{ provide: CoursesService, useValue: coursesServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    coursesService = TestBed.inject(
      CoursesService,
    ) as jasmine.SpyObj<CoursesService>;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should display only beginner courses", () => {
    coursesService.findAllCourses.and.returnValue(of(beginnerCourses));

    fixture.detectChanges();

    const tabs = el.queryAll(By.css(".mat-mdc-tab"));

    expect(tabs.length).toBe(1, "There should be only one tab");
  });

  it("should display only advanced courses", () => {
    coursesService.findAllCourses.and.returnValue(of(advancedCourses));

    fixture.detectChanges();

    const tabs = el.queryAll(By.css(".mat-mdc-tab"));

    expect(tabs.length).toBe(1, "There should be only one tab");
  });

  it("should display both tabs", () => {
    coursesService.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();
    const tabs = el.queryAll(By.css(".mat-mdc-tab"));
    expect(tabs.length).toBe(2, "There should be two tabs");
  });

  it("should display advanced courses when tab clicked (asynchronous task)", (done: DoneFn) => {
    coursesService.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();

    const tabs = el.queryAll(By.css(".mat-mdc-tab"));

    expect(tabs.length).toBe(2, "There should be two tabs");

    tabs[1].nativeElement.click();
    fixture.detectChanges();

    setTimeout(() => {
      const cardTitles = el.queryAll(By.css(".mat-mdc-card-title"));
      console.log(cardTitles);

      // Would be 9 or 12 while the cards are still loading
      typeof expect(cardTitles.length).toBe(
        3,
        "There should be more than one card",
      );

      const selected = el.nativeElement.querySelector(
        "[role='tab'][aria-selected='true']",
      );

      expect(selected.textContent).toContain(
        "Advanced",
        "Advanced tab should be selected",
      );

      done();
    }, 500);
  });

  it("should display advanced courses when tab clicked (asynchronous task with async)", fakeAsync(() => {
    coursesService.findAllCourses.and.returnValue(of(setupCourses()));
    fixture.detectChanges();

    const tabs = el.queryAll(By.css(".mat-mdc-tab"));

    expect(tabs.length).toBe(2, "There should be two tabs");

    tabs[1].nativeElement.click();
    fixture.detectChanges();

    // This automatically handles async tasks
    flush();

    const cardTitles = el.queryAll(By.css(".mat-mdc-card-title"));
    console.log(cardTitles);

    // Would be 9 or 12 while the cards are still loading
    typeof expect(cardTitles.length).toBe(
      3,
      "There should be more than one card",
    );

    const selected = el.nativeElement.querySelector(
      "[role='tab'][aria-selected='true']",
    );

    expect(selected.textContent).toContain(
      "Advanced",
      "Advanced tab should be selected",
    );
  }));

  it("asynchronous test with microtask", fakeAsync(() => {
    let test = false;

    console.log("Creating promise");

    Promise.resolve()
      .then(() => {
        console.log("Promise resolved 1");
        test = true;

        return Promise.resolve();
      })
      .then(() => {
        setTimeout(() => {
          test = false;
          console.log("SetTimeout resolved 1");
        }, 1000);

        console.log("Promise resolved 2");
      });

    flushMicrotasks();

    expect(test).toBe(true);

    tick(1000);

    expect(test).toBe(false);
  }));

  it("asynchronous test with observables", fakeAsync(() => {
    let test = false;
    const text$ = of("Hello World");

    text$.pipe(delay(200)).subscribe((text) => {
      test = true;
      expect(text).toBe("Hello World");
    });

    tick(1000);

    expect(test).toBe(true);
  }));
});
