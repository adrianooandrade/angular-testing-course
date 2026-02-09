describe("Home", () => {
  beforeEach(() => {
    cy.fixture("courses.json").then((courses) => {
      cy.intercept("GET", "/api/courses", courses).as("courses");
    });
    cy.visit("http://localhost:4200/courses");
  });

  it("should load", () => {
    // real FE + real BE
    // cy.get(".mat-mdc-card-title").contains("Angular Testing Course");

    // real FE + mock BE
    cy.wait("@courses");
    cy.get(".mat-mdc-card-title").contains("Angular Testing Course");
  });

  it("should select advanced courses tab", () => {
    cy.get(".mat-mdc-tab").should("have.length", 2);
    // usually needs a fakeAsync here for the animation to complete
    cy.get(".mat-mdc-tab").last().click();

    cy.get("mat-card-title").should("contain", "Angular Security Course");
  });
});
