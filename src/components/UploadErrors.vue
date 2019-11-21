<template lang="pug">
.swiper-container#upload-errors(ref='swiper')
	.swiper-wrapper
		.swiper-slide.empty
		.swiper-slide(:class='{ open : opened }' )
			.main(:class='{ open : opened }')
				.header
					h1 Uploading SpreadSheets
					.icon-close(@click='close')
				.body(:class='{ active : state === "upload" }')
					.big
						h1 Click button to upload courses
				.body(:class='{ active : state === "loading" }')
						.loading-indicator
							.loading-circles
								span
								span
								span
				.body(:class='{ active : state === "success" }')
					.big.green
						h1 Upload successful!
						i.material-icons check_circle
				.body(:class='{ active : state === "fail" }')
					p Upload failed. Fix the following errors on the google sheet
					.errors
						h2 Errors
						.error(v-for='error in errors' :class='error.type')
							.icon
								i.material-icons error
							.text
								p.title {{ error.sheet }}
								p {{ error.msg }}
				.body(:class='{ active : state === "error" }')
					.big.red
						h1 Application Error
						i.material-icons error
				.footer
					.button(@click='upload') Upload

</template>

<script>
import Swiper from 'swiper';

export default {
	name : 'upload-errors',

	data : () => ( {
		swiper      : null,
		activeSlide : 0,
	} ),

	computed : {
		opened() {
			return this.$store.state.uploadOpened;
		},

		state() {
			return this.$store.state.uploadErrorsState;
		},

		errors() {
			return this.$store.state.uploadErrors;
		},
	},

	mounted() {
		this.initSwiper();
	},

	watch : {
		opened( opened ) {

			if ( !this.swiper ) {
				return;
			}

			if ( !opened ) {
				this.swiper.slideTo( 0 );
				return;
			}

			if ( opened ) {
				this.swiper.slideTo( 1 );
				return;
			}

		},

		activeSlide( slide ) {

			if ( slide === 0 && this.opened ) {
				this.close();
			}

			if ( slide === 1 && !this.opened ) {
				this.open();
			}

		},

	},

	methods : {
		initSwiper() {

			const self       = this;
			const { swiper } = this.$refs;
			this.swiper = new Swiper( swiper, {
				// auto initialize this swiper
				init         : true,
				initialSlide : this.activeSlide,

				// swiper settings
				slidesPerView   : 1,   // force every slide to be 100vw
				speed           : 400, // ms for when you let go of swipe
				spaceBetween    : 0,   // no space between
				resistanceRatio : 0,   // stops you from swiping past all slides
				direction       : window.innerWidth > 375 ? 'vertical' : 'horizontal',

				threshold : 50, // min distance for scroll to work

				on : {

					slideChangeTransitionEnd() {
						self.activeSlide = this.activeIndex;
					}

				}
			} );

		},

		close() {
			this.$store.dispatch( 'closeUpload' );
		},

		open() {
			this.$store.dispatch( 'updateStore', ['uploadOpened', true] );
		},

		upload() {
			this.$store.dispatch( 'upload' );
		}

	}

}
</script>

<style lang="scss">
#upload-errors {

	.swiper-slide.empty + .swiper-slide {
		background: rgba(255,255,255,0.8) !important;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.main {
		background: white;
		border-radius: 10px;
		box-shadow: $floatingObject;
		overflow: hidden;
		width: 80%;
		max-width: 800px;
		opacity: 0;
		transition: opacity 0.2s ease;
		position: relative;
		height: 500px;
		display: flex;
		flex-direction: column;

		&.open {
			opacity: 1;
		}

		.loading-indicator {
			background: white;
			border-radius: 10px;

			.loading-circles {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
			}
		}

		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 25px;

			h1 {
				color : $primary;
			}
		}

		.body {
			display: none;
			flex-direction: column;
			flex: 1 1 0;
			opacity: 0;
			pointer-events: none;
			transition: all .2s ease;
			overflow: auto;
			padding: 0px 25px 25px;

			&.active {
				display: flex;
				opacity: 1;
				pointer-events: all;
			}

			.big {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				flex: 1 0 0;

				&.green {
					color: $confirm;
				}

				&.red {
					color: $cancel;
				}

				h1 {
					font-size: 40px;
					margin-bottom: 15px;
					color: $primary;
				}

				i.material-icons {
					font-size: 100px;
				}

			}


			.errors {
				margin-top: 25px;

				.error {
					display: flex;
					align-items: center;
					margin: 10px 0px;
					padding: 10px;
					border-bottom: 1px solid $secondary;

					&.warning {
						.icon {
							i.material-icons {
								color: $warning;
							}
						}
					}

					&.fatal {
						.icon {
							i.material-icons {
								color: $cancel;
							}
						}
					}

					p.title {
						font-weight: 600;
						font-size: 18px;
					}

					.icon {
						margin-right: 10px;

						i.material-icons {
							font-size: 30px;
						}

					}

				}
			}
		}

	}

}

</style>
