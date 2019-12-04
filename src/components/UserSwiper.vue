<template lang="pug">
.swiper-container#user-swiper(ref='swiperWrapper')
	.swiper-wrapper
		.swiper-slide.empty(:class='{ "pointer-events" : state === "open" }' @click.self='close')
		.swiper-slide.user(:class='state')
			.top
				.icon-close(@click='close')
			.content
				.content-wrapper.standalone(v-if='standalone && !user')
					.login(:class='loginState')
						h1 {{ loginState === "sign-in" ? "Sign In" : "Register" }}
						p
						.input-wrapper
							.input
								label(for='email') email
								input(id='email' v-model='email' type='email')
							.input
								label(for='name') name
								input(id='name' v-model='name')
							.input
								label(for='password') password
								.row
									input(id='password' v-model='password' v-bind:type='type')
									i.material-icons(v-show='type == "password"' @click='type = "text"') visibility
									i.material-icons(v-show='type == "text"' @click='type = "password"') visibility_off
						.btn(@click='loginAction') {{ loginState === "sign-in" ? "Sign In" : "Register" }}
						.error(v-if='error') {{ error }}
						.bottom(@click='toggleLoginState')
							span
							span.blue
				.content-wrapper.sign-in(v-else-if='!user')
					h1 Sign In
					p.spacey with an existing service
					.social-medias.row
						.social-media(
							v-for='provider in providers'
							:class='provider.name'
							@click='signInWith( provider.id )'
						)
							img(:src='`/img/${provider.icon}`')
				.content-wrapper.user(v-else)
					.profile-picture
						.picture(:style='{ backgroundImage : `url(${user.photoURL})` }' v-if='user.photoURL')
						.icon.icon-person(v-else)
					.name
						h1 {{ user.name }}
						p.spacey {{ user.screenName }}
					.btn.sign-out(@click='signOut') sign out
					slot(name='after-sign-out-button')


</template>

<script>
import Swiper from 'swiper';
import firebase from 'firebase';

import { Ref } from '@/lib/db';

