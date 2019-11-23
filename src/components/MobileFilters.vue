<template lang="pug">
.filters.mobile.nested-swiper(:class='state')
	.panel.easy-scroll
		.filter.box(
			v-for='filter in filters'
		)
			.tiles-container(
				v-if='filter.type == "list" || filter.type == "multi-list"'
				@click='activeMobileFilter = filter.key'
				@mouseleave='opened[filter.key] = false'
			)
				.title {{ filter.key }}
				.tiles.easy-scroll
					.tile(
						v-for='( option, i ) in filter.options'
						:class='{ active : selectedFilters[filter.key] === option.value }'
						@click.stop='toggleOption( filter, option )'
					)
						p {{ option.value }}
		.filter.box
			.tiles-container
				//- kinda hacky, kinda not. this
				//- displays all of our boolean
				//- filters as though they were a multi
				//- select in the mobile filters.
				//-
				//- If you add a boolean filter, it'll
				//- show up here so make sure that the
				//- title "Rigor" is still relevant if
				//- you do!!
				.title Rigor
				.tiles.easy-scroll
					.tile(
						v-for='filter in booleanFilters'
						:class='{ active : selectedFilters[filter.key] }'
						@click.stop='selectedFilters[filter.key] = !selectedFilters[filter.key]'
					)
						p {{ filter.key }}
	.buttons
		.display-text.secondary(@click='resetFilters') reset
		.display-text(@click='toggleFilterState')
			.text(:class='{ hidden : state === "closed" }') minimize
			.text(:class='{ hidden : state === "open" }') filters
</template>

<script>
export default {
	name : 'mobile-filters',

	data : () => ( {
		state : 'closed',

		activeMobileFilter : '',
	} ),

	computed : {
		filters() {
			return this.$store.state.filters;
		},

		selectedFilters() {
			return this.$store.state.selectedFilters;
		},

		opened() {
			return this.$store.state.openedFilters;
		},

		booleanFilters() {
			// yo dawg, I heard you like filters
			// so I filtered your filters by their filters
			// so that you can have filters while you
			// filter your filters.
			return this.filters.filter( ( { type } ) => type === 'boolean' );
		},

	},

	methods : {
		toggleOption( filter, option ) {
			const { value } = option;
			const { key } = filter;

			const payload = {
				key,
				value,
			};

			this.$store.dispatch( 'selectFilter', payload );
		},

		resetFilters() {
			// reset each filter
			this.filters.forEach( ( filter ) => {
				const { key, type } = filter;

				switch ( type ) {

					case 'boolean': {
						const payload = {
							key,
							value : false,
						};

						this.$store.dispatch( 'selectFilter', payload );

						break;
					}

					case 'arbitrary': {
						const payload = {
							key,
							value : false,
						};

						this.$store.dispatch( 'selectFilter', payload );

						break;
					}

					case 'list': {
						const defaultVal = filter.options[0].value;

						const payload = {
							key,
							value : defaultVal
						};

						this.$store.dispatch( 'selectFilter', payload );

						break;
					}

					case 'multi-list': {
						const defaultVal = filter.options[0].value;

						const payload = {
							key,
							value : defaultVal
						};

						this.$store.dispatch( 'selectFilter', payload );

						break;
					}

					default: {
						break;
					}
				}

			} );
		},

		toggleFilterState() {

			if ( this.state === 'closed' ) {
				this.state = 'open';

				return;
			}

			this.state = 'closed';

		},

		setOpened( type, value ) {
			const payload = {
				type,
				value
			};
			this.$store.dispatch( 'updateOpened', payload );
		}
	}
};
</script>

