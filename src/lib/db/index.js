import fb from './conf';

export const firebase = fb;
export const Auth = firebase.auth();
export const Ref  = firebase.database().ref( '/' );

export const FirebaseKey = () => Ref.push().key;