export default {
	name : 'user-swiper',

	data : () => ( {
		swiper : null,

		uid  : null,

		providers : [
			// {
			// 	name : 'twitter',
			// 	id   : 'twitter.com',
			// 	icon : 'twitter.svg',
			// },
			{
				name : 'google',
				id   : 'google.com',
				icon : 'google.svg',
			},
			// {
			// 	name : 'facebook',
			// 	id   : 'facebook.com',
			// 	icon : 'facebook.svg',
			// },
		],

		standalone : false,

		loginState : 'sign-in',
		email      : '',
		name       : '',
		password   : '',
		type       : 'password',
		error      : '',

	} ),

	computed : {
		state() {
			return this.$store.state.userSwiperState;
		},
		user() {
			return this.$store.state.user;
		},
	},

	watch : {

		state( state, oldState ) {

			if ( oldState === state ) {
				return;
			}

			if ( state === 'open' && this.swiper ) {
				this.swiper.slideTo( 1 );
			}

			if ( state === 'closed' ) {
				this.swiper.slideTo( 0 )
			}

		},

		loginState() {

			this.error = '';

		},

		email() {

			this.error = '';

		},

		password() {

			this.error = '';

		},

	},

	/* life cycle */

	created() {

		// providers from firebase
		const providers = {
			'twitter.com'  : new firebase.auth.TwitterAuthProvider(),
			'facebook.com' : new firebase.auth.FacebookAuthProvider(),
			'google.com'   : new firebase.auth.GoogleAuthProvider()
		};

		// when page reloads check
		// if this was a redirect
		// from a previous auth
		firebase.auth()
			.getRedirectResult()
			.then( this.saveUser ) // store user
			.catch( ( error ) => { // maybe they already have an account on another provider

				if ( error.code === 'auth/account-exists-with-different-credential' ) {

					const { credential, email } = error;

					firebase.auth().fetchProvidersForEmail( email )
						.then( ( methods ) => {

							const method = methods[0];

							return this.signInWith( method );

						} )
						.then( ( result ) => {

							const { user } = result;
							user.linkAndRetrieveDataWithCredential( credential )
								.then( this.saveUser );

						} );
				}
			} );

	},

	mounted() {
		this.init();

		// this.standalone = Browser.isSafari && window.navigator.standalone;
	},

	methods : {

		init() {
			const self = this;

			const { swiperWrapper } = this.$refs;
			this.swiper = new Swiper( swiperWrapper, { // eslint-disable-line

				// auto initialize this swiper
				init         : true,
				initialSlide : 0,

				// swiper settings
				slidesPerView   : 'auto', // don't force every slide to be 100vw
				speed           : 400,    // ms for when you let go of swipe
				spaceBetween    : 0,      // no space between
				resistanceRatio : 0,      // stops you from swiping past all slides
				direction       : 'horizontal',

				threshold : 50, // min distance for scroll to work

				on : {

					init() {
						self.activeSlide = this.activeIndex;
					},

					slideChangeTransitionEnd() {
						self.activeSlide = this.activeIndex;
					}

				}
			} );
		},

		close() {
			this.$store.dispatch( 'updateStore', ['userSwiperState', 'closed'] );
		},

		/* sign in */

		signInWith( id ) {

			const providers = {
				'twitter.com'  : new firebase.auth.TwitterAuthProvider(),
				'facebook.com' : new firebase.auth.FacebookAuthProvider(),
				'google.com'   : new firebase.auth.GoogleAuthProvider()
			};

			const provider = providers[id];

			// mobile sign in
			if ( window.innerWidth <= 768 ) {

				return firebase.auth().signInWithRedirect( provider );

				/* *
				 * the rest of the logic for this
				 * is in the created block of this
				 * view model. this function requires
				 * a page reload
				 */

			}

			// desktop sign in
			return firebase.auth()
				.signInWithPopup( provider )
				.then( this.saveUser )
				.catch( this.handleAuthFailure );
		},

		handleAuthFailure( error ) {

			if ( error.code === 'auth/account-exists-with-different-credential' ) {

				const { credential, email } = error;

				return firebase.auth()
					.fetchProvidersForEmail( email )
					.then( ( methods ) => {

						// sign in with proper provider

						const method = methods[0];
						return this.signInWith( method );

					} )
					.then( ( result ) => {

						// link the accounts

						const { user } = result;
						user.linkAndRetrieveDataWithCredential( credential )
							.then( this.saveUser );

						// does this happen with a mobile sign in ?

					} );

			}

			return '';

		},

		saveUser( result ) {

			const { user, additionalUserInfo } = result;
			const { profile } = additionalUserInfo;

			const { providerId } = additionalUserInfo;

			const userInfo = {
				name  : user.displayName,
				email : user.email
			};

			switch ( providerId ) {

				case 'twitter.com' :

					Object.assign( userInfo, {
						provider   : providerId,
						photoURL   : profile.profile_image_url,
						screenName : profile.screen_name
					} );

					break;

				case 'facebook.com' :

					Object.assign( userInfo, {
						provider   : providerId,
						photoURL   : profile.picture.data.url,
						screenName : profile.email
					} );

					break;

				case 'google.com' :

					Object.assign( userInfo, {
						provider   : providerId,
						photoURL   : profile.picture,
						screenName : profile.email
					} );

					break;

				default :
					console.log( `${providerId} is not a provider` );
					break;

			}

			return Ref
				.child( 'users' )
				.child( user.uid )
				.update( userInfo );


		},

		signOut() {

			firebase.auth()
				.signOut()
				.then( () => this.close() );

		},

		loginAction() {

			const state = this.loginState;

			if ( state === 'register' ) {
				this.registerWithEmail();
				return;
			}

			this.signInWithEmail();

		},

		signInWithEmail() {

			const { email, password } = this;

			this.error = '';

			firebase.auth().signInWithEmailAndPassword( email, password )
				.then( () => {

				} )
				.catch( ( err ) => {

					this.error = err.message;
					console.log( err );

				} );
		},

		registerWithEmail() {

			const { email, password, name } = this;

			if ( !this.validateRegister() ) {
				return;
			}

			this.error = '';

			firebase.auth().createUserWithEmailAndPassword( email, password )
				.then( ( results ) => {

					console.log( results );

					const { user } = results;
					const { uid } = user;

					user.updateProfile( {
						displayName : name
					} );

					Ref.child( 'users' )
						.child( uid )
						.set( {
							email,
							name,
							screenName : email
						} );

				} )
				.catch( ( err ) => {

					this.error = err.message;
					console.log( err );

				} );

		},

		validateRegister() {

			const inputs = ['email', 'name', 'password'];
			let valid = true;

			inputs.forEach( ( input ) => {

				const value = this[input];

				if ( !valid ) {
					return;
				}

				if ( !value ) {
					valid = false;
					this.error = `Must input a value for ${input}`;
				}

			} );

			return valid;

		},

		toggleLoginState() {

			if ( this.loginState === 'sign-in' ) {
				this.loginState = 'register';
				return;
			}

			this.loginState = 'sign-in';

		}

	}
}
</script>


