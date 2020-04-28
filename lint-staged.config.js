// eslint-disable-next-line import/no-extraneous-dependencies
const micromatch = require( 'micromatch' );

function excludeVendor( lint ) {
    return ( filenames ) => {
        const files = micromatch( filenames, '!dist/**/*' );

        if ( files && files.length ) {
            return `${ lint } ${ files.join( ' ' ) }`;
        }

        return [];
    };
}

module.exports = {
    'src/**/*.js': excludeVendor( 'eslint' ),
};
