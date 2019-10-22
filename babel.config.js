module.exports = {
    presets: [
        '@babel/env',
    ],
    plugins: [
        '@babel/plugin-transform-block-scoping',
        '@babel/plugin-transform-async-to-generator',
        '@babel/plugin-proposal-object-rest-spread',
        '@babel/plugin-proposal-class-properties',
    ],
};
