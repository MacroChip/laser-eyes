const core = require('./core.js').core;
const koaBody = require('koa-body');
const fs = require('fs');

module.exports = {
    api: (router) => {
        router.get('/', async ctx => ctx.body = "hello world");
        router.get('/api', async ctx => {
            // await sleep(3000)
            return ctx.body = "hello world";
        });
        router.post('/api/laserify', koaBody({ multipart: true }), async (ctx, next) => {
            const baseImage = ctx.request.files.image.path;
            const outputFilename = Date.now().toString() + '.png';
            try {
                const result = await core(baseImage, './laser-flare.webp', outputFilename);
            } catch (e) {
                ctx.response.status = 400;
                ctx.response.body = { error: e }
                return;
            }
            // await sleep(2000)
            ctx.response.status = 200;
            ctx.attachment('laser-eyes.jpg');
            ctx.response.body = fs.createReadStream(outputFilename);
        });
    }
};

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}
