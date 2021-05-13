import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import Router from 'koa-router';
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

require('./api').default(router)

app
    .use(bodyparser())
    .use(cors())
    .use(router.routes())

const PORT = process.env.PORT || 8080;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
