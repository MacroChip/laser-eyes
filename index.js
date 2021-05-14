const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const fs = require('fs/promises');

const app = new Koa();
const router = new Router();

createGoogleApiJson();
require('./api').api(router)

app
    .use(cors())
    .use(router.routes())

const PORT = process.env.PORT || 8080;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);

async function createGoogleApiJson() {
    try {
        await fs.stat(env.process.GOOGLE_APPLICATION_CREDENTIALS);
    } catch (e) {
        await fs.writeFile(env.process.GOOGLE_APPLICATION_CREDENTIALS, env.process.GOOGLE_API_JSON);
    }
}
