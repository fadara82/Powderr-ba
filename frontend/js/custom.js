const API_BASE_URL = "https://powderr-ba.onrender.com";
window.Utilis = {
  set_to_localstorage: function (key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },

  get_from_localstorage: function (key) {
    return JSON.parse(window.localStorage.getItem(key));
  },
  set_token: function (token) {
    window.localStorage.setItem("token", token);
  },

  get_token: function () {
    return window.localStorage.getItem("token");
  },
};

var stripe, elements, cardElement;

function initializeStripeElements() {
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
    cardElement.unmount();
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

      const totalPrice = parseFloat(localStorage.getItem("total_price")) || 0;
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const productDescriptions = cart
        .map((item) => item.description)
        .join(", ");

      const amount = Math.round(totalPrice * 100);

      $.ajax({
        url: API_BASE_URL + "/stripe/create-payment-intent",

        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ amount: amount }),
        beforeSend: function (xhr) {
          const token = Utilis.get_token();
          if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
          }
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
                alert("Payment failed: " + result.error.message);
                $("#order").attr("disabled", false);
              } else if (
                result.paymentIntent &&
                result.paymentIntent.status === "succeeded"
              ) {
                const orderData = {
                  firstName: $("#firstName").val(),
                  lastName: $("#lastName").val(),
                  email: $("#email").val(),
                  mobilenumber: $("#mobilenumber").val(),
                  city: $("#city").val(),
                  address: $("#address").val(),
                  paymentIntentId: result.paymentIntent.id,
                  total_price: totalPrice,
                  product_description: productDescriptions,
                };

                $.ajax({
                  url: API_BASE_URL + "/orders",
                  method: "POST",
                  contentType: "application/json",
                  data: JSON.stringify(orderData),
                  beforeSend: function (xhr) {
                    const token = Utilis.get_token();
                    if (token) {
                      xhr.setRequestHeader("Authorization", "Bearer " + token);
                    }
                  },

                  success: function () {
                    alert(
                      "Your order has been successfully processed. Thank you!"
                    );
                    $("#order").attr("disabled", false);
                    form.reset();
                    cardElement.clear();
                    window.location.hash = "#main";
                  },
                  error: function (xhr) {
                    alert(
                      "Error saving the order: " +
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
            "An error occurred during payment:" +
              (xhr.responseJSON?.error || "Something went wrong u redu")
          );
          $("#order").attr("disabled", false);
        },
      });
    },
  });

  return true;
}

