<template lang='pug'>
	#app
		.swiper-container#side-menu-swiper
			.swiper-wrapper
				sidebar.swiper-slide
				#main.swiper-slide
					#full-page-views
						course-info

						user-swiper
							.give-feedback-wrapper(slot='after-sign-out-button')
								.give-feedback(@click='giveFeedback') give feedback

						upload-errors

					router-view
</template>

<script>
import Sidebar from '@/components/Sidebar';
import CourseInfo from '@/components/CourseInfo';
import UserSwiper from '@/components/UserSwiper';
import UploadErrors from '@/components/UploadErrors';
import store from '@/store';

export default {

	name : 'app',
	store,

	data : () => ( {
		sideMenuTimeout : null,
	} ),

	computed : {
		sideMenuSwiper() {
			return this.$store.state.sideMenuSwiper;
		},

		courseInfoState() {
			return this.$store.state.courseInfoState;
		}
	},

	created() {

		this.$store.dispatch( 'initAuthListener' )
			.then( () => {
				this.$store.dispatch( 'getCatalog' );
			} );

	},

	mounted() {

		this.$store.dispatch( 'initSideMenuSwiper' );

		if ( window.innerWidth >= 992 ) {
			this.sideMenuSwiper.slideTo( 0 );

			window.setTimeout( () => {
				this.$store.dispatch( 'destroySideMenuSwiper' );
			}, 200 );
		}

		window.addEventListener( 'resize', ( e ) => {

			const { innerWidth : w } = e.target;
			clearTimeout( this.sideMenuTimeout );

			this.sideMenuTimeout = setTimeout( () => { // eslint-disable-line

				// must correspond to the size of the
				// mobile & tablet media query found
				// at the bottom of index.scss, as well
				// as the number used in sidebarVM.created()
				if ( w < 992 ) {
					this.$store.dispatch( 'initSideMenuSwiper' );
					return;
				}

				this.sideMenuSwiper.slideTo( 0 );

				window.setTimeout( () => {
					this.$store.dispatch( 'destroySideMenuSwiper' );
				}, 200 );

			}, 200 );

		} );

	},

	methods : {

		giveFeedback() {
			SpacebarFeedback.open();
		},

	},

	components : {
		Sidebar,
		CourseInfo,
		UserSwiper,
		UploadErrors
	},

};
</script>


<style lang="scss">
	@import '@/assets/default.scss';

	#app {

		#full-page-views {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 20;
			pointer-events: none;

			.swiper-container {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				pointer-events: none;

				.swiper-wrapper .swiper-slide {
					background-color: white;
					box-shadow: 0 0 0 rgba(0,0,0,0);
					transition: box-shadow 0.2s ease;
					will-change: box-shadow;

					&.open {
						box-shadow: $floatingObject;
					}

					&.empty {
						background-color: transparent;

						&.pointer-events,
						+ .swiper-slide {
							pointer-events: all;
						}
					}
				}
			}
		}

		.give-feedback-wrapper {
			flex: 1 1 0;
			display: flex;
			align-items: flex-end;
			justify-content: center;
			padding: 30px;

			.give-feedback {
				color: $primary;
				text-transform: uppercase;
				letter-spacing: 5px;
				cursor: pointer;
			}
		}

		#main {
			width: calc( 100vw - 275px );
		}

		@media only screen and (min-width : 1px) and (max-width : 992px) {
			#main {
				width: calc( 100vw ) !important;
			}
		}

	}
</style>
