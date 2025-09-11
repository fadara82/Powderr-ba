$(document).ready(function () {
  // Hide all elements initially
  $("#homeNav").show();
  $("#adminP").hide();
  $("#exampleModale").hide();
  $("#exampleModal").hide();

  // Correct URL comparison
  if (window.location.href == "http://localhost/Powder.ba/#login") {
    $("#adminP").hide();
    $("#homeNav").hide();
  }

  if (
    window.location.href == "http://localhost/Powder.ba/#admin" ||
    window.location.href == "http://localhost/Powder.ba/#orders" ||
    window.location.href == "http://localhost/Powder.ba/#users"
  ) {
    $("#adminP").show();
    $("#homeNav").hide();
  } else {
    $("#adminP").hide();
    $("#homeNav").show();
  }
});

$(document).ready(function () {
  new DataTable("#example");
});

var usert = JSON.parse(window.localStorage.getItem("user"));

function addToCart(id) {
  if (confirm("Are you sure you want to add to cart?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/products/update/cart/byid?id=${id}`,
      method: "UPDATE",
      headers: {
        Authentication: JSON.parse(usert).data.token,
      },
      beforeSend: function (xhr) {
        if (Utilis.get_from_localstorage("user")) {
          xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
        }
      },
      success: function (response) {},
      error: function (xhr, status, error) {
        console.error("Error sending form data:", error);
      },
    });
  }
}

function deleteCart(id) {
  if (confirm("Are you sure you want to add to cart?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/products/updated/cart/byid?id=${id}`,
      method: "UPDATE",
      headers: {
        Authentication: JSON.parse(usert).data.token,
      },
      beforeSend: function (xhr) {
        if (Utilis.get_from_localstorage("user")) {
          xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
        }
      },
      success: function (response) {},
      error: function (xhr, status, error) {
        console.error("Error sending form data:", error);
      },
    });
  }
}

$(document).ready(function () {
  $.ajax({
    url: "http://localhost/Powder.ba/backend/products/get",
    method: "GET",
    dataType: "json",
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#maindiv").empty(); // Clear the contents of #maindiv before appending new content
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

      // After appending all items, hide the elements with class "edit"
      $(".edit").hide();
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
});

$(document).ready(function () {
  $.ajax({
    url: "http://localhost/Powder.ba/backend/orders/get",
    method: "GET",
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#tabeladiv").empty();

      data.forEach((item) => {
        let htmlt = `
        <tr>
          <td>${item.id}</td>
          <td>${item.first_name}</td>
          <td>${item.last_name}</td>
          <td>${item.email}</>
          <td>${item.mobile_number}</td>
          <td>${item.city}</td>
          <td>${item.address}</td>
          <td>${item.status}</td>

        <td>
            <button id="#check" onclick="updateOrder(${item.id})">✔️</button>
            <button id="#remove" onclick="deleteO(${item.id})">🗑️</button>
          </td>
          </tr>

        `;

        $("#tabeladiv").append(htmlt);
      });
    },
  });
});

function unhideER() {
  $(".edit").toggle();
}

function showModal() {
  $("#exampleModal").toggle();
}
function showEdit() {
  $("#exampleModale").toggle();
}

function green() {
  $(this).closest("tr").css("background-color", "green");
}

$(document).ready(function () {
  $.ajax({
    url: "http://localhost/Powder.ba/backend/users/get",
    method: "GET",
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#usersdiv").empty();

      data.forEach((item) => {
        let htmlt = `
        <tr>
          <td>${item.id}</td>
          <td>${item.first_name}</td>
          <td>${item.last_name}</td>
          <td>${item.email}</>
          <td>${item.mobile_number}</td>
        <td>
            <button id="#remove1" onclick="deleteUsers(${item.id})">🗑️</button>

          </td>
          </tr>

        `;

        $("#usersdiv").append(htmlt);
      });
    },
  });
});

