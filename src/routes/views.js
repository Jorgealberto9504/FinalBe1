import { Router } from 'express';
import { Product } from '../models/Product.js'; // Importa el modelo de producto

const routes = Router();

// Obtener todos los productos y renderizar la vista
routes.get('/', async (req, res) => {
  try {
    const products = await Product.find().lean(); // Obtener productos como objetos simples
    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Crear un nuevo producto y emitir evento por WebSocket
routes.post('/', async (req, res) => {
  const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios excepto thumbnails'
    });
  }

  try {
    const newProduct = new Product({ title, description, code, price, status, stock, category, thumbnails });
    await newProduct.save(); // Guardar el nuevo producto en la base de datos

    req.io.emit('productAdded', newProduct); // Emitir evento a través de WebSocket

    res.status(201).json({ status: 'Success', product: newProduct });
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

// Eliminar un producto por ID y emitir evento por WebSocket
routes.delete('/:pid', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.pid);

    if (deletedProduct) {
      req.io.emit('productDeleted', deletedProduct); // Emitir evento a través de WebSocket
      res.json({ status: 'Success', message: 'Producto eliminado correctamente' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

export default routes;