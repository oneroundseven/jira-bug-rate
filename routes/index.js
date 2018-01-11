const router = require('koa-router')();
const debug = require('debug')('route:home');

// home
router.get('/', async (ctx, next) => {
    await ctx.render('index', {
        title: 'Bugs Rate',
        allTask: ctx._jiraTask
    });
});

module.exports = router;
