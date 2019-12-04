<template lang="pug">
	.subjects
		.subject-column(:class='subjectState')
			//- .subjects.easy-scroll
			//- 	p.subject(
			//- 		v-for='option in primaryOptions'
			//- 		@click='subjectState = "closed"; selectOption( option, true )'
			//- 		:class='{ active : option.value == selectedFilters[primaryFilter.name] }'
			//- 	) {{option.name}}
			//- .close(@click='subjectState = "closed"') close

		.subjects-wrapper
			.subject-list.swiper-no-swiping.noselect.easy-scroll(ref='subjectsBar')
				p.subject(
					v-for='option in primaryOptions'
					:class='{ active : option.value == selectedFilters[primaryFilter.key] }'
					:ref='option.value'
					@click='selectOption( option )'
				) {{ option.value }}

</template>

<script>
export default {
	name : 'subjects',

	props : {
		subjectState : {
			required : true,
			type     : String,
			default  : ''
		},
	},

	data : () => ( {

	} ),

	computed : {

		filters() {
			return this.$store.state.filters;
		},

		model() {
			return this.$store.state.model;
		},

		primaryFilter() {

			const { model, filters } = this;

			const { primaryFilter } = model;

			if ( !primaryFilter ) {
				return {};
			}

			const filter = filters.find( a => a.key === primaryFilter );

			return filter;
		},

		primaryOptions() {

			const filter = this.primaryFilter;
			if ( !Object.keys( filter ).length ) {
				return [];
			}

			return filter.options;
		},


		selectedFilters() {
			return this.$store.state.selectedFilters;
		},


	},

	methods : {
		selectOption( option, scrollTo = false ) {

			const { primaryFilter } = this;

			const payload = {
				key   : primaryFilter.key,
				value : option.value
			};

			this.$store.dispatch( 'selectFilter', payload );

		},

		toggleSubjectBar() {
			this.$emit( 'toggle-subject-bar' );
		}
	}

};
</script>

<style lang="scss">

@import '@/assets/variables.scss';

.subjects-wrapper {
	display: flex;
	align-content: center;
	justify-content: center;

	.subject-list {
		display: flex;
		transition: opacity 0.2s ease;
		overflow-y: hidden !important;

		.subject {
			height: 100%;
			padding: 10px 15px;
			cursor: pointer;
			transition: all .2s ease;
			margin: 0;
			position: relative;
			white-space: nowrap;

			&::after {
				content: ' ';
				opacity: 0;
				height: 2px;
				width: 100%;
				background: transparent;
				position: absolute;
				top: 100%;
				left: 0;
				transform: translate3d(0,0,0);
				transition: all 0.2s ease;
				border-radius: 2px;
			}

			&.active {
				color: $primary;

				&::after {
					opacity: 1;
					background: $primary;
					transform: translate3d(0,-100%,0);
				}
			}
		}

		.dropdown-menu {
			position: relative;
			display: flex;
			align-items: center;
			padding: 5px;
			margin: 5px 10px;
			cursor: pointer;
			color: #646971;
			transition: all .2s ease;
			padding-right: 25px;

			p {
				font-weight: 400;
			}

			&.opened {

				&:after {
					transform: translate(-100%,-34%) rotate(225deg);
				}

				.arrow {
					opacity: 1;
					pointer-events: all;
				}

				.options {
					opacity: 1;
					pointer-events: all;
				}
			}

			&:after {
				position: absolute;
				width: 4px;
				height: 4px;
				top: 50%;
				right: 0;
				border-right: #4a4a4a solid 2px;
				border-bottom: #4a4a4a solid 2px;
				transform: translate(-100%,-66%) rotate(45deg);
				transition: all .2s ease;
				content: ' ';
			}

			.arrow {
				position: absolute;
				height: 30px;
				width: 100%;
				overflow: hidden;
				top: 100%;
				left: 50%;
				transform: translateX(-50%);
				z-index: 10;
				opacity: 0;
				transition: opacity 0.2s ease;
				pointer-events: none;

				&::before {
					content: ' ';
					height: 30px;
					width: 30px;
					background: white;
					box-shadow: $floatingObject;
					position: absolute;
					top: 100%;
					left: 50%;
					transform: translate(-50%,-50%) rotate(45deg);
				}
			}

			.options {
				opacity: 0;
				padding: 5px;
				transition: all .2s ease;
				pointer-events: none;
				position: absolute;
				box-shadow: $floatingObject;
				top: calc(100% + 30px);
				left: 50%;
				min-width: 200px;
				border-radius: 10px;
				transform: translateX(-50%);
				background-color: white;
				white-space: nowrap;
				z-index: 1;

				.option {
					display: flex;
					padding: 5px 10px 5px 35px;
					position: relative;

					&::after {
						content: " ";
						position: absolute;
						top: 50%;
						left: 10px;
						height: 12px;
						width: 12px;
						border: 2px solid $primary;
						transform: translateY(-50%);
						border-radius: 3px;
					}

					&.active {

						&::after {
							background-color: $primary;
						}

						&::before {
							content: " ";
							height: 4px;
							width: 8px;
							position: absolute;
							top: 18px;
							left: 12px;
							border-left: 3px solid white;
							border-bottom: 3px solid white;
							transform: translateY(calc(-50% - 3px)) rotate(-45deg);
							z-index: 10;
						}
					}
				}
			}
		}
	}
}

.subject-column {
	display: none;
}

@media only screen and (min-width : 1px) and (max-width : 575px) {
	.subject-column {
		overflow: hidden;
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate3d(-50%,0,0);
		width: 100%;
		padding-bottom: 15px;
		background: white;
		transition: transform 0.5s ease, box-shadow 0.5s ease;
		max-height: 100vh;
		box-shadow: $floatingObject;
		z-index: 10;
		display: block;

		&.closed {
			transform: translate3d(-50%,-100%,0);
			box-shadow: none;

			.subjects {
				opacity: 0;
			}
		}

		p {
			color: $grey;
		}

		.subjects {
			max-height: 50vh;
			opacity: 1;
			transition: opacity 0.2s ease;
			overflow: auto;
			display: flex;
			flex-wrap: wrap;
			padding: 0 10px;

			.subject {
				font-size: 16px;
				margin: 5px;
				padding: 5px 10px;
				border-radius: 5px;
				border: 1px solid $grey;
				color: $grey;
				flex: 0 0 auto;
				white-space: nowrap;

				&.active {
					background-image: linear-gradient( to top right, $primary, lighten( $primary, 15 ) );
					color: white;
					font-weight: 600;
				}
			}
		}

		.close {
			text-align: center;
			color: $cancel;
			font-size: 14px;
			text-transform: uppercase;
			font-weight: 600;
			padding: 15px;
			margin-top: 10px;
			letter-spacing: 3px;
		}
	}

	.subjects-wrapper {

		.subject-list {
			justify-content: flex-start !important;
			padding: 0 30px;

			.subject {
				border-radius: 0;
				flex-shrink: 0;

				&.active {
					background: transparent;
					box-shadow: none;
					color: $primary;
				}
			}
		}
	}
}


</style>