<style lang="scss">
	@import '@/assets/variables.scss';

	.filters.mobile {
		display: none;
	}

	@media only screen and (min-width : 1px) and (max-width : 575px) {
		.filters.mobile {
			display: block;
			position: absolute;
			height: 100vh;
			width: 100vw;
			top: 0;
			left: 0;
			z-index: 10;
			pointer-events: none;

			&.open {
				pointer-events: all;
				z-index: 12;

				.display-text {
					transform: translate3d( 10px, 0, 0 );

					&.secondary {
						transform: translate3d( calc(-100% - 10px), 0, 0 );
						opacity: 1;
					}
				}

				.panel {
					opacity: 1;
					pointer-events: all;
				}
			}

			.panel {
				height: 100vh;
				width: 100vw;
				background-color: rgba(255,255,255,0.8);
				-webkit-backdrop-filter: blur(5px);
				backdrop-filter: blur(5px);
				z-index: 10;
				transform: translate3d(0,0,0);
				opacity: 0;
				transition: transform 0.3s ease, opacity 0.3s ease;
				overflow: auto;
				padding: 0 10px;
				padding-bottom: 120px;

				.filter {
					margin-top: 30px;
				}

				.tiles-container {

					.title {
						font-size: 24px;
						color: $primary;
						font-weight: 600;
						padding: 15px;
						padding-top: 0;
					}

					.tiles {
						display: flex;
						flex-direction: row;
						flex-wrap: wrap;
						padding: 0 10px;

						.tile {
							flex: 0 0 auto;
							padding: 5px 10px;
							border-radius: 5px;
							color: $grey;
							font-size: 14px;
							border: 1px solid $grey;
							margin: 5px;

							&.active {
								color: white;
								font-weight: 600;
								border: 1px solid transparent;
								background-image: linear-gradient(to top right, $primary, lighten( $primary, 15 ));
							}
						}
					}
				}

				.boolean {
					position: relative;
					width: calc(100% - 20px);
					margin: 0 15px;
					padding: 10px;
					border-radius: 5px;
					border: 1px solid $grey;

					&.active {
						border: 1px solid white;
						background-image: linear-gradient(to top right, $primary, lighten( $primary, 15 ));

						p {
							color: white;
							font-weight: 600;
						}

						&::before {
							background: white;
							border: 1px solid white;
						}

						&::after {
							opacity: 1;
						}
					}

					&::before {
						content : ' ';
						position: absolute;
						top: 50%;
						left: 20px;
						height: 15px;
						width: 15px;
						border-radius: 3px;
						border: 1px solid $grey;
						transform: translate(-50%,-50%);
					}

					&::after {
						content: ' ';
						position: absolute;
						top: 50%;
						left: 20px;
						height: 8px;
						width: 4px;
						border: 2px solid $primary;;
						border-top: 0px solid transparent;
						border-left: 0px solid transparent;
						transform: translate(-50%,-66%) rotate(45deg);
						opacity: 0;
					}

					p {
						width: 100%;
						text-align: center;
					}
				}
			}

			.display-text {
				pointer-events: all;
				padding: 15px 20px;
				text-transform: uppercase;
				font-weight: 600;
				letter-spacing: 3px;
				border-radius: 30px;
				background-image: linear-gradient(to top right, $primary, lighten( $primary, 15 ));
				-webkit-backdrop-filter: blur(2px);
				backdrop-filter: blur(2px);
				color: white;
				box-shadow: $floatingObject;
				white-space: nowrap;
				position: absolute;
				left: 50%;
				transform: translate3d(-50%, 0, 0);
				bottom: 60px;
				display: flex;
				align-items: center;
				justify-content: center;
				transition: transform 0.5s ease, opacity 0.5s ease;
				width: calc(50vw - 20px);

				&.secondary {
					background-image: linear-gradient(to top right, $cancel, lighten( $cancel, 10 ) );
					transform: translate3d(-200%, 0, 0);
					opacity: 0
				}

				.text {
					overflow: hidden;
					white-space: nowrap;
					text-overflow: clip;
					max-width: 50vw;
					transition: max-width 0.5s ease;

					&.margin-before {
						margin-left: 3px;

						&.hidden {
							margin-left: 0;
						}
					}

					&.margin-after {
						margin-right: 3px;

						&.hidden {
							margin-right: 0;
						}
					}

					&.hidden {
						max-width: 0;
					}
				}
			}
		}
	}
</style>
