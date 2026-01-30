import { TestBed } from "@angular/core/testing";
import { CoursesService } from "./courses.service";

import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { COURSES, LESSONS } from "../../../../server/db-data";
import { HttpErrorResponse, provideHttpClient } from "@angular/common/http";
import { Course } from "../model/course";

describe("CoursesService", () => {
  let coursesService: CoursesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    // We could provide HttpClient to actually call real endpoints by adding it to the providers array instead of imports
    TestBed.configureTestingModule({
      providers: [
        CoursesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    coursesService = TestBed.inject(CoursesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // GET ALL
  it("retrieve all courses", () => {
    coursesService.findAllCourses().subscribe((courses) => {
      expect(courses).toBeTruthy("No courses returned");
      expect(courses.length).toBe(12, "incorrect number of courses");
      const course = courses.find((course) => course.id == 12);
      expect(course.titles.description).toBe("Angular Testing Course");
    });

    const req = httpTestingController.expectOne("/api/courses");

    expect(req.request.method).toBe("GET");

    // Passing mock data to the request
    req.flush({
      payload: Object.values(COURSES),
    });
  });

  // GET BY ID
  it("retrieve a course by id", () => {
    coursesService.findCourseById(12).subscribe((course) => {
      expect(course).toBeTruthy("Course not found");
      expect(course.id).toBe(12);
    });

    const req = httpTestingController.expectOne("/api/courses/12");

    expect(req.request.method).toBe("GET");

    // Passing mock data to the request
    req.flush(COURSES[12]);
  });

  // PUT COURSE DATA
  it("save course data", () => {
    const changesParam: Partial<Course> = {
      titles: { description: "Testing Course" },
    };

    coursesService.saveCourse(12, changesParam).subscribe((course) => {
      expect(course).toBeTruthy("Course not found");
      expect(course.titles.description).toBe("Testing Course");
    });

    const req = httpTestingController.expectOne("/api/courses/12");

    expect(req.request.method).toBe("PUT");
    expect(req.request.body.titles.description).toEqual(
      changesParam.titles.description,
    );

    // Passing mock data to the request
    req.flush({
      ...COURSES[12],
      ...changesParam,
    });
  });

  // PUT COURSE ERROR HANDLING
  it("Should return error on save course failure", () => {
    const changesParam: Partial<Course> = {
      titles: { description: "Testing Course" },
    };

    coursesService.saveCourse(12, changesParam).subscribe(
      () => fail("the save course operation should have failed"),
      (error: HttpErrorResponse) => {
        console.log(error);

        expect(error.status).toBe(500);
      },
    );

    const req = httpTestingController.expectOne("/api/courses/12");

    expect(req.request.method).toBe("PUT");

    // Passing mock error to the request
    req.flush("Save course failed", {
      status: 500,
      statusText: "Internal Server Error",
    });
  });

  // GET LESSONS AND VERIFY QUERY PARAMS
  it("should find lessons a list of lessons of a course", () => {
    coursesService.findLessons(12).subscribe((lessons) => {
      expect(lessons).toBeTruthy();
      expect(lessons.length).toBe(3);
    });

    const req = httpTestingController.expectOne(
      (req) => req.url == "/api/lessons",
    );

    expect(req.request.method).toBe("GET");

    // Verify that the request contains the expected query parameters
    expect(req.request.params.get("courseId")).toEqual("12");
    expect(req.request.params.get("filter")).toEqual("");
    expect(req.request.params.get("sortOrder")).toEqual("asc");
    expect(req.request.params.get("pageNumber")).toEqual("0");
    expect(req.request.params.get("pageSize")).toEqual("3");

    req.flush({
      payload: Object.values(LESSONS)
        .filter((lesson) => lesson.courseId === 12)
        .slice(0, 3),
    });
  });

  // After each test
  afterEach(() => {
    // Verify that no other https requests are being made.
    httpTestingController.verify();
  });
});
