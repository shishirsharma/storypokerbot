const webpack = require('webpack'); //to access built-in plugins
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const config = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'js/webpack.bundle.js'
    },
    module: {
        rules: [
            { test: /\.txt$/, use: 'raw-loader' },
            { test: /\.(s*)css$/, use: ExtractTextPlugin.extract({ fallback:'style-loader', use:['css-loader','sass-loader',] })  },
            { test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/, use: 'url-loader?name=[name].[ext]&limit=10000&publicPath=fonts/&outputPath=styles/fonts/', },
            { test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/, use: 'file-loader?name=[name].[ext]&publicPath=fonts/&outputPath=styles/fonts/', },
            { test: /\.(jpe?g|png|gif|svg)$/i, use: [ 'file-loader?name=images/[name].[ext]&outputPath=', 'image-webpack-loader?bypassOnDebug' ] }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({template: './src/index.html'}),
        new ExtractTextPlugin("styles/app.bundle.styles.css")
    ]
};

module.exports = config;
