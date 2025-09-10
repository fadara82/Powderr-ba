describe("Full Shop Flow Test", () => {
  const dummyUser = {
    email: "testy.dummy@example.com",
    password: "Dummy123!",
  };

  it("Logs in, adds a product to cart, deletes it, and checks cart is empty", () => {
    cy.visit("http://localhost/Powder.ba/#login");
    cy.get("#loginform", { timeout: 10000 }).should("be.visible");
    cy.get("#floatingInputEmail").type(dummyUser.email);
    cy.get("#floatingPassword").type(dummyUser.password);
    cy.get("#loginform button#login").click();
    cy.wait(2000);

    cy.window().then((win) => {
      const token = win.localStorage.getItem("token");
      expect(token).to.exist;
      expect(token.length).to.be.greaterThan(10);
    });

    cy.get("#maindiv .card a[href='#shopitem'] .slika")
      .first()
      .should("be.visible")
      .click();
    cy.wait(1000);

    cy.get("#shopitemdiv .btn.btn-outline-dark", { timeout: 10000 }).should(
      "be.visible"
    );

    cy.get("#shopitemdiv .btn.btn-outline-dark").click();

    cy.get("#shopitemdiv a[href='#main']").should("be.visible").click();
    cy.wait(1000);

    cy.get("#btnCart").should("be.visible").click();

    cy.get("#shopingcart").should("be.visible");

    cy.get("#cartDiv button.btn-danger").first().click();
    cy.wait(500);

    cy.get(".back-to-shop a[href='#main']").click();
    cy.wait(1000);

    cy.get("#btnCart").click();

    cy.window().then((win) => {
      const cart = JSON.parse(win.localStorage.getItem("cart")) || [];
      expect(cart).to.have.length(0);
    });
    cy.reload();

    cy.get("#cartDiv").should("be.empty");
  });
});
