import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  waitForAsync,
} from "@angular/core/testing";
import { CoursesCardListComponent } from "./courses-card-list.component";
import { CoursesModule } from "../courses.module";
import { setupCourses } from "../common/setup-test-data";
import { DebugElement } from "@angular/core";
import { By } from "@angular/platform-browser";

describe("CoursesCardListComponent", () => {
  let component: CoursesCardListComponent;
  let fixture: ComponentFixture<CoursesCardListComponent>;
  let element: DebugElement;

  // teardownAfterEach: false can be used to prevent Angular from destroying the component after each test
  // This is useful to check if the rendering is happening
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CoursesModule],
      // teardown: { destroyAfterEach: false },
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(CoursesCardListComponent);
        component = fixture.componentInstance;

        console.log(component);
        element = fixture.debugElement;
      });
  }));

  it("should create an instance of the card list component", () => {
    expect(component).toBeTruthy();
  });

  it("should display the course list", () => {
    // Input mock data
    component.courses = setupCourses();

    // Trigger change detection cycle to update the view
    fixture.detectChanges();

    // Query for the courses list
    const cards = element.queryAll(By.css(".course-card"));

    // Check that all cards loaded
    expect(cards.length).toBe(12);
  });

  it("should display the first course", () => {
    component.courses = setupCourses();

    fixture.detectChanges();

    const firstCourse = component.courses[0];

    const card = element.query(By.css(".course-card:first-child"));
    const title = card.query(By.css("mat-card-title"));
    const image = card.query(By.css("img"));

    expect(card).toBeTruthy("Could not find course card");
    expect(title.nativeElement.textContent).toBe(
      firstCourse.titles.description,
      "Incorrect course title",
    );

    expect(image.nativeElement.src).toBe(
      firstCourse.iconUrl,
      "Incorrect course image",
    );
  });
});
