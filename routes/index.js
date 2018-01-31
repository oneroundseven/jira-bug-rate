const router = require('koa-router')();
const debug = require('debug')('route:home');

// home
router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Bugs Rate',
        allTask: ctx._jiraTask
    });
});

router.get('/search', async (ctx, next)=> {
    let result = [];
    let localCacheData = ctx._jiraTask;
    let version = ctx.query.version;

    if (localCacheData) {
        localCacheData.each((version)=> {
            if (version['fixVersion'].indexOf(version) !== -1) {
                result.push(version);
            }
        });
    }

    await ctx.render('index', {
        title: 'Bugs Rate',
        allTask: result
    });
});

module.exports = router;
