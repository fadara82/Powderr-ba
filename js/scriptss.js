$(document).ready(function () {
  // Deklariraj varijable globalno unutar ovog bloka (sve je u lokalnom scope-u)
  var stripe;
  var elements;
  var cardElement;

  function initializeStripe() {
    if (typeof Stripe === "undefined") {
      console.error("Stripe.js nije učitan!");
      return false;
    }

    if (!stripe) {
      stripe = Stripe(
        "pk_test_51RttZ2FZT8D1aC1QLBomWg4d1jBzecHJ1W6szxOL6iX539rcIj9mArHMpu9tJXoDC3lFYtin9Uajy6wm9nVXQKBS00yQRYV8vG"
      );
      elements = stripe.elements();
    }

    if (cardElement) {
      cardElement.unmount(); // ukloni prethodni ako postoji
    }

    cardElement = elements.create("card");
    cardElement.mount("#card-element");

    cardElement.on("change", function (event) {
      if (event.error) {
        $("#card-errors").text(event.error.message);
      } else {
        $("#card-errors").text("");
      }
    });

    console.log("Stripe Card Element montiran");
    return true;
  }

  function waitForStripeAndRun(callback) {
    if (typeof Stripe !== "undefined") {
      callback();
    } else {
      setTimeout(() => waitForStripeAndRun(callback), 50);
    }
  }

  waitForStripeAndRun(() => {
    if (!initializeStripe()) {
      console.error("Ne mogu inicijalizirati Stripe Card Element");
      return;
    }

    $("#check").validate({
      rules: {
        firstName: { required: true, minlength: 2 },
        lastName: { required: true, minlength: 2 },
        email: { required: true, email: true },
        mobilenumber: { required: true, minlength: 6 },
        city: { required: true, minlength: 2 },
        address: { required: true },
        cardholderName: { required: true, minlength: 2 },
      },
      messages: {
        cardholderName: {
          required: "Ime na kartici je obavezno",
          minlength: "Ime na kartici mora imati barem 2 znaka",
        },
      },
      submitHandler: function (form, event) {
        event.preventDefault();
        $("#order").attr("disabled", true);

        if (!cardElement || !$("#card-element").length) {
          alert("Kartični element nije montiran. Molimo osvježite stranicu.");
          $("#order").attr("disabled", false);
          return;
        }

        const amount = 1000; // amount u centima (10 KM)

        $.ajax({
          url: "http://localhost/Powder.ba/backend/stripe/create-payment-intent",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({ amount: amount }),
          headers: {
            Authentication: Utilis.get_from_localstorage("token"),
          },
          success: function (data) {
            if (!data.clientSecret) {
              alert("Nema clientSecret u odgovoru backend-a!");
              $("#order").attr("disabled", false);
              return;
            }

            stripe
              .confirmCardPayment(data.clientSecret, {
                payment_method: {
                  card: cardElement,
                  billing_details: {
                    name: $("#cardholderName").val(),
                    email: $("#email").val(),
                    phone: $("#mobilenumber").val(),
                    address: {
                      city: $("#city").val(),
                      line1: $("#address").val(),
                    },
                  },
                },
              })
              .then(function (result) {
                if (result.error) {
                  alert("Plaćanje nije uspjelo: " + result.error.message);
                  $("#order").attr("disabled", false);
                } else if (
                  result.paymentIntent &&
                  result.paymentIntent.status === "succeeded"
                ) {
                  // Plaćanje uspješno, šalji narudžbu backendu

                  const orderData = {
                    firstName: $("#firstName").val(),
                    lastName: $("#lastName").val(),
                    email: $("#email").val(),
                    mobilenumber: $("#mobilenumber").val(),
                    city: $("#city").val(),
                    address: $("#address").val(),
                    paymentIntentId: result.paymentIntent.id,
                  };

                  $.ajax({
                    url: "http://localhost/Powder.ba/backend/orders",
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(orderData),
                    headers: {
                      Authentication: Utilis.get_from_localstorage("token"),
                    },
                    success: function () {
                      alert("Narudžba je uspješno spremljena. Hvala!");
                      $("#order").attr("disabled", false);
                      form.reset();
                      cardElement.clear();
                    },
                    error: function (xhr) {
                      alert(
                        "Greška pri spremanju narudžbe: " +
                          (xhr.responseJSON?.error || "Nešto nije u redu")
                      );
                      $("#order").attr("disabled", false);
                    },
                  });
                }
              });
          },
          error: function (xhr) {
            alert(
              "Greška prilikom kreiranja plaćanja: " +
                (xhr.responseJSON?.error || "Nešto nije u redu")
            );
            $("#order").attr("disabled", false);
          },
        });
      },
    });
  });
});

