import express from 'express';
import productsRouter from './routes/products.js';
import cartsRouter from './routes/carts.js';
import viewsRoute from './routes/views.js';
import {
  __dirname
} from './utils.js';
import handlebars from 'express-handlebars';
import {
  Server
} from 'socket.io';

const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.engine('handlebars', handlebars.engine());
app.set('views', __dirname + '/views');
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'));

const httpServer = app.listen(8080, () => {
  console.log('Server On');
});

const io = new Server(httpServer);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/realtimeproducts', viewsRoute);

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');
});