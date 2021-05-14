const core = require('./core.js').core;
const koaBody = require('koa-body');
const fs = require('fs');

module.exports = {
    api: (router) => {
        router.get('/', async ctx => ctx.body = "hello world");
        router.post('/laserify', koaBody({ multipart: true }), async (ctx, next) => {
            const baseImage = ctx.request.files.image.path;
            const outputFilename = Date.now().toString() + '.png';
            const result = await core(baseImage, './images/laser-flare.webp', outputFilename);
            ctx.response.status = 200;
            ctx.attachment('laser-eyes.jpg');
            ctx.response.body = fs.createReadStream(outputFilename);
        });
    }
};
