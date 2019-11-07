export const HasProperty = ( a, b ) => Object.prototype.hasOwnProperty.call( a, b );

export const ObjToArray = ( object ) => {

	if ( object === null || object === undefined ) {
		return [];
	}

	const keys  = Object.keys( object );
	const array = keys.reduce( ( arr, key ) => {

		const obj = object[key];

		if ( !HasProperty( obj, 'key' ) ) {
			obj.key = key;
		}

		arr.push( obj );

		return arr;

	}, [] );

	return array;

};

export const FilterNode = ( snapshot, returnAsObj = false ) => new Promise( ( resolve ) => {
	const nodes = snapshot.val();

	const nodeKeys = ( () => {

		if ( nodes === null ) {
			return [];
		}

		return Object.keys( nodes );

	} )();

	const results = {};
	const deleted = {};

	nodeKeys.forEach( ( key ) => {

		const node = nodes[key];

		if ( HasProperty( node, 'deleted_at' ) ) {
			deleted[key] = node;

			return;
		}

		results[key] = node;

	} );

	if ( returnAsObj ) {
		resolve( { results, deleted } );

		return;
	}

	resolve( results );

} );
