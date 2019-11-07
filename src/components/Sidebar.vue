<template lang="pug">
	#sidebar.noselect(:class='state' v-cloak)
		.top(:class='{ userIsAdmin }' @scroll='updateOpacity')
			.logo
				img(src='/img/logo.png' :style='{ opacity : logoOpacity }')
				h2 Course Catalog
			.links
				.link(
					v-for='route in routes'
					v-bind:to='route.path'
					router
					@click='routeTo( route.path )'
				)
					h3 {{ route.name }}
					p {{ route.description }}
			.btns
				h1.header quick links
				.btns-wrapper
					a.floating-btn(:href='tempURL' target='_blank')
						p Course Guide
						.icon-leave
					a.floating-btn(:href='tempURL' target='_blank')
						p Graduation Requirements
						.icon-leave
		.bottom
			.button(@click='openUpload') Upload
</template>

<script>
import FileUpload from '@/components/FileUpload';
import { Ref, FirebaseKey } from '@/lib/db';
import { Upload } from '@/lib/API';

export default {
	name : 'sidebar',

	data : () => ( {

		state          : 'open',
		showFileUpload : true,

		routes : [
			{
				name        : 'Courses',
				path        : 'courses',
				description : 'Math, Social Sciences, English, Electiv...',

			},
			{
				name        : 'Career Technical Education',
				path        :	'cte',
				description : 'Agriculture, Arts & Media, Building an...',
			},
			{
				name        : 'Saved Courses',
				path        : 'saved',
				description : 'The courses that you’ve saved for lat...',
			},
		],

		logoOpacity : 1,

		tempURL : 'https://firebasestorage.googleapis.com/v0/b/lcap-glass.appspot.com/o/Document1.pdf?alt=media&token=b6349e92-0f05-4f19-8432-fda6fca509b9',

		userIsAdmin : false,

		allowedExt : ['csv']

	} ),

	computed : {

		user() {
			return this.$store.state.user;
		},

		isAdmin() {
			return this.$store.state.isAdmin;
		},

		sideMenuSwiper() {
			return this.$store.state.sideMenuSwiper;
		},

	},

	methods : {

		toggleSlide() {

			this.$store.dispatch( 'toggleSideMenu' );

		},

		routeTo( route ) {


			this.$store.dispatch( 'closeCourseInfo' );
			this.$store.dispatch( 'closeSectorUpload' );
			this.$router.push( route );

		},

		updateOpacity( e ) {
			this.logoOpacity = 1 - ( e.target.scrollTop / 85 );
		},

		openUpload() {
			this.$store.dispatch( 'updateStore', ['uploadOpened', true] );
		}

	},

	components : {
		FileUpload
	}
};

</script>

<style lang="scss">
	@import '@/assets/variables.scss';

	#sidebar {
		background : $primary;
		width: 275px;
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: space-between;

		.handle {
			display: none;
		}

		&.closed {
			width: 60px;
			background-color: transparent;
		}

		.top {
			overflow: auto;
			flex: 1 1 0;

			.logo {
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 20px;
            border-bottom: lighten( $primary, 15 ) solid 2px;

				img {
					width: 75px;
					height: 75px;
					border-radius: 100px;
				}

				h2 {
					margin-top: 10px;
					color: white;
				}

			}

			.links {
				display: flex;
				flex-direction: column;

				.link {
					color: white;
					padding: 20px;
					border-bottom: lighten( $primary, 15 ) solid 2px;
					cursor: pointer;

					&:hover {
						background-color: darken( $primary, 5 );
					}

					&.router-link-active {
						background-color: darken( $primary, 5 );
					}

					h3 {
						pointer-events: none;
					}

					p {
						pointer-events: none;
						margin-top: 5px;
						font-weight: 300;
						font-size: 14px;
						white-space: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;
						color: white;
					}

				}
			}

			.btns {
				margin-top: 30px;

				.header {
					color: white;
					font-size: 14px;
					text-transform: uppercase;
					letter-spacing: 5px;
					padding: 0 30px;
					text-align: center;
				}

				.btns-wrapper {

					.floating-btn {
						box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.2);
						border-radius: 5px;
						padding: 10px;
						margin: 10px;
						text-align: center;
						background-color: white;
						cursor: pointer;
						text-transform: uppercase;
						font-weight: 600;
						display: flex;
						justify-content: space-between;
						align-items: center;
						text-decoration: none !important;
						transform: scale(1,1);
						transition: transform 0.2s ease;

						&:active {
							transform: scale(0.9,0.9);
						}

						p {
							text-align: left;
							text-transform: capitalize;
							font-size: 14px;
							font-weight: 400;
						}

						&:visited p,
						&:visited .icon-leave,
						p,
						.icon-leave {
							color: $primary;
						}
					}
				}
			}
		}

		.bottom {
			flex: 0 0 auto;
			position: absolute;
			bottom: 0;
			left: 0;
			width: 100%;

			.button {
				background-color: white;
				color: $primary;
				margin: 10px;
			}

			.file-upload {
				display: flex;
				flex-direction: column;
				justify-content: flex-end;

				.drop-zone {
					background: #2f5491e6;
					box-shadow: $floatingObject;
				}
			}
		}
	}

	/* big and small phones */
	@media only screen and (min-width : 1px) and (max-width : 575px) {

		#sidebar {

			.top {
				padding-bottom: 0 !important;
			}

			.bottom {
				display: none;
			}
		}
	}
</style>
