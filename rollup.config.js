/* eslint-disable @typescript-eslint/no-var-requires */
const typescript = require( '@rollup/plugin-typescript' );
const peerDepsExternal = require( 'rollup-plugin-peer-deps-external' );
const resolve = require( '@rollup/plugin-node-resolve' ).default;
const commonjs = require( '@rollup/plugin-commonjs' );
const terser = require( '@rollup/plugin-terser' );

module.exports = {
    input: 'src/index.ts'
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
        , terser()
    ]
};
