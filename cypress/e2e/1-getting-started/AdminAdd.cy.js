describe("Full Shop Flow Test", () => {
  const dummyUser = {
    email: "test1@gmail.com",
    password: "Dummy123!",
  };

  it("Logs in and adds a product via modal form", () => {
    cy.visit("http://localhost/Powder.ba/#login");
    cy.get("#loginform", { timeout: 10000 }).should("be.visible");
    cy.get("#floatingInputEmail").type(dummyUser.email);
    cy.get("#floatingPassword").type(dummyUser.password);
    cy.get("#loginform button#login").click();
    cy.wait(2000);
    cy.reload();
    cy.wait(2000);

    cy.get("#adminop").click();

    cy.get("#addProductBtn").click();

    cy.get("#exampleModale").should("be.visible");

    const productData = {
      productImg: "https://dummyimage.com/200x200/000/fff",
      productName: "Test Protein",
      flavour: "Chocolate",
      price: "29.99",
      description: "Delicious chocolate protein",
      category: "Proteini",
      quantity: 10,
    };

    cy.get("#addimage").clear().type(productData.productImg);
    cy.get("#productName").clear().type(productData.productName);
    cy.get("#flavour").clear().type(productData.flavour);
    cy.get("#price").clear().type(productData.price);
    cy.get("#desc").clear().type(productData.description);
    cy.get("#category").select(productData.category);
    cy.get("#quantity").clear().type(productData.quantity);

    cy.get("#exampleModale").should("be.visible");
    cy.get("#exampleModale")
      .find('button[type="submit"]')
      .should("be.visible")
      .click({ force: true });

    cy.wait(2000);
    cy.reload();

    cy.get("#next").scrollIntoView();

    cy.get("#next").click();

    cy.window().then((win) => {
      win.scrollBy(0, 200);
    });
    cy.wait(2000);

    cy.get(".card").last().find("img.slika").click();

    cy.get("#shopitem", { timeout: 10000 }).should("be.visible");
  });
});
