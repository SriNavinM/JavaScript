let products = [];

function addProduct() {
    const name = document.getElementById("name").value.trim();
    const price = Number(document.getElementById("price").value);
    const quantity = Number(document.getElementById("quantity").value);

    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert("Product name already exists.");
        return;
    }

    const product = {
        id: products.length + 1,
        name,
        price,
        quantity
    };

    products.push(product);

    document.getElementById("name").value = '';
    document.getElementById("price").value = '';
    document.getElementById("quantity").value = '';
}

function updateProduct () {
    const id = Number(document.getElementById("id").value);
    const u_price = document.getElementById("updatedPrice").value;
    const u_quantity = document.getElementById("updatedQuantity").value;

    if(id < 1 || id > products.length) {
        alert("Invalid Id");
        return;
    }

    if(u_price !== "") {
        products[id-1].price = Number(u_price);
    }

    if(u_quantity !== "") {
        products[id-1].quantity = Number(u_quantity);
    }

    displayProducts();

    document.getElementById("id").value = '';
    document.getElementById("updatedPrice").value = '';
    document.getElementById("updatedQuantity").value = '';
}

function displayProducts() {
    const output = products.map(p => `Id: ${p.id}, Name: ${p.name}, Price: ${p.price}, Quantity: ${p.quantity}`).join("\n");
    document.getElementById('productList').textContent = output || "No products.";
}