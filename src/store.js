import Vue from 'vue';
import Vuex from 'vuex';
import Swiper from 'swiper';
import firebase from 'firebase';
import 'firebase/auth';

import router from '@/router';

import { Ref } from '@/lib/db';
import { ObjToArray, FilterNode } from '@/lib/utils';

import { Upload, Search } from '@/lib/API';

Vue.use( Vuex );

export default new Vuex.Store( {
	state : {
		sideMenuSwiper : null,

		user    : false,
		isAdmin : false,

		savedCourseKeys : {},

		subjectMap : {},
		subjects   : [],


		activeCourse    : {},
		courseInfoState : 'closed',

		userSwiperState : 'closed',

		schools        : [],
		sectors        : [],
		loadingSectors : true,

		courses         : [],
		courseState     : 'loading',
		model           : {},
		filters         : [],
		openedFilters   : {},
		selectedFilters : {},

		searchResults : null,

		uploadOpened      : false,
		uploadErrors      : [],
		uploadErrorsState : 'upload',

		modalState : 'browse',
		modalStep  : 'open',
		newSector  : {
			title   : null,
			iconUrl : null,
			fileUrl : null,
		},
		isEditing : false,

	},
	mutations : {
		/* eslint-disable no-param-reassign */
		updateSwiper( state, swiper ) {
			state.sideMenuSwiper = swiper;
		},

		destroySideMenuSwiper( state ) {
			state.sideMenuSwiper.destroy( false, false );
		},

		updateUser( state, payload ) {
			const { user, isAdmin } = payload;

			state.user = user;
			state.isAdmin = isAdmin;
		},

		updateStore( state, [prop, value] ) {
			state[prop] = value;
		},

		updateFilters( state, filters ) {
			const formattedFilters = filters.map( ( filter ) => {
				const { type } = filter;

				if ( type === 'list' ) {
					filter.options = [{ value : 'All' }].concat( filter.options );
				}

				if ( type === 'multi-list' ) {
					filter.options = [{ abv : 'All', value : 'All' }].concat( filter.options );
				}

				return filter;
			} );

			const selectedFilters = formattedFilters.reduce( ( obj, filter ) => {
				const { key, type } = filter;

				switch ( type ) {
					case 'boolean':
						obj[key] = false;
						break;

					case 'arbitrary':
						obj[key] = false;
						break;

					case 'list':
						obj[key] = filter.options[0].value;
						break;

					case 'multi-list':
						obj[key] = filter.options[0].value;
						break;

					default:
						break;
				}

				return obj;
			}, {} );


			const openedFilters = filters.reduce( ( obj, filter ) => {
				const { key, type } = filter;

				if ( type !== 'boolean' ) {
					obj[key] = false;
				}

				return obj;
			}, {} );

			state.selectedFilters = selectedFilters;
			state.openedFilters   = openedFilters;
			state.filters         = formattedFilters.sort( ( filter ) => {
				const { type } = filter;

				if ( type === 'boolean' || type === 'arbitrary' ) {
					return 1;
				}

				return -1;
			} );

		},

		updateModel( state, model ) {
			state.model = model;
		},

		updateOpened( state, payload ) {
			const { key, value } = payload;

			state.openedFilters[key] = value;
		},

		selectFilter( state, payload ) {
			const { key, value } = payload;
			state.selectedFilters[key] = value;
		},

		uploadFail( state, errors ) {

			state.uploadErrorsState = 'fail';
			state.uploadErrors      = errors;

		},

		closeUpload( state ) {
			state.uploadOpened      = false;
			state.uploadErrors      = [];
			state.uploadErrorsState = 'upload';
		},

		openSectorUpload( state, sector ) {

			state.modalState = 'add-sector';

			if ( sector ) {
				state.isEditing = true;
				state.newSector = Object.assign( {}, sector );
			}

		},

		closeSectorUpload( state ) {
			state.modalState = 'browse';
			state.modalStep  = 'open';

			state.newSector = {
				title   : null,
				iconUrl : null,
				fileUrl : null,
			};

			state.isEditing = false;
		},

		search( state, results ) {
			state.searchResults = results;
			state.courseState   = 'loaded';
		}


		/* eslint-enable no-param-reassign */
	},
	actions : {

		initSideMenuSwiper( { state, commit } ) {

			const { sideMenuSwiper } = state;

			if ( sideMenuSwiper && !sideMenuSwiper.destroyed ) {
				sideMenuSwiper.destroy();
			}

			const swiper = new Swiper( '#side-menu-swiper', { // eslint-disable-line
				// auto initialize this swiper
				init         : true,
				initialSlide : 1,

				// swiper settings
				slidesPerView   : 'auto', // don't force every slide to be 100vw
				speed           : 400, // ms for when you let go of swipe
				spaceBetween    : 0, // no space between
				resistanceRatio : 0, // stops you from swiping past all slides
				direction       : 'horizontal',

				threshold : 50, // min distance for scroll to work
			} );

			commit( 'updateSwiper', swiper );
		},

		destroySideMenuSwiper( { commit } ) {
			commit( 'destroySideMenuSwiper' );
		},

		initAuthListener : ( { commit, dispatch } ) => new Promise( ( resolve ) => {

			firebase.auth().onAuthStateChanged( ( user ) => {

				if ( !user ) {
					const payload = {
						user,
						isAdmin : false
					};

					commit( 'updateUser', payload );
					resolve( user );
					return;
				}

				const { uid } = user;

				Ref
					.child( 'savedCourses' )
					.child( uid )
					.on( 'value', ( snapshot ) => {
						const savedCourseKeys = snapshot.val() || {};
						commit( 'updateStore', ['savedCourseKeys', savedCourseKeys] );
					} );

				dispatch( 'updateUser', user )
					.then( resolve );

			} );

		} ),

		updateUser( { commit }, user ) {

			const { uid } = user;

			return Promise.all( [
				Ref
					.child( 'users' )
					.child( uid )
					.once( 'value' )
					.then( snapshot => snapshot.val() ),
				Ref
					.child( 'roles' )
					.child( uid )
					.once( 'value' )
					.then( snapshot => snapshot.val() ),
			] )
				.then( ( data ) => {
					const userObj      = data[0];
					const isAdmin      = ( data[1] === 'admin' );

					if ( !userObj ) {
						return userObj;
					}

					userObj.uid         = uid;
					userObj.displayName = user.displayName;

					const payload = {
						user : userObj,
						isAdmin,
					};

					commit( 'updateUser', payload );

					return userObj;

				} );
		},

		getCatalog( { commit } ) {

			commit( 'updateStore', ['courseState', 'loading'] );

			Ref
				.child( 'courses' )
				.on( 'value', ( snapshot ) => {
					const courses = snapshot.val() || {};

					commit( 'updateStore', ['courses', ObjToArray( courses )] );
					commit( 'updateStore', ['courseState', 'loaded'] );
				} );

			Ref.child( 'model' )
				.on( 'value', ( snapshot ) => {
					const model = snapshot.val();

					commit( 'updateModel', model );
					commit( 'updateFilters', model.filterable );
				} );

			Ref
				.child( 'schools' )
				.on( 'value', ( snapshot ) => {
					const schools = snapshot.val();

					if ( !schools ) {
						return;
					}

					commit( 'updateStore', ['schools', schools] );
				} );

		},

		updateStore( { commit }, [prop, value] ) {
			commit( 'updateStore', [prop, value] );
		},

		toggleSideMenu( { state } ) {
			const { sideMenuSwiper } = state;

			const activeSlide = sideMenuSwiper.activeIndex;

			if ( activeSlide === 1 ) {
				sideMenuSwiper.slidePrev();

				return;
			}

			sideMenuSwiper.slideNext();

		},

		updateOpened( { commit }, payload ) {
			commit( 'updateOpened', payload );
		},

		selectFilter( { commit }, payload ) {
			commit( 'selectFilter', payload );
		},

		updateSectors( { commit }, key ) {

			commit( 'updateStore', ['loadingSectors', true] );

			return new Promise( ( resolve ) => {
				Ref
					.child( 'cte' )
					.child( key )
					.on( 'value', snapshot => FilterNode( snapshot ).then( ( results ) => {
						const sectors = ObjToArray( results );

						commit( 'updateStore', ['sectors', sectors] );
						commit( 'updateStore', ['loadingSectors', false] );
						resolve();

					} ) );
			} );
		},

		openCourseInfo( { commit, state }, key ) {
			const { courses, savedCourseKeys } = state;

			const { path } = router.history.current;

			let course;

			if ( path === '/courses' ) {
				course = courses.find( a => a.key === key );
			}
			else {
				course = null;

				if ( savedCourseKeys[key] ) {
					course = courses.find( a => a.key === key );
				}
			}

			if ( !course ) {
				router.replace( { path } );
				return;
			}

			commit( 'updateStore', ['activeCourse', course] );
			commit( 'updateStore', ['courseInfoState', 'open'] );

		},

		closeCourseInfo( { commit } ) {
			commit( 'updateStore', ['activeCourse', {}] );
			commit( 'updateStore', ['courseInfoState', 'closed'] );
		},

		openSectorUpload( { commit }, sector ) {
			commit( 'openSectorUpload', sector );
		},

		closeSectorUpload( { commit } ) {
			commit( 'closeSectorUpload' );
		},

		saveCourse( { commit, state }, key ) {
			const { user, savedCourseKeys } = state;

			if ( !user ) {
				commit( 'updateStore', ['userSwiperState', 'open'] );
				return;
			}

			const { uid } = user;

			const isSaved = savedCourseKeys[key] !== undefined;

			if ( isSaved ) {
				Ref
					.child( 'savedCourses' )
					.child( uid )
					.child( key )
					.remove();
				return;
			}

			Ref
				.child( 'savedCourses' )
				.child( uid )
				.child( key )
				.set( Date.now() );

		},

		search( { commit }, query ) {

			if ( !query ) {
				commit( 'search', null );
				return;
			}

			commit( 'updateStore', ['courseState', 'loading'] );

			Search( query )
				.then( ( results ) => {
					commit( 'search', results );
				} );
		},

		upload( { commit } ) {

			commit( 'updateStore', ['uploadOpened', true] );
			commit( 'updateStore', ['uploadErrorsState', 'loading'] );

			Upload()
				.then( ( data ) => {
					console.log( data );
					commit( 'updateStore', ['uploadErrorsState', 'success'] );
				} );

			// Upload()
			// 	.then( ( data ) => {
			// 		const { status } = data;

			// 		switch ( status ) {
			// 			case 202:
			// 				commit( 'updateStore', ['uploadErrorsState', 'success'] );
			// 				break;
			// 			case 400:
			// 				commit( 'uploadFail', data.errors );
			// 				break;
			// 			default:
			// 				break;
			// 		}

			// 	} )
			// 	.catch( ( err ) => {

			// 		// Handle application err
			// 		commit( 'updateStore', ['uploadErrorsState', 'error'] );

			// 	} );

		},

		closeUpload( { commit } ) {
			commit( 'closeUpload' );
		}

	}
} );