$(document).ready(function () {
  var totalprice = 0;

  $.ajax({
    url: `http://localhost/Powder.ba/backend/products/get/cart`,
    method: "GET",
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#usersdiv").empty();

      data.forEach((item) => {
        var price = parseFloat(item.price);
        let htmlt = `
          <div class="row mb-4 d-flex justify-content-between align-items-center">
            <div class="col-md-2 col-lg-2 col-xl-2">
              <img src="${item.productImg}" class="img-fluid rounded-3"  />
            </div>
            <div class="col-md-3 col-lg-3 col-xl-3">
              <h6 class="text-muted">${item.category}</h6>
              <h6 class="text-black mb-0">${item.productName}</h6>
            </div>

            <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
              <h6 id="${item.productName}"class="total-price mb-0">${price} BAM</h6> <!-- Using the 'price' variable here -->
            </div>
            <div class="col-md-1 col-lg-1 col-xl-1 text-end">
              <a  class="text-muted">
                <button onclick=deleteCart(${item.id})>🗑️</button>
                <i class="fas fa-times"></i>
              </a>
            </div>
          </div>
          <hr class="my-4" />
        `;
        $("#cartDiv").append(htmlt);
        totalprice += parseFloat(item.price);
      });

      $("#totalprice").text(totalprice + " BAM");

      var shipping = 7;
      if (totalprice > 100) {
        $("#shipping").text("FREE");
        $("#total").text(totalprice + "BAM");
      } else {
        $("#shipping").html(shipping + " BAM");
        totalprice += 7;
        $("#total").text(totalprice + "BAM");
      }

      $("#code").on("input", function () {
        var codeValue = $(this).val();
        if (codeValue === "FIRST ORDER") {
          $("#total").text(totalprice - totalprice * 0.2 + " BAM");
        } else {
          $("#total").text(totalprice + " BAM");
        }
      });
    },
  });
});

