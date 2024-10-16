import {
  Router
} from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();
const cartsFilePath = path.resolve('src/data/carritos.json');
const productsFilePath = path.resolve('src/data/productos.json');

const readCarts = async () => {
  try {
    const data = await fs.readFile(cartsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading carts file:', error);
    return [];
  }
};

const writeCarts = async (carts) => {
  try {
    await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
  } catch (error) {
    console.error('Error writing carts file:', error);
  }
};

router.get('/', async (req, res) => {
  const carts = await readCarts();
  res.json(carts);
});

router.get('/:id', async (req, res) => {
  const carts = await readCarts();
  const id = parseInt(req.params.id);
  const cart = carts.find(c => c.id === id);

  if (cart) {
    res.json(cart);
  } else {
    res.status(404).send({
      error: 'Carrito no encontrado'
    });
  }
});

router.post('/', async (req, res) => {
  const carts = await readCarts();
  const newCart = {
    id: carts.length + 1,
    products: []
  };
  carts.push(newCart);
  await writeCarts(carts);
  res.status(201).json({
    status: 'success',
    cart: newCart
  });
});

router.post('/:cartId/products', async (req, res) => {
  const cartId = parseInt(req.params.cartId);
  const {
    productId,
    quantity
  } = req.body;

  const carts = await readCarts();
  const cart = carts.find(c => c.id === cartId);
  if (!cart) {
    return res.status(404).send({
      error: 'Carrito no encontrado'
    });
  }

  const products = await fs.readFile(productsFilePath, 'utf-8');
  const productList = JSON.parse(products);
  const product = productList.find(p => p.id === productId);
  if (!product) {
    return res.status(404).send({
      error: 'Producto no encontrado'
    });
  }

  const existingProduct = cart.products.find(p => p.id === productId);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.products.push({
      ...product,
      quantity
    });
  }

  await writeCarts(carts);
  res.status(200).json(cart);
});

export default router;