<style lang="scss">
#user-swiper {
	.user {
		display: flex;
		flex-direction: column;
		align-items: stretch;

		.top {
			flex-shrink: 0;
		}

		.content {
			flex: 1 1 0;
			display: flex;
			flex-direction: column;

			.content-wrapper {
				display: flex;
				flex-direction: column;
				align-items: center;
				flex: 1 1 0;
			}
		}
	}

  .top {
    padding: 15px;
    display: flex;
    justify-content: flex-end;
  }

  .content {

		.content-wrapper.standalone {

			.login {
				display: flex;
				flex-direction: column;
				position: relative;
				height: 100vh;

				h1 {
					text-align: center;
					font-size: 40px;
					font-weight: 600;
					color: $primary;
				}

				p {
					text-align: center;
					margin: 15px;
				}

				.input-wrapper {
					margin: 10px;
					border-radius: 20px;
					box-shadow: $floatingObject;

					.input {
						display: flex;
						flex-direction: column;
						padding: 10px 15px;
						border-bottom: 1px solid #cfcfcf;

						label {
							text-transform: uppercase;
							font-size: 12px;
							letter-spacing: 3px;
							font-weight: 600;
						}

						input {
							flex: 1 1 0;
							padding: 5px 0;
							margin: 0;
							font-size: 16px;
						}

						&:last-child {
							border-bottom: 1px solid transparent;
						}

					}
				}

				.btn {
					background-image: linear-gradient(to right, darken( $primary, 5 ), lighten( $primary, 15 ) );
					color: white;
					display: flex;
					justify-content: center;
					align-items: center;
					padding: 15px 15px;
					border-radius: 25px;
					cursor: pointer;
					margin: 10px;
					font-weight: 600;
					font-size: 16px;
				}

				.error {
					margin: 20px;
    			text-align: center;
					color: $cancel;
					text-transform: uppercase;
				}

				.bottom {
					margin-top: 10px;
					align-self: center;
					position: absolute;
					bottom: 30px;

					span {
						&::after {
							font-size: 18px;
						}
					}
				}

				&.sign-in {

					p {
						&::after {
							content: 'sign in to your account with your email and password';
							text-transform: uppercase;
						}
					}

					.input-wrapper {

						.input {
						 &:nth-child(2) {
							display: none;
						 }
						}

					}

					span {
						&::after {
							content: 'No Account?';
							text-transform: uppercase;
						}

						&.blue {
							color: #0e68f8;
							margin-left: 5px;

							&::after {
								content: 'Register'
							}
						}
					}

				}

				&.register {

					p {
						&::after {
							content: 'create an account to help track your saved courses';
							text-transform: uppercase;
						}
					}

					span {
						&::after {
							content: 'Have an Account?';
							text-transform: uppercase;
						}

						&.blue {
							color: #0e68f8;
							margin-left: 5px;

							&::after {
								content: 'Sign In'
							}
						}
					}
				}
			}




		}

    .content-wrapper.sign-in {

      h1 {
        text-align: center;
				font-size: 48px;
				font-weight: 600;
				color: $primary;
      }

      p {
        text-align: center;
        margin: 15px 10px 0px 10px;
      }

      .social-medias {
        justify-content: center;
        margin-top: 30px;

        .social-media {
          height: 60px;
          width: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 10px;

          &.twitter {
            background-color: $twitterBlue;
          }

          &.facebook {
            background-color: $facebookBlue;
          }

          &.google {
            background-color: $googleRed;
          }
        }
      }
    }

    .content-wrapper.user {

      .profile-picture {

        .picture {
          position: relative;
          left: 50%;
          transform: translateX(-50%);
          height: 90px;
          width: 90px;
          border-radius: 50%;
          background-size: cover;
          background-position: center center;
				}

				.icon-person {
					font-size: 100px;
				}

      }

      .name {
        margin-top: 30px;

        h1,
        p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        h1 {
          font-size: 36px;
          text-align: center;
        }

        p {
          text-align: center;
          margin-top: 10px;
          font-size: 12px;
        }
      }

      .btn {
        margin-top: 30px;
        position: relative;
        display: inline-block;
			}
    }
	}

	.icon-close {
		height: 30px;
		width: 30px;
		position: relative;
		cursor: pointer;

		&::before,
		&::after {
			content: ' ';
			height: 24px;
			width: 4px;
			border-radius: 2px;
			background-color: $primary;
			position: absolute;
			top: 50%;
			left: 50%;
		}

		&::before {
			transform: translate(-50%,-50%) rotate(45deg);
		}

		&::after {
			transform: translate(-50%,-50%) rotate(-45deg);
		}
	}

	.btn {
		font-size: 12px;
		text-transform: uppercase;
		padding: 15px;
		border-radius: 40px;
		background-color: $primary;
		color: white;
		cursor: pointer;
		opacity: 1;
		transition: opacity 0.2s ease;
		font-family: "Work Sans", opensans;
		letter-spacing: 2px;
		-webkit-touch-callout: none; /* iOS Safari */
		-webkit-user-select: none;   /* Chrome/Safari/Opera */
		-khtml-user-select: none;    /* Konqueror */
		-moz-user-select: none;      /* Firefox */
		-ms-user-select: none;       /* Internet Explorer/Edge */
		user-select: none;           /* Non-prefixed version, currently
																		not supported by any browser */
	}
}

/* tablets and desktops */
@media only screen and (min-width : 768px) {

	.swiper-slide.user {
		width: 330px;
		box-shadow: none;
		transition: box-shadow 0.2s ease;

		&.open {
			box-shadow: $floatingObject !important;
		}
	}
}
</style>

