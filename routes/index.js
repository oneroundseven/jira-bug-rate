const router = require('koa-router')();
const debug = require('debug')('route:home');
const getLocalData = require('../modules/jiraFilter');

// home
router.get('/', async (ctx, next) => {
    debug('test info');
    let result = await getLocalData();
    await ctx.render('index', {
        title: 'Bugs Rate',
        allTask: result
    });
});

router.get('/search', async (ctx, next)=> {
    let likeVersion = ctx.query.version;
    let result = await getLocalData(likeVersion);

    await ctx.render('index', {
        title: 'Bugs Rate',
        allTask: result,
        hisSearch: likeVersion
    });
});

module.exports = router;