function getId(id) {
  console.log(id);
  $.ajax({
    url: `http://localhost/Powder.ba/backend/products/get/byid?id=${id}`,
    method: "GET",
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (response) {
      var item = response.find(function (item) {
        return item.id == id;
      });
      var html = `
         <div class="col-md-6">
            <img
              class="card-img-top mb-5 mb-md-0"
              src="${item.productImg}"
              alt="..."
            />
          </div>
          <div class="col-md-6">
            <h1 class="display-5 fw-bolder title" >${item.productName}</h1>
            <div class="fs-5 mb-5">
              <span>${item.price}</span>
            </div>
            <p class="lead">
              ${item.description}

              <p class="flavour">Flavour:${item.flavour}</p>
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
  });
}

$(document).ready(function () {
  function getId() {}
});

$(document).ready(function () {
  $("#check").validate({
    rules: {
      /* firstName: {
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
      }, */
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
          Authentication: JSON.parse(usert).data.token,
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

$(document).ready(function () {
  $("#a").validate({
    rules: {},
    submitHandler: function (form, event) {
      event.preventDefault();

      var formData = $(form).serializeArray();

      console.log(formData);

      $.ajax({
        url: "http://localhost/Powder.ba/backend/products",
        method: "POST",
        data: formData,
        headers: {
          Authentication: JSON.parse(usert).data.token,
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
          location.reload();
        },
        error: function (xhr, status, error) {
          console.error("Error sending form data:", error);
        },
      });
    },
  });
});

$(document).ready(function () {
  $("#regform").validate({
    /*rules: {
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
        equalTo: "#password", // Assuming you have an id="password" for the password field
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
    },*/
    submitHandler: function (form, event) {
      event.preventDefault();

      var formData = $(form).serialize();

      $.ajax({
        url: "http://localhost/Powder.ba/backend/users",
        method: "POST",
        data: formData,

        success: function (response) {
          console.log("Form data sent successfully:", response);
          // Handle success response (e.g., display a success message)
        },
        error: function (xhr, status, error) {
          console.error("Error sending form data:", error);
          // Handle error response (e.g., display an error message)
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
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#maindiv").empty(); // Clear the contents of #maindiv before appending new content
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

      // After appending all items, hide the elements with class "edit"
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
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#maindiv").empty(); // Clear the contents of #maindiv before appending new content
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

      // After appending all items, hide the elements with class "edit"
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
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#maindiv").empty(); // Clear the contents of #maindiv before appending new content
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

      // After appending all items, hide the elements with class "edit"
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
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (data) {
      $("#maindiv").empty(); // Clear the contents of #maindiv before appending new content
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

      // After appending all items, hide the elements with class "edit"
      $(".edit").hide();
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
}
$(document).ready(function () {
  $("#loginform").validate({
    rules: {
      email: {
        required: true,
        email: true,
      },
      password: {
        required: true,
      },
    },

    submitHandler: function (form, event) {
      event.preventDefault();

      var formData = $(form).serializeArray();

      console.log(formData);

      $.ajax({
        url: "http://localhost/Powder.ba/backend/login",
        method: "POST",
        data: formData,

        success: function (response) {
          Utilis.set_to_localstorage("user", response);
          console.log("Login Succesfull:", response);
          window.location = "http://localhost/Powder.ba/#main";
        },
        error: function (xhr, status, error) {
          console.error("Error sending form data:", error);
        },
      });
    },
  });
});

function logout() {
  window.localStorage.clear();
}

if (!Utilis.get_from_localstorage("user")) {
  window.location = "http://localhost/Powder.ba/#login";
}

function deleteP(id) {
  if (confirm("Are you sure you want to delete?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/products/delete/byid?id=${id}`,
      method: "DELETE",
      headers: {
        Authentication: JSON.parse(usert).data.token,
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

function deleteO(id) {
  if (confirm("Are you sure you want to delete?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/orders/delete/byid?id=${id}`,
      method: "DELETE",
      headers: {
        Authentication: JSON.parse(usert).data.token,
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

function updateOrder(id) {
  if (confirm("Are you sure you want to update order?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/orders/update/byid?id=${id}`,
      method: "UPDATE",
      headers: {
        Authentication: JSON.parse(usert).data.token,
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
  if (confirm("Are you sure you want to delete order?")) {
    $.ajax({
      url: `http://localhost/Powder.ba/backend/users/delete/byid?id=${id}`,
      method: "DELETE",
      headers: {
        Authentication: JSON.parse(usert).data.token,
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

function editProduct(id) {
  console.log(id);
  $.ajax({
    url: `http://localhost/Powder.ba/backend/products/get/byid?id=${id}`,
    method: "GET",
    headers: {
      Authentication: JSON.parse(usert).data.token,
    },
    beforeSend: function (xhr) {
      if (Utilis.get_from_localstorage("user")) {
        xhr.setRequestHeader("Authentication", JSON.parse(usert).data.token);
      }
    },
    success: function (response) {
      console.log("Response:", response); // Check the response in the console
      // Assuming response is an array of items
      var item = response.find(function (item) {
        return item.id == id;
      });
      if (!item) {
        console.error("Item not found with ID:", id);
        return;
      }
      var html = `
        <div class="modal show" id="exampleModale" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Edit Product</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="showEdit()">
                  X
                </button>
              </div>
              <div class="modal-body">
                <!-- Modal body content goes here -->
                <div style="display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; justify-content: space-between;">
                    <img src="${item.productImg}" alt="Product Image" style="max-height: 100px; max-width: 100px;">
                    <input type="text" name="image" id="addimage" value="${item.productImg}">
                    <p>Add Image link</p>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>${item.productName}</span>
                    <input type="text" name="productName" id="productName" value="${item.productName}">
                    <p>Product Name</p>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>${item.flavour}</span>
                    <input type="text" name="flavour" id="flavour" value="${item.flavour}">
                    <p>Flavour</p>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>${item.price}</span>
                    <input type="text" name="price" id="price" value="${item.price}">
                    <p>Price</p>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>${item.description}</span>
                    <input type="text" name='desc' id="desc" value="${item.description}">
                    <p>Description</p>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>${item.category}</span>
                    <input type="text" name='category' id="category" value="${item.category}">
                    <p>Category</p>
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" onclick="showEdit()">Close</button>
                <button type="submit" class="btn btn-primary">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      `;
      $("#modalje").append(html);
      $("#exampleModale").show();
      $(document).ready(function () {
        $("#modalje").validate({
          rules: {},
          submitHandler: function (form, event) {
            event.preventDefault();

            var formData = $(form).serializeArray();

            console.log(formData);

            $.ajax({
              url: `http://localhost/Powder.ba/backend/products/update/${id}`,
              method: "PUT",
              data: formData,
              headers: {
                Authentication: JSON.parse(usert).data.token,
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
                location.reload();
              },
              error: function (xhr, status, error) {
                console.error("Error sending form data:", error);
              },
            });
          },
        });
      });
    },
    error: function (xhr, status, error) {
      console.error("Error:", status, error); // Log any errors
    },
  });
}
