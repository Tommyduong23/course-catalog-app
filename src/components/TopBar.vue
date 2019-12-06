<template lang="pug">
	#top-bar(:class='[state]')
		.wrapper

			.top(:style='{ maxHeight : `${Math.max( 200 - scrollTop, 85 )}px` }')
				.header

					.icons
						.icon.icon-toggle(@click='toggleMenu')

					search-bar(
						:starting-value='query'
						@focus='toggleSearchState'
						@input='search'
					)

					.title-wrapper
						.title.mobile(:class='{ active : subjectState === "expanded" }') Subjects

						.title(:class='{ active : state !== "collapsed" }')
							h2(v-if='!fromSectorInfo') Course Catalog
							.row(v-else)
								h2 CTE Pathway
								p {{ selectedFilters['CTE Pathway'] }}

						.title(:class='{ active : state === "collapsed" }')
							h2(v-if='!fromSectorInfo') {{ activePrimary }} courses
							.row(v-else)
								h2 CTE Pathway
								p {{ selectedFilters['CTE Pathway'] }}

					profile-image(
						@profile-click='openUserSwiper'
						@feedback-click='giveFeedback'
					)

				.welcome(:style='{ opacity }')
					.logo
						img(src='/img/logo.png')
						h2 Course Catalog

			.middle
				subjects(
					:subject-state='subjectState'
					@toggle-subject-bar='toggleSubjectBar'
				)

			.bottom
				filters

</template>

<script>
import SearchBar from '@/components/SearchBar';
import ProfileImage from '@/components/ProfileImage';
import Subjects from '@/components/Subjects';
import Filters from '@/components/Filters';

export default {
	name : 'top-bar',

	props : {
		state : {
			required : true,
			type     : String
		},
		scrollTop : {
			required : true,
		}
	},

	data : () => ( {
		subjectState : 'closed',

		searchTimeout : null,
		query         : '',

	} ),

	computed : {
		user() {
			return this.$store.state.user;
		},

		selectedFilters() {
			return this.$store.state.selectedFilters;
		},

		model() {
			return this.$store.state.model;
		},

		activePrimary() {
			const { model } = this;

			if ( !Object.keys( model ).length ) {
				return null;
			}

			return this.selectedFilters[model.primaryFilter];
		},

		opacity() {
			const num = Math.max( 115 - this.scrollTop, 0 );
			const den = 115;

			return ( num / den );
		},

		fromSectorInfo() {
			return this.$route.query.fromSectorInfo;
		}

	},

	methods : {

		search( query ) {
			if ( this.searchTimeout ) {
				window.clearTimeout( this.searchTimeout );
			}

			this.searchTimeout = window.setTimeout( () => {
				this.$store.dispatch( 'search', query );
			}, 400 );
		},

		toggleSearchState() {
			if ( this.state !== 'search' ) {
				this.$emit( 'update-topbar', 'search' );
				return;
			}

			const state = this.scrollTop > 50 ? 'collapsed' : '';
			this.$emit( 'update-topbar', state );
		},

		toggleSubjectBar() {
			if ( this.subjectState === 'expanded' ) {
				this.subjectState = 'closed';
				return;
			}

			this.subjectState = 'expanded';
		},

		toggleMenu() {
			this.$store.dispatch( 'toggleSideMenu' );
		},

		openUserSwiper() {
			this.$store.dispatch( 'updateStore', ['userSwiperState', 'open'] );
		},

		giveFeedback() {
			SpacebarFeedback.open();

		},
	},

	components : {
		SearchBar,
		ProfileImage,
		Subjects,
		Filters
	}

};
</script>

