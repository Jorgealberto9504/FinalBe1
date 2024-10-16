import { Router } from 'express';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

const router = Router();

// Obtener todos los carritos
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.find().populate('products.product').lean();
    res.json(carts);
  } catch (error) {
    console.error('Error al obtener carritos:', error);
    res.status(500).json({ error: 'Error al obtener carritos' });
  }
});

// Obtener un carrito por ID
router.get('/:id', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate('products.product').lean();
    if (cart) {
      res.json(cart);
    } else {
      res.status(404).json({ error: 'Carrito no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = new Cart({ products: [] });
    await newCart.save();
    res.status(201).json({ status: 'success', cart: newCart });
  } catch (error) {
    console.error('Error al crear el carrito:', error);
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

// Agregar un producto a un carrito
router.post('/:cartId/products', async (req, res) => {
  const { cartId } = req.params;
  const { productId, quantity } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const existingProduct = cart.products.find(p => p.product.equals(productId));
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// Eliminar un producto de un carrito (opcional)
router.delete('/:cartId/products/:productId', async (req, res) => {
  const { cartId, productId } = req.params;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => !p.product.equals(productId));
    await cart.save();

    res.json({ status: 'Success', message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
});

export default router;