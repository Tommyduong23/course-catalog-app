<template lang='pug'>
.swiper-container(ref='swiperContainer')
	.swiper-wrapper
		.swiper-slide(
			v-for='i in options.numberOfSlides'
		)
			slot(:name='`slide-${i}`')
</template>

<script>
import Swiper from 'swiper/dist/js/swiper';
import 'swiper/dist/css/swiper.css';

export default {
	name : 'swiper',

	props : {
		options : {
			type     : Object,
			required : true,
		},

		activeSlide : {
			type    : Number,
			default : null,
		}
	},

	watch : {
		activeSlide( slide ) {
			this.swiper.slideTo( slide );
		}
	},

	mounted() {
		const { swiperContainer } = this.$refs;
		this.swiper = new Swiper( swiperContainer, this.options.config );

		this.$emit( 'swiper', this.swiper );
		this.$emit( 'init', this.swiper );

		const events = [
			'slideChangeTransitionEnd',
		];

		events.forEach( ( event ) => {

			this.swiper.on( event, () => {
				const domFriendlyEvent = event.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();

				this.$emit( domFriendlyEvent, this.swiper );
			} );

		} );
	},

	beforeDestroy() {
		this.$emit( 'destroy' );
	}
};
</script>

<style lang='scss'>
.swiper-container,
.swiper-slide {
	// min-height: calc(100vh + 30px);
}
</style>
