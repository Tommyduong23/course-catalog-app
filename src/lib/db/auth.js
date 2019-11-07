import { Auth } from './index';

export const login = ( email, password ) => Auth.signInWithEmailAndPassword( email, password );

export const logOut = () => Auth.signOut();

export const GetUser = () => new Promise( ( resolve ) => {

	const killListener = Auth
		.onAuthStateChanged( ( user ) => {

			resolve( user );

			killListener();

		} );

} );

export const GetCurrentUserToken = () => new Promise( ( resolve, reject ) => {

	GetUser()
		.then( user => user.getIdToken( true ) )
		.then( resolve )
		.catch( reject );

} );
