describe("Add to Cart Flow Test with Login Modal", () => {
  it("Clicks a product, handles login modal, adds to cart, and checks modal again", () => {
    cy.visit("http://localhost/Powder.ba");

    cy.wait(2000);

    cy.get("#maindiv a.btn.btn-outline-dark")
      .first()
      .should("be.visible")
      .click();

    cy.wait(1000);

    cy.get("#loginPromptModal")
      .should("be.visible")
      .within(() => {
        cy.get("#loginNowBtn").should("be.visible");

        cy.get(".btn-secondary").click(); //No button

        cy.wait(3000);
      });

    cy.get("#maindiv .card a[href='#shopitem'] .slika").first().click();

    cy.wait(2000);

    cy.get("#shopitemdiv .btn.btn-outline-dark").should("be.visible").click();

    cy.wait(1000);

    cy.get("#loginPromptModal")
      .should("be.visible")
      .within(() => {
        cy.get("#loginNowBtn").should("be.visible");

        cy.get(".btn-secondary").click(); //No button

        cy.wait(3000);
      });

    expect(true).to.equal(true);
  });
});
