const socket = io();

socket.on('productAdded', (product) => {
  const productList = document.getElementById('productList');
  const newProductElement = document.createElement('li');
  newProductElement.id = `product-${product.id}`;
  newProductElement.textContent = `${product.title} - Precio: ${product.price}`;
  productList.appendChild(newProductElement);
});

socket.on('productDeleted', (product) => {
  const productElement = document.getElementById(`product-${product.id}`);
  if (productElement) {
    productElement.remove();
  }
});