<style lang="scss">

	@import '@/assets/variables.scss';

	#top-bar {
		z-index: 10;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		pointer-events: none;

		.top {
			padding: 10px;
			background: white;
			z-index: 10;
			position: relative;
			pointer-events: all;

			.welcome {
				display: none;
			}

			.header {
				justify-content: space-between;
				align-items: center;
				display: flex;

				.icons {
					display: flex;
				}

				.icon {
					font-size: 16px;
					color: $primary;
					padding: 10px;
				}

				.title-wrapper {
					height: 50px;
					overflow: hidden;
					position: absolute;
					width: 100%;
					pointer-events: none;

					.title.mobile {
						display: none;
					}

					> div {
						height: 100%;
						position: absolute;
						left: 50%;
						top: 0;
						transition: transform 0.5s ease;
						will-change: transform;

						//- all div behind .active
						transform: translate3d(-50%,-100%,0);

						// div.active
						&.active {
							transform: translate3d(-50%,0,0);
						}

						// all the div after .active
						&.active:not(.mobile) ~ .title {
							transform: translate3d(-50%,100%,0);
						}
					}

					.title {
						display: flex;
						align-items: center;
						font-size: 24px;

						h2 {
							font-weight: 600;
							font-size: 1em;
							letter-spacing: 1px;
							color: $primary;
						}

						.row {
							align-items : center;

							p {
								font-size: 1em;
								font-weight: 300;
								color: #2e5491;
								margin-left: 10px;
								white-space: nowrap;
								text-overflow: ellipsis;
								overflow: hidden;
							}
						}
					}
				}
			}
		}

		.middle {
			transition: max-height .4s ease;
			overflow: hidden;
			max-height: 100px;
			background: white;
			z-index: 5;
			pointer-events: all;

			* {
				transition: opacity 0.5s ease;
			}
		}

		.bottom {
			max-height: 45px;
			transition: max-height 0.2s ease;
			z-index: 1;
			border-top: 1px solid $secondary;
		}

		&.collapsed {
			.top {
				.header {
					.left {
						.title {
							.default {
								opacity: 0;
								pointer-events: none;
								height: 0px;
							}

							.selected {
								opacity: 1;
								pointer-events: auto;
								height: 30px;
								width: auto;
							}
						}
					}
				}
			}

			.middle {
				max-height: 0;
				margin-bottom: 0px;

				* {
					opacity: 0;
					pointer-events: none;
				}
			}

			.bottom {
				max-height: 0;
				opacity: 0;
				pointer-events: none;

				.filters {
					.filter {
						&.hidden {
							display: flex;
						}
					}
				}
			}
		}

		&.search {

			.top {
				transition: max-height 0.2s ease;
				max-height : 85px !important;

				.welcome {
					transition: opacity 0.2s ease;
					opacity: 0 !important;
				}

				.header {

					.icons,
					.title-wrapper,
					.user {
						opacity: 0;
						pointer-events: none;
					}
				}
			}

			.middle {
				max-height: 0;
				overflow: hidden;
			}

			+ .page {
				padding-top: 121px;
			}
		}

	}

/* desktop */

@media only screen and ( min-width : 993px ) {

	#top-bar {
		.top {
			.header {
				.icons {
					display : none;
				}
			}
		}
	}

}

/* tablet */
@media only screen and (min-width : 575px) and (max-width: 992px) {

	#top-bar {
		.top {
			.header {
				.icons {
					display : flex;
					position: absolute;
				}
			}

			.search-bar {
				transform: translateX(35px);
			}
		}
	}

}

/*
// max-width must correspond to the size
// of the  number used window resize event
// listener near the top of index.js as well
// as sidebarVM.created() in index.js
*/
@media only screen and (min-width : 1px) and (max-width : 575px) {
	#top-bar {
		box-shadow: $floatingObject;
		z-index: 11;

		.top {
			padding: 20px !important;
			position: relative;
			height: 200px;
			max-height: 200px;
			box-shadow: none;
			will-change: max-height;

			.welcome {
				margin-bottom: 0;
				display: block;
				width: calc( 100vw - 60px );
				position: absolute;
				left: 50%;
				bottom: 60px;
				transform: translateX(-50%);

				.logo {
					display: flex;
					flex-direction: column;
					align-items: center;

					img {
						height: 90px;
						margin-bottom: 9px;
					}

					h2 {
						color: $primary;
						text-align: center;
					}
				}
			}

			.header {

				.icon-toggle,
				.icon-person {
					color: $primary !important;
					font-size: 22px;
				}

				.icons {
					z-index: 10;

					.search-bar {
						position: absolute;
						left: 50%;
						transform: translate3d(-50%,-50%,0);
						height: 100%;
						top: 50%;

						&.focus {
							left: 50%;
						}
					}
				}

				.title-wrapper {
					bottom: 15px;
					left: 0;
					pointer-events: none;

					.title:not(.mobile) {
						display: none;
					}

					.title.mobile {
						display: flex;
						font-size: 16px;
						text-transform: uppercase;
						color: $grey;
						font-weight: 600;
						background: white;
						width: 100%;
						align-items: center;
						justify-content: center;
					}
				}

				.search-bar {
					position: absolute;
					left: 50% !important;
					transform: translateX(-50%);
					padding: 0 20px;
					width: 100vw;
					bottom: 25px;

					&::before,
					&::after {
						display: block;
					}

					&.focus {
						max-width: 100vw;
					}
				}
			}
		}

		.middle {
			position: relative;
			overflow: visible;
		}

		.bottom {
			display : none;
		}
	}
}

</style>
