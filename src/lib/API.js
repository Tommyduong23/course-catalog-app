import env from '@/assets/env';
import { GetCurrentUserToken } from '@/lib/db/auth';

const path = ( a, queryOptions = null ) => {
	const query = ( () => {
		if ( !queryOptions ) {
			return '';
		}

		const queryKeys   = Object.keys( queryOptions );
		const queryString = queryKeys
			.map( key => `${key}=${encodeURIComponent( queryOptions[key] )}` )
			.join( '&' );

		return `?${queryString}`;
	} )();

	return `${env.API_PROTOCOL}://${env.API_URL}/${a}${query}`;
};

/**
 * a courier function which will run
 * it's first paramater as a callback
 * with a Firebase AuthToken added in
 * at the beginning of the paramaters
 * list
 *
 * @param method (function) the method to be called after a token is generated
 */
const authenticate = method => ( ...args ) => {
	return GetCurrentUserToken()
		.then( ( token ) => {
			const authObject = {
				token,
				defaultHeaders : new Headers( {
					'Auth-Token'   : token,
					'Content-Type' : 'application/json',
				} ),
			};
			const allArgs = [authObject].concat( args );

			return method( ...allArgs );
		} );
};

// simply uses a try/catch block to
// ensure standard behaviors on
// fetch
const fetchPromise = ( route, options ) => new Promise( ( resolve, reject ) => {
	try {
		fetch( route, options )
			.then( async ( res ) => {
				const status = parseInt( res.status, 10 );
				if ( ( Math.floor( status / 100 ) * 100 ) !== 200 ) {
					reject( res );

					return;
				}

				const body = await _body( res );
				resolve( body, res );
			} );
	}
	catch ( e ) {
		reject( e );
	}
} );

const _body = async ( res ) => {
	const text = await res.text();

	const firstChar = text.charAt( 0 );
	const isJson    = ( firstChar === '{' || firstChar === '[' );

	if ( isJson ) {
		return JSON.parse( text );
	}

	return text;
};

export const Upload = authenticate( _auth => fetch( path( 'sheets/upload' ), {
	method  : 'POST',
	headers : _auth.defaultHeaders
} ).then( ( response ) => {
	console.log( response );
} ) );


export const Search = authenticate( ( _auth, query ) => fetchPromise( path( 'catalog/search', { searchQuery : query } ), {
	method  : 'GET',
	headers : _auth.defaultHeaders
} ) );
