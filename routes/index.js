const router = require('koa-router')();

// home
router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Bugs Rate',
        allTask: ctx._jiraTask
    });
});

module.exports = router;
