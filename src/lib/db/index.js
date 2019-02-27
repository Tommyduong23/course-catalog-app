import firebase from '@/lib/db/conf';

const _auth      = firebase.auth();
const _db        = firebase.database().ref( '/' );
const _firestore = firebase.firestore();

export const Ref = _db;

export const login = ( email, password ) => _auth.signInWithEmailAndPassword( email, password );

export const logOut = () => _auth.signOut();

export const FirebaseKey = () => _db.push().key;

export const GetUser = () => new Promise( ( resolve ) => {

	const killListener = firebase
		.auth()
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
