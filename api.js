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
                const eyeColor = ctx.request can I have a body and file upload at same time? //also is this error handling good enough
                const result = await core(baseImage, './laser-flare.webp', outputFilename);
                console.log(`result for ${baseImage} is `, JSON.stringify(result));
            } catch (e) {
                ctx.response.status = 400;
                if (e) {
                    ctx.response.body = { error: e.message || e };
                } else {
                    ctx.response.body = { error: 'Unknown error' };
                }
                return;
            }
            // await sleep(2000)
            ctx.response.status = 200;
            ctx.attachment('laser-eyes.jpg');
            ctx.response.body = fs.createReadStream(outputFilename);
        });
    }
};

function getAssetChoice(eyeColor) {
    const eyeColors = {
        'blue': 'blue-laser-eye.png',
        'red': 'laser-flare.webp',
    };
    const asset = eyeColors[eyeColor];
    if (!asset) {
        throw new Error(`Invalid eye color ${eyeColor}`);
    }
    return asset;
}

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}