window.onload = function () {
  const token = Utilis.get_from_localstorage("token");
  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const role = payload.role || (payload.user && payload.user.role);
      console.log("Provjera tokena - role:", role);

      if (role === "admin") {
        $("#adminP").show();
        $("#homeNav").hide();
      } else {
        $("#adminP").hide();
        $("#homeNav").show();
      }
    } catch (e) {
      console.error("Nevažeći token:", e);
      $("#adminP").hide();
      $("#homeNav").show();
    }
  } else {
    // Ako nema tokena, prikazuj samo homeNav
    $("#adminP").hide();
    $("#homeNav").show();
  }
};

$(document).ready(function () {
  new DataTable("#example");
});

$(document).ready(function () {
  const itemsPerPage = 8;
  let currentPage = 1;
  let products = [];

  // Dinamički izaberi gdje će se prikazivati proizvodi i paginacija
  const container = $("#maindiv").length ? $("#maindiv") : $("#adminDiv");
  const prevBtn = $("#prev").length ? $("#prev") : $("#adminPrev");
  const nextBtn = $("#next").length ? $("#next") : $("#adminNext");
  const pageInfo = $("#pageInfo").length ? $("#pageInfo") : $("#adminPageInfo");

  function renderPage(page) {
    container.empty();

    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageItems = products.slice(startIndex, endIndex);

    pageItems.forEach((item) => {
      let html = `<div class="col mb-5" id="div1">
          <div class="card h-100">
            <div class="edit" style="display: flex; align-items: center; justify-content: space-between;">
              <button onclick="editProduct(${item.id})">✏️</button> 
              <button onclick="deleteP(${item.id})">🗑️</button>
            </div>
            <a href="#shopitem">
              <img class="card-img-top slika" src="${item.productImg}" alt="..." onClick="getId(${item.id})" />
            </a>
            <div class="card-body p-4">
              <div class="text-center">
                <a href="#shopitem">
                  <h5 class="fw-bolder title" onClick="getId(${item.id})">${item.productName}</h5>
                  <h5 class="flavour">${item.flavour}</h5>
                </a>
                <strong class="price">${item.price} KM</strong>
              </div>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
              <div class="text-center">
                <a class="btn btn-outline-dark mt-auto" onclick="addToCart(${item.id})">Add to cart</a>
              </div>
            </div>
          </div>
        </div>`;
      container.append(html);
    });

    $(".edit").hide();

    currentPage = page;

    pageInfo.text(`Stranica ${currentPage} od ${totalPages}`);
    prevBtn.prop("disabled", currentPage === 1);
    nextBtn.prop("disabled", currentPage === totalPages);
  }

  prevBtn.click(function () {
    if (currentPage > 1) renderPage(currentPage - 1);
  });

  nextBtn.click(function () {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) renderPage(currentPage + 1);
  });

  // AJAX poziv za učitavanje proizvoda

  $.ajax({
    url: "http://localhost/Powder.ba/backend/products/get",
    method: "GET",
    dataType: "json",
    beforeSend: function (xhr) {
      const token = Utilis.get_from_localstorage("token");
      if (token) {
        xhr.setRequestHeader("Authentication", token);
      }
    },
    success: function (data) {
      products = data;
      renderPage(1);
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
});

function getId(id) {
  console.log(id);
  $.ajax({
    url: `http://localhost/Powder.ba/backend/products/get/byid?id=${id}`,
    method: "GET",
    beforeSend: function (xhr) {
      const token = Utilis.get_from_localstorage("token");
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return false; // prekida AJAX poziv
      }
      xhr.setRequestHeader("Authentication", token);
    },
    success: function (item) {
      // Sačuvaj proizvod u localStorage kao JSON string
      localStorage.setItem("currentProduct", JSON.stringify(item));

      // Prikaz proizvoda na stranici
      var html = `
         <div class="col-md-6">
            <img
              class="card-img-top mb-5 mb-md-0"
              src="${item.productImg}"
              alt="..."
            />
          </div>
          <div class="col-md-6">
            <h1 class="display-5 fw-bolder title">${item.productName}</h1>
            <div class="fs-5 mb-5">
              <span>${item.price} KM</span>
            </div>
            <p class="lead">
              ${item.description}
              <p class="flavour">Flavour: ${item.flavour}</p>
            </p>
            <div class="d-flex">
              <button
                class="btn btn-outline-dark flex-shrink-0"
                type="button"
                id="addtocart"
                onclick="addToCart(${id})"
              >
                <i class="bi-cart-fill me-1"></i>
                Add to cart
              </button>
            </div>
          </div>
          <a href="#main">Back to Shop</a>
      `;
      $("#shopitemdiv").empty().append(html);
    },
    error: function (xhr, status, error) {
      console.error("Error loading product:", error);
    },
  });
}

$(document).ready(function () {
  const savedProduct = localStorage.getItem("currentProduct");
  if (savedProduct) {
    const item = JSON.parse(savedProduct);

    var html = `
       <div class="col-md-6">
          <img
            class="card-img-top mb-5 mb-md-0"
            src="${item.productImg}"
            alt="..."
          />
        </div>
        <div class="col-md-6">
          <h1 class="display-5 fw-bolder title">${item.productName}</h1>
          <div class="fs-5 mb-5">
            <span>${item.price} KM</span>
          </div>
          <p class="lead">
            ${item.description}
            <p class="flavour">Flavour: ${item.flavour}</p>
          </p>
          <div class="d-flex">
            <button
              class="btn btn-outline-dark flex-shrink-0"
              type="button"
              id="addtocart"
              onclick="addToCart(${item.id})"
            >
              <i class="bi-cart-fill me-1"></i>
              Add to cart
            </button>
          </div>
        </div>
        <a href="#main">Back to Shop</a>
    `;

    $("#shopitemdiv").empty().append(html);
  }
});

$(document).ready(function () {
  function getId() {}
});

/*
$(document).ready(function () {
  $("#check").validate({
    rules: {
      firstName: {
        required: true,
        minlength: 2,
      },
      lastName: {
        required: true,
        minlength: 2,
      },
      email: {
        required: true,
        email: true,
        minlength: 5,
      },
      mobilenumber: {
        required: true,
        minlength: 6,
      },
      city: {
        required: true,
        minlength: 5,
      },
      address: {
        required: true,
      },
    },

    submitHandler: function (form, event) {
      event.preventDefault();

      var formData = $(form).serializeArray();

      console.log(formData);

      $.ajax({
        url: "http://localhost/Powder.ba/backend/orders",
        method: "POST",
        data: formData,
        headers: {
          Authentication: Utilis.get_from_localstorage("token"),
        },
        beforeSend: function (xhr) {
          if (Utilis.get_from_localstorage("user")) {
            xhr.setRequestHeader(
              "Authentication",
              JSON.parse(usert).data.token
            );
          }
        },
        success: function (response) {
          console.log("Form data sent successfully:", response);
        },
        error: function (xhr, status, error) {
          console.error("Error sending form data:", error);
        },
      });
    },
  });
});
*/

$(document).on("submit", "#a", function (e) {
  e.preventDefault();
  if ($(this).data("submitted")) return;
  $(this).data("submitted", true);

  let formDataObj = {};
  $(this)
    .serializeArray()
    .forEach(function (field) {
      formDataObj[field.name] = field.value;
    });

  $.ajax({
    url: "http://localhost/Powder.ba/backend/products",
    method: "POST",
    data: JSON.stringify(formDataObj),
    contentType: "application/json",
    headers: {
      Authentication: Utilis.get_from_localstorage("token"),
    },
    success: function (response) {
      console.log("Form data sent successfully:", response);
      window.location.reload();
    },
    error: function (xhr, status, error) {
      console.error("Error sending form data:", error);
    },
    complete: function () {
      $("#a").data("submitted", false);
    },
  });
});

$(document).ready(function () {
  $("#regform").validate({
    rules: {
      fname: {
        required: true,
        minlength: 2,
      },
      lname: {
        required: true,
        minlength: 2,
      },
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 6,
      },
      cpassword: {
        required: true,
      },
    },
    messages: {
      fname: {
        required: "Please enter your first name",
        minlength: "First name must be at least 2 characters long",
      },
      lname: {
        required: "Please enter your last name",
        minlength: "Last name must be at least 2 characters long",
      },
      email: {
        required: "Please enter your email",
        email: "Enter a valid email address",
      },
      password: {
        required: "Please enter a password",
        minlength: "Password must be at least 6 characters long",
      },
      cpassword: {
        required: "Please confirm your password",
        equalTo: "Passwords do not match",
      },
    },
    submitHandler: function (form, event) {
      event.preventDefault();

      var formData = $(form).serialize();

      $.ajax({
        url: "http://localhost/Powder.ba/backend/users",
        method: "POST",
        data: formData,

        success: function (response) {
          console.log("Form data sent successfully:", response);
          window.location.href = "#login";
        },
        error: function (xhr, status, error) {
          console.error("Error sending form data:", error);
          alert("This email or mobile phone is already registered");
        },
      });
    },
  });
});

