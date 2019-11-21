<template lang="pug">
	#cte
		.top-bar
			.row.top
				.icon.icon-toggle(@click='toggleMenu')
				.headers
					.header.active Industry Sectors
					.header {{ activeSchool.name }}

				profile-image(
					@profile-click='openUser'
					@feedback-click='giveFeedback'
				)

			//- topbar tabs
			.schools-wrapper.easy-scroll.swiper-no-swiping(
				:class='{ loading : loadingSchools }'
			)
				.schools
					.school(
						v-for='school in schools'
						:class='{ active : school.key === activeSchoolKey }'
						@click='activeSchoolKey = school.key'
					)
						| {{ school.value }}

		.page
			//- loading animation
			.loading-circles(v-if='loadingSectors')
				span
				span
				span

			sectors(
				:active-school='activeSchool'
			)

		add-sector-modal(
			:active-school-key='activeSchoolKey'
		)


</template>

<script>
import ProfileImage from '@/components/ProfileImage';
import Sectors from '@/components/Sectors';
import AddSectorModal from '@/components/AddSectorModal';

import { ObjToArray } from '@/lib/utils';

export default {

	data : () => ( {
		loadingSchools  : true,
		activeSchoolKey : '',
	} ),

	computed : {

		user() {
			return this.$store.state.user;
		},

		schools() {
			const schools = ObjToArray( this.$store.state.schools );

			return schools;
		},

		loadingSectors() {
			return this.$store.state.loadingSectors;
		},

		activeSchool() {
			const key    = this.activeSchoolKey;
			const school = this.schools.find( a => a.key === key );

			if ( !school ) {
				return {};
			}

			return school;
		},

		sectors() {
			return this.$store.state.sectors;
		},

		sideMenuSwiper() {
			return this.$store.state.sideMenuSwiper;
		},

	},

	watch : {

		schools : {
			immediate : true,

			handler( schools ) {

				if ( !schools.length ) {
					return;
				}

				this.loadingSchools = false;

				if ( !this.activeSchoolKey ) {
					this.activeSchoolKey = this.schools[0].key;
				}

			}
		},

		activeSchoolKey : {
			immediate : true,
			handler( key ) {

				if ( !key ) {
					return;
				}

				this.$store.dispatch( 'updateSectors', key );

			}
		}
	},

	methods : {

		openUser() {
			this.$store.dispatch( 'updateStore', ['userSwiperState', 'open'] );
		},

		toggleMenu() {
			this.$store.dispatch( 'toggleSideMenu' );
		},

		giveFeedback() {

		},


	},

	components : {
		ProfileImage,
		Sectors,
		AddSectorModal
	}
};

</script>

<style lang="scss">
	#cte {
		height: 100vh;
		overflow: auto;
		background: white;
		opacity: 0.999; // don't remove this. it causes a strange display bug on chrome

		.top-bar {
			position: relative;

			.top {
				padding: 10px;
				align-items: center;
				justify-content: space-between;
				position: relative;
				background: white;
				z-index: 10;

				.search-bar,
				.icon-person {
					position: absolute;
					top: 50%;
					transform: translate3d(0,-50%,0);
				}

				.icon-toggle {
					color: $primary;
					margin-left: 10px;
				}

				.search-bar {
					left: 25px;

					+ * {
						opacity: 1;
						transition: opacity 0.5s ease;
					}

					&.focus,
					&:not(.empty) {

						+ * {
							opacity: 0;
						}
					}

					input {
						margin-left: 25px;
					}
				}

				.headers {
					height: 54px;
					overflow: hidden;
					position: absolute;
					width: 80%;
					pointer-events: none;
					left: 50%;
					transform: translateX(-50%);

					.header {
						height: 100%;
						position: absolute;
						left: 50%;
						top: 0;
						transition: transform 0.5s ease;
						will-change: transform;
						display: flex;
						align-items: center;
						justify-content: center;
						font-size: 24px;
						color: $primary;
						font-weight: 600;
						width: 100%;
						font-family: 'Cabin', sans-serif;
						letter-spacing: 1px;

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
				}

				.icon-person {
					right: 0;
					padding: 25px;
				}
			}

			.schools-wrapper {
				transition: transform 0.5s ease;
				transform: translate3d(0,100%,0);
				width: 100%;
				box-shadow: $floatingObject;
				position: absolute;
				bottom: 0;
				overflow: auto;
				white-space: nowrap;
				text-align: center;

				&.loading {
					transform: translate3d( 0,0,0 );
				}
			}

			.schools {
				padding: 0 25px;
				display: inline-block;

				.school {
					padding: 12px 15px;
					position: relative;
					overflow: hidden;
					cursor: pointer;
					display: inline-block;

					&::before {
						content: ' ';
						position: absolute;
						top: 100%;
						left: 0;
						width: 100%;
						height: 2px;
						border-top-right-radius: 2px;
						border-top-left-radius: 2px;
						background: $primary;
						transform: translate3d(0,0,0);
						transition: transform 0.2s ease;
					}

					&.active {
						color: $primary;

						&::before {
							transform: translate3d(0,-100%,0);
						}
					}
				}
			}

			h2 {
				color : $primary;
			}
		}

		.page {
			padding-top: 49px; // height of schools bar
		}

	}


@media only screen and ( min-width : 993px ) {

	#cte {
		.top-bar {
			.top {
				.icon-toggle {
					opacity: 0;
					pointer-events: none;
				}
			}
		}
	}

}

</style>
