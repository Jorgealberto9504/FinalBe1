import {
  Router
} from 'express';
import fs from 'fs/promises';
import path from 'path';

const routes = Router();

const productsFilePath = path.resolve('src/data/productos.json');

const readProducts = async () => {
  try {
    const data = await fs.readFile(productsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error leyendo el archivo de productos:', error);
    return [];
  }
};

const writeProducts = async (products) => {
  try {
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error escribiendo el archivo de productos:', error);
  }
};

routes.get('/', async (req, res) => {
  const products = await readProducts();
  res.render('realTimeProducts', {
    products
  });
});

routes.post('/', async (req, res) => {
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

  req.io.emit('productAdded', newProduct);

  res.status(201).json({
    status: 'Success',
    product: newProduct
  });
});

routes.delete('/:pid', async (req, res) => {
  const products = await readProducts();
  const pid = parseInt(req.params.pid);
  const productIndex = products.findIndex(p => p.id === pid);

  if (productIndex !== -1) {
    const deletedProduct = products.splice(productIndex, 1)[0];
    await writeProducts(products);

    req.io.emit('productDeleted', deletedProduct);

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

export default routes;