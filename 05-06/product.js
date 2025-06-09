let products = [];

function Product(id,name,price,quantity) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.quantity = quantity;
}

function changePrice(newPrice) {
    this.price = newPrice;
}

function changeQuantity(newQuantity) {
    this.quantity = newQuantity;
}

function addProduct() {
    const Name = document.getElementById("name").value.trim();
    const Price = document.getElementById("price").value;
    const Quantity = document.getElementById("quantity").value;

    if (Name === "" || Price === "" || Quantity === "") {
        alert("All the fields are required");
        return;
    }

    const name = Name.toUpperCase();
    const price = Number(Price);
    const quantity = Number(Quantity);

    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert("Product name already exists.");
        return;
    }

    products.push(new Product(products.length + 1, name, price, quantity));

    document.getElementById("name").value = '';
    document.getElementById("price").value = '';
    document.getElementById("quantity").value = '';
}

function updateProduct() {
    const id = Number(document.getElementById("id").value);
    const u_price = document.getElementById("updatedPrice").value;
    const u_quantity = document.getElementById("updatedQuantity").value;

    let flag = false;
    let i;
    for (i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            flag = true;
            break;
        }
    }
    if(!flag) {
        alert("Invalid Id");
        return;
    }

    if (u_price === "" && u_quantity === "") {
        alert("Enter atleast one of Price or Quantity field to update");
        return;
    }
    if (u_price !== "") {
        products[i].changePrice(Number(u_price));
    }
    if (u_quantity !== "") {
        products[i].changeQuantity(Number(u_quantity));
    }

    displayProducts();

    document.getElementById("id").value = '';
    document.getElementById("updatedPrice").value = '';
    document.getElementById("updatedQuantity").value = '';
}

function displayProducts() {
    // const output = products.map(p => `Id: ${p.id}, Name: ${p.name}, Price: ${p.price}, Quantity: ${p.quantity}`).join("\n");
    // document.getElementById('productList').textContent = output || "No products.";

    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">No products available.</td></tr>`;
        return;
    }

    products.forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>`;

        tbody.appendChild(row);
    });
}

function showProduct() {
    const Id = document.getElementById("d_id").value;

    if(Id === "") {
        console.log("Id is required");
        return;
    }

    const id = Number(Id);

    let flag = false;
    let i;
    for (i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            flag = true;
            break;
        }
    }
    if(!flag) {
        alert("Invalid Id");
        return;
    }

    const body = document.getElementById("deleteTableBody");
    body.innerHTML = "";
    const row = document.createElement("tr");

    row.innerHTML = `
        <td>${products[i].id}</td>
        <td>${products[i].name}</td>
        <td>${products[i].price}</td>
        <td>${products[i].quantity}</td>
    `;

    body.appendChild(row);

    document.getElementById("confirmDelete").style.display = "inline-block";
    document.getElementById("cancelDelete").style.display = "inline-block";
}

function cancelDelete() {
    const body = document.getElementById("deleteTableBody");
    body.innerHTML = "";

    document.getElementById("d_id").value = "";
    
    document.getElementById("confirmDelete").style.display = "none";
    document.getElementById("cancelDelete").style.display = "none";
}

function deleteProduct() {
    const id = document.getElementById("d_id").value;
    const index = products.findIndex(p => p.id === id);
    products.splice(index,1);

    displayProducts();
    cancelDelete();
}