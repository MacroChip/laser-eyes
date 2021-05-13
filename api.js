export default (router) => {
    router.get('/', async ctx => ctx.body = "hello world");
    router.post('/laserify', async (ctx, next) => {
    });
};
