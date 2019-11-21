<template lang="pug">
	.filters-wrapper
		.filters.noselect(ref='filters')
			.filter(v-for='filter in filters' :class='filter.class')
				.dropdown-menu(
					v-if='filter.type == "list" || filter.type == "label-list"'
					:class='{ opened : openedFilters[filter.key], hidden : filter.key === primaryKey}'
					@click='setOpened( filter.key, !openedFilters[filter.key] )'
					@mouseleave='setOpened( filter.key, false )'
				)
					p {{ filter.key }}
					.arrow
					.options(
						:ref='filter.key'
						:class='optionsClasses[filter.key]'
					)
						.option(
							v-for='option in filter.options'
							:class='{ active : selectedFilters[filter.key] == option.value }'
							@click.stop='toggleOption( filter, option )'
						)
							p {{ option.value }}
				.boolean(v-if='filter.type == "boolean"' :class='{ active : selectedFilters[filter.key] }' @click='toggleBoolean( filter )')
					p {{ filter.key }}
				.boolean(v-if='filter.type == "arbitrary"' :class='{ active : selectedFilters[filter.key] }' @click='toggleBoolean( filter )')
					p {{ filter.key }}
</template>

<script>
export default {
	name : 'filters',

	data : () => ( {
		optionsClasses : {}, // For offseting the dropdowns when they are on the edge of the
	} ),

	computed : {
		filters() {
			return this.$store.state.filters;
		},
		selectedFilters() {
			return this.$store.state.selectedFilters;
		},
		openedFilters() {
			return this.$store.state.openedFilters;
		},
		primaryKey() {
			return this.$store.state.model.primaryFilter;
		}
	},

	watch : {
		filters( filters ) {

			if ( !filters.length ) {
				return;
			}

			this.$nextTick( () => {
				this.optionsClasses = {};

				const leftBound = this.$refs.filters.getBoundingClientRect().left;

				const listFilters = filters.filter( a => a.type === 'list' || a.type === 'label-list' );

				listFilters.forEach( ( filter ) => {
					const { key } = filter;

					const elBounds = this.$refs[key][0].getBoundingClientRect();

					const { width } = elBounds;
					const { left }  = elBounds;

					if ( left - width / 2 < leftBound ) {
						this.optionsClasses[key] = 'left';
					}

				} );

			} );

		},
	},

	methods : {

		position( filter ) {
			const { key } = filter;
			const ref = this.$refs[key];

			if ( !ref ) {
				return '';
			}

			const filtersElBounds = this.$refs.filters.getBoundingClientRect();

			const el = ref[0];

			const elBounds = el.getBoundingClientRect();

			if ( elBounds.left + 25 < filtersElBounds.left ) {
				return {
					left : '150%'
				};
			}

			if ( elBounds.right > filtersElBounds.right ) {
				return 'right';
			}

			return '';

		},

		toggleOption( filter, option ) {
			const { value } = option;
			const { key } = filter;

			const payload = {
				key,
				value,
			};

			this.$store.dispatch( 'selectFilter', payload );
		},

		toggleBoolean( filter ) {
			const { key } = filter;

			const payload = {
				key,
				value : !this.selectedFilters[key]
			};

			this.$store.dispatch( 'selectFilter', payload );
		},

		setOpened( key, value ) {
			const payload = {
				key,
				value
			};
			this.$store.dispatch( 'updateOpened', payload );
		}
	},
};
</script>

<style lang="scss">
	@import '@/assets/variables.scss';

	.filters-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;

		&::before {
			content: ' ';
			height: 45px;
			width: 100%;
			position: absolute;
			left: 0;
			top: 0;
			background: white;
			box-shadow: $floatingObject
		}

		.filters {
			display: flex;
			justify-content: center;
			width: 100%;
			height: calc(100vh - 16px );
			align-items: flex-start;
			overflow: auto;

			.dropdown-menu {
				position: relative;
				display: flex;
				align-items: center;
				padding: 10px 10px;
				cursor: pointer;
				color: #646971;
				transition: all .2s ease;
				padding-right: 25px;

				&.hidden {
					display : none;
				}

				p {
					color : $primary;
				}

				&::after {
					border-color: $primary;
				}

				&.opened {

					&::after {
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
					min-width: 250px;
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

					&.left {
						left : 0%;
						transform: translateX(0%);
					}

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

		.filter {
			display: flex;
			align-items: center;
			white-space: nowrap;
			pointer-events: all;

			p {
				font-size: 14px;
				font-weight: 600;
				text-transform: uppercase;
			}

			&.hidden {
				display: none;
			}

			.boolean {
				padding: 10px 5px 10px 30px;
				position: relative;
				cursor: pointer;
				color: $primary;

				&::after {
					content: " ";
					position: absolute;
					top: 50%;
					left: 6%;
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
						width: 10px;
						position: absolute;
						top: 54%;
						left: 7%;
						border-left: 3px solid white;
						border-bottom: 3px solid white;
						transform: translateY(calc(-50% - 3px)) rotate(-45deg);
						z-index: 10;
					}
				}

			}
		}
	}
</style>
