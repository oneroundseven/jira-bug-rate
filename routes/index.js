const router = require('koa-router')();
const getLocalData = require('../modules/jiraFilter');

// home
router.get('/', async (ctx, next) => {
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
