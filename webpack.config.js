module.exports = {
    mode: 'none',
    target: [ 'web', 'es5' ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
            },
        ],
    },
};
