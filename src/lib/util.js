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
