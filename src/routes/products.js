import {
  Router
} from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

const productsFilePath = path.resolve('src/data/productos.json');

const readProducts = async () => {
  try {
    const data = await fs.readFile(productsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
};

const writeProducts = async (products) => {
  try {
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error writing products file:', error);
  }
};

router.get('/', async (req, res) => {
  const products = await readProducts();

  res.render('home', {
    products
  });
});

router.get('/:id', async (req, res) => {
  const products = await readProducts();
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (product) {
    res.json(product);
  } else {
    res.status(404).send({
      error: 'Producto no encontrado'
    });
  }
});

router.post('/', async (req, res) => {
  const products = await readProducts();
  const {
    title,
    description,
    code,
    price,
    status = true,
    stock,
    category,
    thumbnails = []
  } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios excepto thumbnails'
    });
  }

  const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;

  const newProduct = {
    id: newId,
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  };

  products.push(newProduct);
  await writeProducts(products);

  res.status(201).json({
    status: 'Success',
    product: newProduct
  });
});

router.put('/:pid', async (req, res) => {
  const products = await readProducts();
  const pid = parseInt(req.params.pid);
  const product = products.find(p => p.id === pid);

  if (product) {
    if (req.body.title) product.title = req.body.title;
    if (req.body.description) product.description = req.body.description;
    if (req.body.code) product.code = req.body.code;
    if (req.body.price) product.price = req.body.price;
    if (req.body.status !== undefined) product.status = req.body.status;
    if (req.body.stock) product.stock = req.body.stock;
    if (req.body.category) product.category = req.body.category;
    if (req.body.thumbnails) product.thumbnails = req.body.thumbnails;

    await writeProducts(products);
    res.json({
      status: 'Success',
      product
    });
  } else {
    res.status(404).send({
      error: 'Producto no encontrado'
    });
  }
});

router.delete('/:pid', async (req, res) => {
  const products = await readProducts();
  const pid = parseInt(req.params.pid);
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex !== -1) {
    products.splice(productIndex, 1);
    await writeProducts(products);
    res.json({
      status: 'Success',
      message: 'Producto eliminado correctamente'
    });
  } else {
    res.status(404).send({
      error: 'Producto no encontrado'
    });
  }
});

export default router;