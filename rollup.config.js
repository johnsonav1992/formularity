const typescript = require( '@rollup/plugin-typescript' );
const peerDepsExternal = require( 'rollup-plugin-peer-deps-external' );
const resolve = require( '@rollup/plugin-node-resolve' ).default;
const commonjs = require( '@rollup/plugin-commonjs' );

module.exports = {
    input: 'src/index.tsx'
    , output: {
        dir: 'dist'
        , format: 'esm'
        , sourcemap: true
    }
    , plugins: [
        peerDepsExternal()
        , resolve()
        , typescript()
        , commonjs()
    ]
};