function getProteini() {
  $.ajax({
    url: "http://localhost/Powder.ba/backend/products/get/proteini",
    method: "GET",
    dataType: "json",
    headers: {
      Authentication: Utilis.get_from_localstorage("token"),
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        const token = Utilis.get_from_localstorage("token");
      }
    },
    success: function (data) {
      $("#maindiv").empty();
      console.log("Data loaded successfully:", data);

      data.forEach((item) => {
        let html = `<div class="col mb-5" id="div1">
          <div class="card h-100">
            <div class="edit" style="display: flex; align-items: center; justify-content: space-between;">
              <button onclick="editProduct(${item.id})">✏️</button> <button  onclick="deleteP(${item.id})" >🗑️</button>
            </div>
            <a href="#shopitem">
              <img class="card-img-top slika" src="${item.productImg}" alt="..." onClick="getId(${item.id})" />
            </a>
            <div class="card-body p-4">
              <div class="text-center">
                <a href="#shopitem">
                  <h5 class="fw-bolder title" onClick="getId(${item.id})">${item.productName}</h5>
                  <h5 class="flavour">${item.flavour}</h5>
                </a>
                <strong class="price">${item.price} KM</strong>
              </div>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
              <div class="text-center">
                <a class="btn btn-outline-dark mt-auto" onclick="addToCart(${item.id})">Add to cart</a>
              </div>
            </div>
          </div>
        </div>`;

        $("#maindiv").append(html);
      });

      $(".edit").hide();
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
}

function getVitamini() {
  $.ajax({
    url: "http://localhost/Powder.ba/backend/products/get/vitamini",
    method: "GET",
    dataType: "json",
    beforeSend: function (xhr) {
      const token = Utilis.get_from_localstorage("token");
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return false; // prekida AJAX poziv
      }
      xhr.setRequestHeader("Authentication", token);
    },
    success: function (data) {
      $("#maindiv").empty(); // Čisti sadržaj
      console.log("Data loaded successfully:", data);

      data.forEach((item) => {
        let html = `<div class="col mb-5" id="div1">
          <div class="card h-100">
            <div class="edit" style="display: flex; align-items: center; justify-content: space-between;">
              <button onclick="editProduct(${item.id})">✏️</button> <button onclick="deleteP(${item.id})">🗑️</button>
            </div>
            <a href="#shopitem">
              <img class="card-img-top slika" src="${item.productImg}" alt="..." onClick="getId(${item.id})" />
            </a>
            <div class="card-body p-4">
              <div class="text-center">
                <a href="#shopitem">
                  <h5 class="fw-bolder title" onClick="getId(${item.id})">${item.productName}</h5>
                  <h5 class="flavour">${item.flavour}</h5>
                </a>
                <strong class="price">${item.price} KM</strong>
              </div>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
              <div class="text-center">
                <a class="btn btn-outline-dark mt-auto" onclick="addToCart(${item.id})">Add to cart</a>
              </div>
            </div>
          </div>
        </div>`;

        $("#maindiv").append(html);
      });

      $(".edit").hide();
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
}

function getKreatin() {
  $.ajax({
    url: "http://localhost/Powder.ba/backend/products/get/creatine",
    method: "GET",
    dataType: "json",
    beforeSend: function (xhr) {
      const token = Utilis.get_from_localstorage("token");
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return false;
      }
      xhr.setRequestHeader("Authentication", token);
    },
    success: function (data) {
      $("#maindiv").empty();
      console.log("Data loaded successfully:", data);

      data.forEach((item) => {
        let html = `<div class="col mb-5" id="div1">
          <div class="card h-100">
            <div class="edit" style="display: flex; align-items: center; justify-content: space-between;">
              <button onclick="editProduct(${item.id})">✏️</button> <button onclick="deleteP(${item.id})">🗑️</button>
            </div>
            <a href="#shopitem">
              <img class="card-img-top slika" src="${item.productImg}" alt="..." onClick="getId(${item.id})" />
            </a>
            <div class="card-body p-4">
              <div class="text-center">
                <a href="#shopitem">
                  <h5 class="fw-bolder title" onClick="getId(${item.id})">${item.productName}</h5>
                  <h5 class="flavour">${item.flavour}</h5>
                </a>
                <strong class="price">${item.price} KM</strong>
              </div>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
              <div class="text-center">
                <a class="btn btn-outline-dark mt-auto" onclick="addToCart(${item.id})">Add to cart</a>
              </div>
            </div>
          </div>
        </div>`;

        $("#maindiv").append(html);
      });

      $(".edit").hide();
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
}

function getCokoladice() {
  $.ajax({
    url: "http://localhost/Powder.ba/backend/products/get/healthybar",
    method: "GET",
    dataType: "json",
    beforeSend: function (xhr) {
      const token = Utilis.get_from_localstorage("token");
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return false;
      }
      xhr.setRequestHeader("Authentication", token);
    },
    success: function (data) {
      $("#maindiv").empty();
      console.log("Data loaded successfully:", data);

      data.forEach((item) => {
        let html = `<div class="col mb-5" id="div1">
          <div class="card h-100">
            <div class="edit" style="display: flex; align-items: center; justify-content: space-between;">
              <button onclick="editProduct(${item.id})">✏️</button> <button onclick="deleteP(${item.id})">🗑️</button>
            </div>
            <a href="#shopitem">
              <img class="card-img-top slika" src="${item.productImg}" alt="..." onClick="getId(${item.id})" />
            </a>
            <div class="card-body p-4">
              <div class="text-center">
                <a href="#shopitem">
                  <h5 class="fw-bolder title" onClick="getId(${item.id})">${item.productName}</h5>
                  <h5 class="flavour">${item.flavour}</h5>
                </a>
                <strong class="price">${item.price} KM</strong>
              </div>
            </div>
            <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
              <div class="text-center">
                <a class="btn btn-outline-dark mt-auto" onclick="addToCart(${item.id})">Add to cart</a>
              </div>
            </div>
          </div>
        </div>`;

        $("#maindiv").append(html);
      });

      $(".edit").hide();
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
}

function logout() {
  window.localStorage.clear();
  window.location.reload();
}

if (!window.localStorage.getItem("token")) {
  window.location = "http://localhost/Powder.ba/#login";
}

function deleteP(id) {
  if (confirm("Are you sure you want to delete?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/products/delete/byid?id=${id}`,
      method: "DELETE",
      beforeSend: function (xhr) {
        const token = Utilis.get_from_localstorage("token");
        if (!token) {
          alert("Niste prijavljeni! Molimo prijavite se.");
          return false; // prekida AJAX poziv
        }
        xhr.setRequestHeader("Authentication", token);
      },
      success: function () {
        window.location.reload(); // reload nakon uspješnog brisanja
      },
      error: function (xhr, status, error) {
        console.error("Error sending form data:", error);
      },
    });
  }
}

function deleteO(id) {
  if (confirm("Are you sure you want to delete?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/orders/delete/byid?id=${id}`,
      method: "DELETE",
      beforeSend: function (xhr) {
        const token = Utilis.get_from_localstorage("token");
        if (!token) {
          alert("Niste prijavljeni! Molimo prijavite se.");
          return false; // prekida AJAX poziv
        }
        xhr.setRequestHeader("Authentication", token);
      },
      success: function () {
        location.reload(); // reload nakon uspješnog brisanja
      },
      error: function (xhr, status, error) {
        console.error("Error sending form data:", error);
      },
    });
  }
}

function updateOrder(id) {
  if (confirm("Are you sure you want to update order?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/orders/update/byid?id=${id}`,
      method: "UPDATE",
      headers: {
        Authentication: Utilis.get_from_localstorage("token"),
      },
      beforeSend: function (xhr) {
        if (Utilis.get_from_localstorage("user")) {
          xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
        }
      },
      success: function (response) {
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error sending form data:", error);
      },
    });
  }
}

function deleteUsers(id) {
  if (confirm("Are you sure you want to delete user?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/users/delete/byid?id=${id}`,
      method: "DELETE",
      beforeSend: function (xhr) {
        const token = Utilis.get_from_localstorage("token");
        if (!token) {
          alert("Niste prijavljeni! Molimo prijavite se.");
          return false; // prekida AJAX poziv
        }
        xhr.setRequestHeader("Authentication", token);
      },
      success: function (response) {
        location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error sending form data:", error);
      },
    });
  }
}

function unhideER() {
  $(".edit").toggle();
  console.log("Kuca Da");
}

function editProduct(id) {
  console.log(id);
  $.ajax({
    url: `http://localhost/Powder.ba/backend/products/get/byid?id=${id}`,
    method: "GET",
    headers: {
      Authentication: Utilis.get_from_localstorage("token"),
    },
    success: function (response) {
      console.log("Response:", response);

      var item = response; // response je već objekat proizvoda

      if (!item || item.id != id) {
        console.error("Item not found with ID:", id);
        return;
      }

      var html = `
        <form class="modal show" id="exampleModale" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" style="display:block;">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Edit Product</h5>
                <button type="button" class="close" aria-label="Close" onclick="$('#exampleModale').remove()">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body" style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <img src="${item.productImg}" alt="Product Image" style="max-height: 100px; max-width: 100px;">
                  <input type="text" name="image" id="addimage" value="${item.productImg}" placeholder="Add Image link" style="flex-grow:1; margin-left: 10px;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label for="productName" style="flex-basis: 150px;">Product Name</label>
                  <input type="text" name="productName" id="productName" value="${item.productName}" style="flex-grow:1;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label for="flavour" style="flex-basis: 150px;">Flavour</label>
                  <input type="text" name="flavour" id="flavour" value="${item.flavour}" style="flex-grow:1;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label for="price" style="flex-basis: 150px;">Price</label>
                  <input type="text" name="price" id="price" value="${item.price}" style="flex-grow:1;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label for="desc" style="flex-basis: 150px;">Description</label>
                  <input type="text" name="desc" id="desc" value="${item.description}" style="flex-grow:1;">
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <label for="category" style="flex-basis: 150px;">Category</label>
                  <input type="text" name="category" id="category" value="${item.category}" style="flex-grow:1;">
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="$('#exampleModale').remove()">Close</button>
                <button type="submit" class="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </form>
      `;

      $("#modalje").empty().append(html);

      $("#exampleModale").validate({
        rules: {
          productName: "required",
          price: {
            required: true,
            number: true,
          },
        },
        submitHandler: function (form, event) {
          event.preventDefault();

          var formDataArray = $(form).serializeArray();
          var formData = {};
          formDataArray.forEach(function (field) {
            formData[field.name] = field.value;
          });

          $.ajax({
            url: `http://localhost/Powder.ba/backend/products/update/${id}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(formData),
            headers: {
              Authentication: Utilis.get_from_localstorage("token"),
            },
            success: function (response) {
              console.log("Form data sent successfully:", response);
              location.reload();
            },
            error: function (xhr, status, error) {
              console.error("Error sending form data:", error);
              console.error("Response text:", xhr.responseText);
              alert("Error updating product: " + xhr.responseText);
            },
          });
        },
      });
    },
    error: function (xhr, status, error) {
      console.error("Error:", status, error);
    },
  });
}

function checkProductAvailability(id, callback) {
  $.ajax({
    url: `http://localhost/Powder.ba/backend/products/get/byid?id=${id}`,
    method: "GET",
    headers: {
      Authentication: Utilis.get_from_localstorage("token"),
    },
    success: function (product) {
      if (!product) {
        alert("Proizvod nije pronađen!");
        callback(null);
        return;
      }
      if (product.quantity <= 0) {
        alert(`Proizvod "${product.productName}" trenutno nije na stanju!`);
        callback(null);
        return;
      }
      callback(product);
    },
    error: function () {
      alert("Greška pri dohvatu proizvoda.");
      callback(null);
    },
  });
}

function addToCart(id) {
  checkProductAvailability(id, function (product) {
    if (!product) return;
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
      alert(
        `Proizvod "${product.productName}" je već u košarici. Količina povećana.`
      );
    } else {
      cart.push({
        id: product.id,
        productName: product.productName,
        productImg: product.productImg,
        flavour: product.flavour,
        price: product.price,
        description: product.description,
        category: product.category,
        quantity: 1,
      });
      alert(`Proizvod "${product.productName}" je dodat u košaricu!`);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  });
}

function renderCart() {
  var totalprice = 0;
  let data = JSON.parse(localStorage.getItem("cart")) || [];

  $("#usersdiv").empty();
  $("#cartDiv").empty();

  data.forEach((item, index) => {
    let price = parseFloat(item.price);
    let subtotal = price * item.quantity;

    let htmlt = `
      <div class="row mb-4 d-flex justify-content-between align-items-center">
        <div class="col-md-2 col-lg-2 col-xl-2">
          <img src="${item.productImg}" class="img-fluid rounded-3" />
        </div>
        <div class="col-md-3 col-lg-3 col-xl-3">
          <h6 class="text-muted">${item.category}</h6>
          <h6 class="text-black mb-0">${item.productName}</h6>
        </div>
        <div class="col-md-2">
          <button onclick="changeQuantity(${
            item.id
          }, -1)" class="btn btn-sm btn-secondary">-</button>
          <span class="mx-2">${item.quantity}</span>
          <button onclick="changeQuantity(${
            item.id
          }, 1)" class="btn btn-sm btn-secondary">+</button>
        </div>
        <div class="col-md-2">
          <h6 class="mb-0">${subtotal.toFixed(2)} BAM</h6>
        </div>
        <div class="col-md-1 text-end">
          <button onclick="deleteCart(${
            item.id
          })" class="btn btn-sm btn-danger">🗑️</button>
        </div>
      </div>
      <hr class="my-4" />
    `;

    $("#cartDiv").append(htmlt);
    totalprice += subtotal;
  });

  $("#totalprice").text(totalprice.toFixed(2) + " BAM");

  var shipping = 7;
  if (totalprice > 100) {
    $("#shipping").text("FREE");
    $("#total").text(totalprice.toFixed(2) + " BAM");
  } else {
    $("#shipping").text(shipping + " BAM");
    totalprice += shipping;
    $("#total").text(totalprice.toFixed(2) + " BAM");
  }

  $("#code")
    .off("input")
    .on("input", function () {
      var codeValue = $(this).val();
      if (codeValue === "FIRST ORDER") {
        let discount = totalprice * 0.2;
        $("#total").text((totalprice - discount).toFixed(2) + " BAM");
      } else {
        $("#total").text(totalprice.toFixed(2) + " BAM");
      }
    });
}

function deleteCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let updatedCart = cart.filter((item) => item.id !== id);
  localStorage.setItem("cart", JSON.stringify(updatedCart));
  renderCart();
}

function changeQuantity(id, change) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let item = cart.find((p) => p.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity < 1) {
    if (confirm("Želite li ukloniti ovaj proizvod iz košarice?")) {
      cart = cart.filter((p) => p.id !== id);
    } else {
      item.quantity = 1;
    }
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

$(document).ready(function () {
  renderCart();
});

$(document).ready(function () {
  $("#loginform").validate({
    rules: {
      email: { required: true, email: true },
      password: { required: true },
    },

    submitHandler: function (form, event) {
      event.preventDefault();

      var formData = $(form).serializeArray();

      $.ajax({
        url: "http://localhost/Powder.ba/backend/login",
        method: "POST",
        data: formData,

        success: function (response) {
          if (response.data && response.data.token) {
            Utilis.set_to_localstorage("token", response.data.token);

            const token = response.data.token;
            const payloadBase64 = token.split(".")[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);
            const role = payload.role || (payload.user && payload.user.role);
            console.log("User role:", role);

            if (role === "admin") {
              setTimeout(() => {
                window.location = "http://localhost/Powder.ba/#admin";
              }, 100);
            } else {
              window.location = "http://localhost/Powder.ba/#main";
            }
          } else {
            console.error("Token nije pronađen u response-u!", response);

            alert("Neispravni login podaci!");
          }
        },

        error: function () {
          $.unblockUI();
          alert("Greška na serveru, pokušajte kasnije.");
        },

        beforeSend: function () {
          $.blockUI({ message: "Molimo sačekajte..." });
        },

        complete: function () {
          $.unblockUI();
        },
      });
    },
  });
});
