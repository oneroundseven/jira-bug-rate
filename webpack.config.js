// Copyright 2018 FOCUS Inc.All Rights Reserved.

/**
 * @fileOverview UED-FE-Task
 * @author oneroundseven@gmail.com
 */

const path = require('path');

const PAGE_PATH = path.resolve(__dirname, './pages');
const OUT_PATH = path.resolve(__dirname, './static');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCssPlugins = new ExtractTextPlugin({
    filename: '[name].css',
    allChunks: true
});

module.exports = {
    devtool: "eval-source-map",
    entry: {
        'pages/home': PAGE_PATH + '/home/home.js'
    },
    output: {
        path: OUT_PATH,
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/, include: [PAGE_PATH], use: ['babel-loader']
            },
            {
                test: /\.css$/, use: extractCssPlugins.extract({ use: 'css-loader', fallback: 'style-loader' })
            },
            {
                test: /\.scss$/,
                use: extractCssPlugins.extract({
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: true,
                                config: {
                                    path: 'postcss.config.js'
                                }
                            }
                        },
                        { loader: 'sass-loader', options: { sourceMap: true } }
                    ],
                    fallback: "style-loader"
                }),

            }
        ]
    },
    resolve: {
        alias: {
            jquery: 'window.$'
        }
    },
    plugins: [
        extractCssPlugins
    ]
};