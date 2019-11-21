<template lang="pug">
.swiper-container#course-info(ref='swiper' v-cloak)
	.swiper-wrapper
		.swiper-slide.empty
		.swiper-slide(:class='state')
			.main.easy-scroll(:class='state')
				.loading-indicator(v-if='loadingCourse')
						.loading-circles
						span
						span
						span
				.top-bar
					.back-button(@click='close') back
					.button(@click='saveCourse( course )' :class='{ saved }')
						.check(:class='{ active : saved }')
						.text
							span Save
							span.collapseable.no-space(:class='{ hidden : !saved }') d
				.wrapper
					.icon-close(@click='close')
					.text-description(v-if='!loadingCourse')
						h1 {{ course[titleKey] }}
						.number Course \#{{ course[uniqueKey] }}
						p {{ course[descriptionKey] }}
						.button(@click='saveCourse( course )' :class='{ saved }')
							.check(:class='{ active : saved }')
							.text
								span Add
								span.collapseable.no-space(:class='{ hidden : !saved }') ed
								span to Saved Courses
					.quick-facts(v-if='!loadingCourse')
						.header
							.label Quick Facts
							.number Course \#{{ course[uniqueKey] }}
						.fact(v-for='fact in facts' v-if='fact.value')
							.content(v-if='fact.type == "boolean"')
								span.bold {{ fact.label }} course
							.content(v-if='fact.type == "label-list"')
								span.bold {{ fact.label }}:
								p(v-for='v in fact.value' ) {{ v.value }}
							.content(v-if='fact.type == "list"')
								span.bold {{ fact.label }}:
								span {{ fact.value }}
							.content(v-if='fact.type == "arbitrary"')
								span.bold {{ fact.label }}:
								span {{ fact.value }}

</template>

<script>
import Swiper from 'swiper';

import { HasProperty, ObjToArray } from '@/lib/utils';
import { Ref } from '@/lib/db';

export default {
	name : 'course-info',

	data : ()=> ( {
		saved : false,

		swiper      : null,
		activeSlide : 0,

		loadingCourse : false,
	} ),

	computed : {

		course() {
			return this.$store.state.activeCourse;
		},

		user() {
			return this.$store.state.user;
		},

		state() {
			return this.$store.state.courseInfoState;
		},

		model() {
			return this.$store.state.model;
		},

		uniqueKey() {
			return this.model.uniqueKey;
		},

		titleKey() {
			return this.model.title;
		},

		descriptionKey() {
			return this.model.description;
		},

		facts() {
			const { course } = this;
			const { quickFacts } = this.model;

			if ( !quickFacts ) {
				return [];
			}

			const facts = quickFacts.map( ( { type, key } ) => {
				return {
					type,
					label : key,
					value : course[key]
				};
			} );

			return facts;
		},

		activeKey() {

			if ( !this.course ) {
				return null;
			}

			if ( !HasProperty( this.course, 'key' ) ) {
				return null;
			}

			return this.course.key;

		},

	},

	mounted() {
		this.initSwiper();
	},

	watch : {

		state( state ) {

			if ( !this.swiper ) {
				return;
			}

			if ( state === 'closed' ) {
				this.swiper.slideTo( 0 );
				return;
			}

			if ( state === 'open' ) {
				this.swiper.slideTo( 1 );
				return;
			}

		},

		activeSlide( slide ) {

			if ( slide === 0 && this.state !== 'closed' ) {
				this.close();
			}

			if ( slide === 1 && this.state !== 'open' ) {
				this.state = 'open';
			}

		},

		activeKey( key ) {
			this.saved = false;

			const { user } = this;
			if ( !user || !key ) {
				return;
			}

			Ref
				.child( 'savedCourses' )
				.child( user.uid )
				.child( key )
				.on( 'value', ( snapshot ) => {
					const saved = snapshot.val();

					this.saved = ( saved !== null );
				} );
		},

		course( course ) {

			if ( !Object.keys( course ).length ) {
				this.loadingCourse = true;
				return;
			}

			this.loadingCourse = false;

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
			this.$router.push( {
				path : this.$route.path,
			} );
		},

		saveCourse( course ) {
			const { key } = course;

			this.$store.dispatch( 'saveCourse', key );
		},

	}
};
</script>