function loadAndRenderProducts() {
  const container = $("#maindiv");
  const prevBtn = $("#prev");
  const nextBtn = $("#next");
  const pageInfo = $("#pageInfo");

  let products = [];
  let currentPage = 1;
  const itemsPerPage = 8;

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

  prevBtn.off("click").on("click", function () {
    if (currentPage > 1) renderPage(currentPage - 1);
  });

  nextBtn.off("click").on("click", function () {
    const totalPages = Math.ceil(products.length / itemsPerPage);
    if (currentPage < totalPages) renderPage(currentPage + 1);
  });

  $.ajax({
    url: API_BASE_URL + "/products/get",
    method: "GET",
    dataType: "json",

    success: function (data) {
      products = data;
      renderPage(1);
    },
    error: function (xhr, status, error) {
      console.log("Error loading data:", error);
    },
  });
}
function deleteP(id) {
  if (confirm("Are you sure you want to delete?")) {
    $.ajax({
      url: API_BASE_URL + `/products/delete/byid?id=${id}`,
      method: "DELETE",

      beforeSend: function (xhr) {
        const token = Utilis.get_token();

        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
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

function getId(id) {
  localStorage.setItem("pendingProductId", id);
  window.location.hash = "#shopitem";
}

function setupNavbar() {
  const hash = window.location.hash;

  if (hash.includes("login") || hash.includes("registration")) {
    $("#adminP").hide();
    $("#homeNav").hide();
    return;
  }

  const token = Utilis.get_token();

  if (token) {
    try {
      const payloadBase64 = token.split(".")[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      const role = payload.role || (payload.user && payload.user.role);

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
    $("#adminP").hide();
    $("#homeNav").show();
  }
}

function getProteini() {
  $.ajax({
    url: API_BASE_URL + "/products/get/proteini",
    method: "GET",
    dataType: "json",

    success: function (data) {
      renderCategory(data);
    },
    error: function (xhr, status, error) {
      console.log("Error loading proteini:");
      console.log("Status:", status);
      console.log("Error:", error);
      console.log("Response:", xhr.responseText);
    },
  });
}

function getVitamini() {
  $.ajax({
    url: API_BASE_URL + "/products/get/vitamini",
    method: "GET",
    dataType: "json",
    success: function (data) {
      renderCategory(data);
    },
    error: function (xhr, status, error) {
      console.log("Error loading vitamini:");
      console.log("Status:", status);
      console.log("Error:", error);
      console.log("Response:", xhr.responseText);
    },
  });
}

function getKreatin() {
  $.ajax({
    url: API_BASE_URL + "/products/get/creatine",
    method: "GET",
    dataType: "json",

    success: function (data) {
      renderCategory(data);
    },
    error: function (xhr, status, error) {
      console.log("Error loading kreatin:", error);
    },
  });
}

function getCokoladice() {
  $.ajax({
    url: API_BASE_URL + "/products/get/healthybar",
    method: "GET",
    dataType: "json",

    success: function (data) {
      renderCategory(data);
    },
    error: function (xhr, status, error) {
      console.log("Error loading cokoladice:", error);
    },
  });
}

$("#btnCart")
  .off("click")
  .on("click", function (e) {
    e.preventDefault();

    var token = Utilis.get_token();

    if (!token) {
      $("#loginPromptModal").modal("show");

      $("#loginNowBtn")
        .off("click")
        .on("click", function () {
          $("#loginPromptModal").modal("hide");
          window.location.hash = "#login";
          location.reload();
        });

      $("#loginCancelBtn")
        .off("click")
        .on("click", function () {
          $("#loginPromptModal").modal("hide");
        });

      return;
    }
    renderCart();
    window.location.hash = "#shopingcart";
  });

function renderCategory(data) {
  $("#maindiv").empty();
  data.forEach((item) => {
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
    $("#maindiv").append(html);
  });
  $(".edit").hide();
}

function checkProductAvailability(id, callback) {
  $.ajax({
    url: API_BASE_URL + `/products/get/byid?id=${id}`,
    method: "GET",
    beforeSend: function (xhr) {
      const token = Utilis.get_token();
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      }
    },
    success: function (product) {
      if (!product) {
        alert("Product not found!");
        callback(null);
        return;
      }
      if (product.quantity <= 0) {
        alert(`Product "${product.productName}" is currently out of stock!`);
        callback(null);
        return;
      }
      callback(product);
    },
    error: function () {
      alert("Error retrieving the product.");
      callback(null);
    },
  });
}

function addToCart(id) {
  const token = Utilis.get_token();
  if (!token) {
    const loginModal = new bootstrap.Modal(
      document.getElementById("loginPromptModal")
    );
    loginModal.show();

    document.getElementById("loginNowBtn").onclick = function () {
      loginModal.hide();
      window.location.hash = "#login";
      location.reload();
    };
    return;
  }

  checkProductAvailability(id, function (product) {
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
      alert(
        `Product "${product.productName}" already in the cart. Quantity has been increased.`
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
      alert(`Product  "${product.productName}" has been added to the cart!`);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  });
}

function renderCart() {
  let totalprice = 0;
  let data = JSON.parse(localStorage.getItem("cart")) || [];

  $("#usersdiv").empty();
  $("#cartDiv").empty();

  data.forEach((item) => {
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

  let shipping = 7;
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
      let codeValue = $(this).val();
      if (codeValue === "FIRST ORDER") {
        let discount = totalprice * 0.2;
        $("#total").text((totalprice - discount).toFixed(2) + " BAM");
      } else {
        $("#total").text(totalprice.toFixed(2) + " BAM");
      }
    });

  localStorage.setItem("total_price", totalprice);
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

function logout() {
  window.localStorage.clear();
  window.location.href = "#login";
  location.reload();
}

$(document).ready(() => {
  setupNavbar();
});

function unhideER() {
  $(".edit").toggle();
  console.log("Kuca Da");
}

function editProduct(id) {
  console.log(id);
  $.ajax({
    url: API_BASE_URL + `/products/get/byid?id=${id}`,
    method: "GET",
    beforeSend: function (xhr) {
      const token = Utilis.get_token();
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      }
    },
    success: function (item) {
      if (!item || item.id != id) {
        console.error("Item not found with ID:", id);
        return;
      }

      var html = `
                <form class="modal show" id="exampleModale" tabindex="-1" role="dialog" style="display:block;">
                  <div class="modal-dialog" role="document">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">Edit Product</h5>
                        <button type="button" class="close" aria-label="Close" onclick="$('#exampleModale').remove()">
                          <span aria-hidden="true">&times;</span>
                        </button>
                      </div>
                      <div class="modal-body" style="display:flex; flex-direction:column; gap:10px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                          <img src="${item.productImg}" style="max-height:100px; max-width:100px;">
                          <input type="text" name="image" id="addimage" value="${item.productImg}" placeholder="Add Image link" style="flex:1;">
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <label style="flex-basis:150px;">Product Name</label>
                          <input type="text" name="productName" value="${item.productName}" style="flex:1;">
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <label style="flex-basis:150px;">Flavour</label>
                          <input type="text" name="flavour" value="${item.flavour}" style="flex:1;">
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <label style="flex-basis:150px;">Price</label>
                          <input type="text" name="price" value="${item.price}" style="flex:1;">
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                          <label style="flex-basis:150px;">Description</label>
                          <input type="text" name="desc" value="${item.description}" style="flex:1;">
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                          <label style="width:150px;">Category</label>
                          <input type="text" id="categoryText" value="${item.category}" style="flex:1; padding:5px; border:1px solid #ccc; border-radius:5px;">
                          <select id="categorySelect" style="flex:1; padding:5px; border:1px solid #ccc; border-radius:5px;">
                            <option value="">Select Category</option>
                            <option value="Proteini">Proteini</option>
                            <option value="Vitamini">Vitamini</option>
                            <option value="Creatine">Creatine</option>
                            <option value="Cokoladice">Cokoladice</option>
                          </select>
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
          price: { required: true, number: true },
        },
        submitHandler: function (form, event) {
          event.preventDefault();

          var formDataArray = $(form).serializeArray();
          var formData = {};
          formDataArray.forEach(function (field) {
            formData[field.name] = field.value;
          });

          var categorySelect = $("#categorySelect").val();
          var categoryText = $("#categoryText").val();
          formData["category"] = categorySelect || categoryText || "";

          $.ajax({
            url: API_BASE_URL + `/products/update/${id}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(formData),
            beforeSend: function (xhr) {
              const token = Utilis.get_token();
              if (token) {
                xhr.setRequestHeader("Authorization", "Bearer " + token);
              }
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

function deleteUser(id) {
  if (confirm("Are you sure you want to delete this user?")) {
    $.ajax({
      url: API_BASE_URL + `/users/delete/byid?id=${id}`,
      method: "DELETE",
      beforeSend: function (xhr) {
        const token = Utilis.get_token();
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
      },
      success: function (response) {
        console.log("Delete successful:", response);
        alert("User deleted successfully!");
        window.location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error deleting user:", error);
        console.log("Response text:", xhr.responseText);
        alert("Failed to delete user: " + xhr.responseText);
      },
    });
  }
}

function showModal() {
  $("#exampleModal").toggle();
}
function showEdit() {
  $("#exampleModale").toggle();
}

function deleteUsers(id) {
  if (confirm("Are you sure you want to delete user?")) {
    $.ajax({
      url: API_BASE_URL + `/users/delete/byid?id=${id}`,
      method: "DELETE",
      beforeSend: function (xhr) {
        const token = Utilis.get_token();
        if (token) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
      },
      success: function () {
        window.location.reload();
      },
      error: function (xhr, status, error) {
        console.error("Error deleting the user:", error);
      },
    });
  }
}

function initProfileModals() {
  $("#editDataBtn")
    .off("click")
    .on("click", () => {
      const token = Utilis.get_token();
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return;
      }

      $.ajax({
        url: API_BASE_URL + "/user/editme",
        method: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: function (res) {
          if (!res.user) {
            alert("Korisnik nije pronađen!");
            return;
          }

          const modal = $("#editDataModal");
          modal.find("#fname").val(res.user.first_name);
          modal.find("#lname").val(res.user.last_name);
          modal.find("#email").val(res.user.email);
          modal.find("#mobile").val(res.user.mobile_number);
          modal.addClass("show");
        },
        error: function (xhr) {
          alert(xhr.responseJSON?.error || "Greška pri dohvaćanju podataka");
        },
      });
    });

  // --- Save Edit ---
  $(document)
    .off("click", "#saveEditBtn")
    .on("click", "#saveEditBtn", function () {
      const modal = $("#editDataModal");
      const payload = {
        first_name: modal.find("#fname").val(),
        last_name: modal.find("#lname").val(),
        email: modal.find("#email").val(),
        mobile_number: modal.find("#mobile").val(),
      };

      const token = Utilis.get_token();
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return;
      }

      $.ajax({
        url: API_BASE_URL + "/user/update",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: function (res) {
          alert(res.message || "Podaci uspješno ažurirani");
          modal.removeClass("show");
          window.location.reload();
        },
        error: function (xhr) {
          alert(xhr.responseJSON?.error || "Greška pri spremanju promjena");
        },
      });
    });

  $("#changePasswordBtn")
    .off("click")
    .on("click", () => {
      const token = Utilis.get_token();
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return;
      }
      $("#changePasswordModal").addClass("show");
    });

  $("#savePasswordBtn")
    .off("click")
    .on("click", () => {
      const modal = $("#changePasswordModal");
      const inputs = modal.find("input");
      const currentPassword = inputs.eq(0).val();
      const newPassword = inputs.eq(1).val();
      const confirmPassword = inputs.eq(2).val();

      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Please fill all fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const token = Utilis.get_token();
      if (!token) {
        alert("Niste prijavljeni! Molimo prijavite se.");
        return;
      }

      const payload = { newPassword: newPassword };

      $.ajax({
        url: API_BASE_URL + "/change-password",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload),
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + token);
        },
        success: function (res) {
          alert(res.message || "Password changed successfully");
        },
        error: function (xhr) {
          console.log("RAW response:", xhr.responseText);
          alert(xhr.responseJSON?.error || "Error changing password");
        },
      });
    });

  $(document)
    .off("click", ".closeModal")
    .on("click", ".closeModal", function () {
      $(this).closest(".modal-custom").removeClass("show");
    });
}

$(document).ready(function () {
  $("main#spapp > section").height($(document).height() - 60);

  var app = $.spapp({
    defaultView: "#main",
    templateDir: "./tmpl/",
  });

  app.route({
    view: "main",
    load: "home.html",
    onReady: function () {
      setupNavbar();

      loadAndRenderProducts();
    },
  });

  app.route({
    view: "registration",
    load: "registration.html",
    onReady: function () {
      $("#regform").validate({
        rules: {
          fname: { required: true, minlength: 2 },
          lname: { required: true, minlength: 2 },
          email: { required: true, email: true },
          password: { required: true, minlength: 6 },
          cpassword: { required: true, equalTo: "#floatingPassword" },
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
            url: API_BASE_URL + "/users",
            method: "POST",
            data: formData,
            success: function (response) {
              console.log("Form data sent successfully:", response);
              window.location.href = "#login";
              location.reload();
            },

            error: function (xhr, status, error) {
              console.error("Error sending form data:", error);
              alert("This email or mobile phone is already registered");
            },
          });
        },
      });
    },
  });

  app.route({
    view: "login",
    load: "login.html",
    onReady: function () {
      $("#loginform").validate({
        rules: {
          email: { required: true, email: true },
          password: { required: true },
        },
        messages: {
          email: {
            required: "Please enter your email",
            email: "Enter a valid email address",
          },
          password: {
            required: "Please enter your password",
          },
        },
        submitHandler: function (form, event) {
          event.preventDefault();

          var formData = $(form).serialize();
          console.log("Form data:", formData);

          $.ajax({
            url: API_BASE_URL + "/login",
            method: "POST",
            data: formData,

            beforeSend: function () {
              $.blockUI({ message: "Please wait" });
            },

            success: function (response) {
              console.log("Login response:", response);

              if (
                response.data &&
                response.data.success &&
                response.data.token
              ) {
                Utilis.set_token(response.data.token);

                const token = response.data.token;
                const payloadBase64 = token.split(".")[1];
                const payloadJson = atob(payloadBase64);
                const payload = JSON.parse(payloadJson);
                const role =
                  payload.role || (payload.user && payload.user.role);
                console.log("User role:", role);

                $.unblockUI();
                $("a[href='#profileusers']").show();

                setupNavbar();

                if (role === "admin") {
                  window.location.hash = "#admin";
                } else {
                  window.location.hash = "#main";
                }
              } else {
                $.unblockUI();
                alert(response.message || "Invalid login credentials!");
              }
            },
            error: function (xhr, status, error) {
              $.unblockUI();
              console.error("Login error:", xhr.responseText);
              alert("Server error: " + xhr.responseText);
            },
            complete: function () {
              $.unblockUI();
              $(".modal-backdrop").remove();
              $("body").removeClass("modal-open").css("overflow", "auto");
            },
          });
        },
      });
    },
  });

  app.route({
    view: "shopitem",
    load: "shopitem.html",
    onReady: function () {
      const pendingId = localStorage.getItem("pendingProductId");
      if (!pendingId) return;

      $("#shopitemdiv").html(`
  <div class="loading-full">
    <h3>Loading...</h3>
  </div>
`);
      $.get(
        API_BASE_URL + "/products/get/byid?id=" + pendingId,
        function (product) {
          localStorage.setItem("currentProduct", JSON.stringify(product));

          let images =
            product.images && product.images.length > 0
              ? product.images
              : [product.productImg];

          let carouselItems = "";
          images.forEach((img, i) => {
            carouselItems += `
          <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img class="d-block w-100" src="${img}" alt="Product image ${
              i + 1
            }">
          </div>`;
          });

          let html = `
        <div class="col-md-6">
          <div id="productCarousel" class="carousel slide" data-ride="carousel">
            <div class="carousel-inner">${carouselItems}</div>
            <a class="carousel-control-prev" href="#productCarousel" role="button" data-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </a>
            <a class="carousel-control-next" href="#productCarousel" role="button" data-slide="next">
              <span class="carousel-control-next-icon"></span>
            </a>
          </div>
        </div>

        <div class="col-md-6">
          <h1 class="display-5 fw-bolder title">${product.productName}</h1>
          <div class="fs-5 mb-5"><span>${product.price} KM</span></div>
          <p class="lead">${product.description}<p class="flavour">Flavour: ${product.flavour}</p></p>
          <div class="d-flex">
            <button class="btn btn-outline-dark flex-shrink-0" type="button" onclick="addToCart(${product.id})">
              <i class="bi-cart-fill me-1"></i> Add to cart
            </button>
          </div>
        </div>

        <div class="back-to-shop mt-3">
          <a href="#main" class="btn-outline-small">
            <i class="fas fa-long-arrow-alt-left me-2"></i>Back to shop
          </a>
        </div>
      `;

          $("#shopitemdiv").empty().append(html);
        }
      );
    },
  });

  app.route({
    view: "admin",
    load: "admin.html",
    onReady: function () {
      setupNavbar();

      loadAndRenderProducts();

      $(document).on("submit", "#a", function (e) {
        e.preventDefault();
        if ($(this).data("submitted")) return;
        $(this).data("submitted", true);

        let formDataObj = {};
        $(this)
          .serializeArray()
          .forEach((field) => {
            formDataObj[field.name] = field.value;
          });

        $.ajax({
          url: API_BASE_URL + "/products",
          method: "POST",
          data: JSON.stringify(formDataObj),
          contentType: "application/json",
          beforeSend: function (xhr) {
            const token = Utilis.get_token();
            if (token) {
              xhr.setRequestHeader("Authorization", "Bearer " + token);
            }
          },
          success: function (response) {
            console.log("Proizvod dodan:", response);
            loadAndRenderProducts();
            $("#a")[0].reset();
            location.reload();
          },
          error: function (xhr, status, error) {
            console.error("Greška:", error);
          },
          complete: function () {
            $("#a").data("submitted", false);
          },
        });
      });
    },
  });

  app.route({
    view: "checkout",
    load: "checkout.html",
    onReady: function () {
      const token = Utilis.get_token();
      if (!token) {
        $("#checkoutPromptModal").modal("show");

        $("#checkoutLoginBtn")
          .off("click")
          .on("click", function () {
            $("#checkoutPromptModal").modal("hide");
            window.location.hash = "#login";
            location.reload();
          });

        $("#checkoutCancelBtn")
          .off("click")
          .on("click", function () {
            window.location.hash = "#main";
          });

        return;
      }

      initializeStripeElements();
      renderCart();
    },
  });

  app.route({
    view: "shopingcart",
    load: "shopingcart.html",
    onReady: function () {
      const token = Utilis.get_token();
      if (!token) {
        $("#loginPromptModal").modal("show");

        $("#loginNowBtn")
          .off("click")
          .on("click", function () {
            $("#loginPromptModal").modal("hide");
            window.location.hash = "#login";
            location.reload();
          });

        $("#loginCancelBtn")
          .off("click")
          .on("click", function () {
            $("#loginPromptModal").modal("hide");
            window.location.hash = "#main"; // vraćanje na main
          });

        return;
      }

      renderCart();
    },
  });

  app.route({
    view: "users",
    load: "users.html",
    onReady: function () {
      renderCart();

      function getUsers() {
        $.ajax({
          url: API_BASE_URL + "/users/get",
          method: "GET",
          dataType: "json",
          beforeSend: function (xhr) {
            const token = Utilis.get_token();
            if (token) {
              xhr.setRequestHeader("Authorization", "Bearer " + token);
            }
          },
          success: function (data) {
            console.log("Users data:", data);
            renderUsers(data);

            $("#example").DataTable();
          },
          error: function (xhr, status, error) {
            console.error("Greška pri učitavanju korisnika:", error);
            if (xhr.status === 401) {
              alert("You are not authorized. Please log in again.");
            }
          },
        });
      }

      function renderUsers(users) {
        $("#usersdiv").empty();
        users.forEach((user, index) => {
          let row = `
      <tr>
        <td>${index + 1}</td>
        <td>${user.first_name}</td>
        <td>${user.last_name}</td>
        <td>${user.email}</td>
        <td>${user.mobile_number}</td>
        <td>
          <!-- Ovdje možeš dodati dugmad za upravljanje, npr. brisanje ili uređivanje -->
          <button class="btn btn-danger btn-sm deleteUserBtn" data-id="${
            user.id
          }">Delete</button>
        </td>
      </tr>
    `;
          $("#usersdiv").append(row);
        });
      }

      $(document).ready(function () {
        getUsers();

        $("#usersdiv").on("click", ".deleteUserBtn", function () {
          const id = $(this).data("id");
          if (confirm("Jeste li sigurni da želite obrisati korisnika?")) {
            deleteUser(id);
          }
        });
      });

      function deleteUser(id) {
        $.ajax({
          url: API_BASE_URL + `/users/delete/byid?id=${id}`,
          method: "DELETE",
          beforeSend: function (xhr) {
            const token = Utilis.get_token();
            if (token) {
              xhr.setRequestHeader("Authorization", "Bearer " + token);
            }
          },
          success: function () {
            alert("User successfully deleted.");
            getUsers();
          },
          error: function (xhr, status, error) {
            console.error("Greška pri brisanju korisnika:", error);
            alert("An error occurred while deleting the user.");
          },
        });
      }
    },
  });

  app.route({
    view: "orders",
    load: "orders.html",
    onReady: function () {
      renderCart();

      $.get({
        url: API_BASE_URL + "/orders/get",
        beforeSend: function (xhr) {
          const token = Utilis.get_token();
          if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
          }
        },
        success: function (data) {
          $("#tabeladiv").empty();

          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          let productsList = cart
            .map((p) => `${p.productName} (x${p.quantity})`)
            .join(",<br>");

          data.forEach((item) => {
            let htmlt = `
          <tr>
            <td>${item.id}</td>
            <td>${item.first_name}</td>
            <td>${item.last_name}</td>
            <td>${item.email}</td>
            <td>${item.mobile_number}</td>
            <td>${item.city}</td>
            <td>${item.address}</td>
            <td>${item.status}</td>
            <td>${item.total_price}</td>
            <td class="small-text">${productsList || "-"}</td>
            <td>
              <button class="updateOrderBtn btn btn-sm btn-success" data-id="${
                item.id
              }">✔️</button>
              <button class="updateOrder2Btn btn btn-sm btn-warning" data-id="${
                item.id
              }">↩</button>
              <button class="deleteOrderBtn btn btn-sm btn-danger" data-id="${
                item.id
              }">🗑️</button>
            </td>
          </tr>`;
            $("#tabeladiv").append(htmlt);
          });
        },
        error: function (xhr, status, error) {
          console.error("Greška pri učitavanju narudžbi:", error);
        },
      });

      $("#tabeladiv")
        .on("click", ".updateOrderBtn", function () {
          updateOrder($(this).data("id"));
        })
        .on("click", ".updateOrder2Btn", function () {
          updateOrder2($(this).data("id"));
        })
        .on("click", ".deleteOrderBtn", function () {
          deleteO($(this).data("id"));
        });

      function updateOrder(id) {
        if (confirm("Update order?")) {
          $.ajax({
            url: API_BASE_URL + `/orders/update/byid?id=${id}`,
            type: "PUT",
            beforeSend: function (xhr) {
              const token = Utilis.get_token();
              if (token) {
                xhr.setRequestHeader("Authorization", "Bearer " + token);
              }
            },
            success: function () {
              alert("Order updated.");
              location.reload();
            },
            error: function (err) {
              console.error("Error updating:", err);
            },
          });
        }
      }

      function updateOrder2(id) {
        if (confirm("Update order (Back)?")) {
          $.ajax({
            url: API_BASE_URL + `/orders/updateB/${id}`,
            type: "PUT",
            beforeSend: function (xhr) {
              const token = Utilis.get_token();
              if (token) {
                xhr.setRequestHeader("Authorization", "Bearer " + token);
              }
            },
            success: function () {
              alert("Order updated (Back).");
              location.reload();
            },
            error: function (err) {
              console.error("Error updating (Back):", err);
            },
          });
        }
      }

      function deleteO(id) {
        if (confirm("Delete order?")) {
          $.ajax({
            url: API_BASE_URL + `/orders/delete/byid?id=${id}`,
            type: "DELETE",
            beforeSend: function (xhr) {
              const token = Utilis.get_token();
              if (token) {
                xhr.setRequestHeader("Authorization", "Bearer " + token);
              }
            },
            success: function () {
              alert("Order deleted.");
              $(`#tabeladiv button.deleteOrderBtn[data-id="${id}"]`)
                .closest("tr")
                .remove();
            },
            error: function (err) {
              console.error("Error deleting:", err);
            },
          });
        }
      }
    },
  });

  app.route({
    view: "profileusers",
    load: "profileusers.html",
    onReady: function () {
      var token = Utilis.get_token();

      if (!token) {
        $("#profilePromptModal").modal("show");

        $("#profileLoginBtn")
          .off("click")
          .on("click", function () {
            $("#profilePromptModal").modal("hide");
            window.location.hash = "#login";
            location.reload();
          });

        $("#profileCancelBtn")
          .off("click")
          .on("click", function () {
            $("#profilePromptModal").modal("hide");
            window.location.hash = "#main";
          });

        return;
      }

      initProfileModals();
    },
  });
  $(function () {
    $(document).on("click", ".back-to-shop a", function () {
      $(".modal-backdrop").remove();
      $("body").removeClass("modal-open").css("overflow", "auto");
      if ($.unblockUI) {
        $.unblockUI();
      }
    });
  });

  app.run();
});
