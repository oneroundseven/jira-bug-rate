// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

require('./home.scss');

const a = '123';

(()=> {
    const b = async function() {
        await new Promise((resolve, reject) => {
            setTimeout(()=> {
                console.log('wait me');
                resolve();
            }, 2000);
        });
        console.log('test hello');
    }

    b();
})();