<style lang="scss">
#course-info {

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

		.loading-indicator {
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 10;
			background: white;
			border-radius: 10px;

			.loading-circles {
				position: absolute;
				top: 50%;
				left: 50%;
				transform: translate(-50%,-50%);
			}
		}

		&.open {
			opacity: 1;
		}

		.button {
			background-color: $primary;
			border-radius: 5px;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 10px;
			cursor: pointer;
			transition: background 0.2s ease;

			&.saved {
				background: $confirm;
			}

			.check {
				margin-right: 15px;

				&::before,
				&::after {
					background: white;
				}

				&.active {
					background: white;

					&::before,
					&::after {
						background: $confirm;
					}

					&::after {
						box-shadow: 6px 2px 0px 3px white;
					}
				}
			}

			.text {
				color: white;

				span {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: clip;
					display: inline-block;

					&.collapseable {
						transition: max-width 0.5s ease;
						max-width: 20px;
					}

					&:not(:nth-child(1)):not(.no-space) {
						margin-left: 4px;
					}

					&.hidden {
						max-width: 0;
					}
				}
			}
		}

		.top-bar {
			display: none;
		}

		.wrapper {
			display: flex;
			flex-direction: row-reverse;
			position: relative;

			.text-description,
			.quick-facts {

				* {
					opacity: 0;
					transform: translate3d(0,30px,0);
					animation: slide-up-and-in 0.2s ease forwards;
				}
			}

			.icon-close {
				position: absolute;
				top: 30px;
				right: 30px;
				z-index: 10;
			}

			.text-description {
				padding: 30px;
				flex: 2 2 0;
				display: flex;
				flex-direction: column;

				* {

					&:nth-child(2) {
						animation-delay: 0.05s;
					}

					&:nth-child(3) {
						animation-delay: 0.1s;
					}
				}

				h1 {
					padding-right: 30px; // makes sure we don't overlap with x button
					color: $primary;
				}

				.number {
					text-transform: uppercase;
					letter-spacing: 3px;
					font-size: 14px;
					margin: 5px 0 15px 0;
				}

				p {
					flex: 1 1 0;
				}

				.button {
					margin-top: 15px;
					width: 100%;
				}
			}

			.quick-facts {
				padding: 30px;
				background-color: $secondary;
				flex: 1 1 0;

				* {

					&:nth-child(2) {
						animation-delay: 0.15s;
					}

					&:nth-child(3) {
						animation-delay: 0.2s;
					}

					&:nth-child(4) {
						animation-delay: 0.25s;
					}

					&:nth-child(5) {
						animation-delay: 0.3s;
					}

					&:nth-child(6) {
						animation-delay: 0.35s;
					}

					&:nth-child(7) {
						animation-delay: 0.4s;
					}

					&:nth-child(8) {
						animation-delay: 0.45s;
					}

					&:nth-child(9) {
						animation-delay: 0.5s;
					}

				}

				.header {

					.label {
						font-size: 24px;
						font-weight: 400;
						color: $primary;
					}

					.number {
						text-transform: uppercase;
						margin-top: 5px;
						font-size: 14px;
						color: $grey;
					}
				}

				.fact {
					margin-top: 15px;

					span {

						&.bold {
							font-weight: 600;

							&::after {
								content: " ";
							}
						}
					}
				}
			}
		}
	}
}

/* keyframes */
@keyframes slide-up-and-in {
	0% {
		transform: translate3d(0,30px,0);
		opacity: 0;
	}
	100% {
		transform: translate3d(0,0,0);
		opacity: 1;
	}
}

/* phones and big phones */
@media only screen and ( max-width : 575px ) {

	#course-info {

		.main {
			width: 100vw;
			height: 100vh;
			border-radius: 0;
			overflow: auto !important;

			.top-bar {
				width: 100%;
				padding: 30px;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.back-button {
					padding-left: 20px;
					position: relative;
					color: $grey;
					text-transform: uppercase;
					cursor: pointer;
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 3px;

					&::before {
						content: ' ';
						position: absolute;
						height: 8px;
						width: 8px;
						border: 2px solid $grey;
						border-right: none;
						border-bottom: none;
						left: 2px;
						top: 50%;
						transform: translateY(-50%) rotate(-45deg);
					}
				}

				.button {
					padding: 5px 20px 5px 10px;

					.check {
						transform: scale(0.65,0.65);
						margin-right: 5px;
					}

					span {
						text-transform: uppercase;
						font-weight: 600;
					}
				}
			}

			.wrapper {
				display: block;
				margin-bottom: 100px;

				.button,
				.icon-close {
					display: none !important;
				}

				.text-description {
					padding: 0 30px 15px 30px;
				}

				.quick-facts {
					background-color: transparent;
					padding-top: 0;

					.header {
						display: none;
					}

					.fact {

						&:nth-child(1) {
							margin-top: 0;
						}

						span.bold {
							color: $primary;
						}
					}
				}
			}
		}
	}
}

</style>
