<template lang="pug">
	.filters-wrapper
		.filters.noselect(ref='filters')
			.filter(v-for='filter in filters' :class='filter.class')
				.dropdown-menu(
					v-if='filter.type == "list-item" || filter.type == "multi-list-item"'
					:class='{ opened : openedFilters[filter.name], hidden : filter.name === primaryKey}'
					@click='setOpened( filter.name, !openedFilters[filter.name] )'
					@mouseleave='setOpened( filter.name, false )'
				)
					p {{ filter.name }}
					.arrow
					.options(
						:ref='filter.name'
						:class='optionsClasses[filter.name]'
					)
						.option(
							:class='{ active : selectedFilters[filter.name] == "All" }'
							@click.stop='toggleOption( filter, filter.default )'
						)
							p {{ filter.default.name }}
						.option(
							v-for='option in filter.options'
							:class='{ active : selectedFilters[filter.name] == option.value }'
							@click.stop='toggleOption( filter, option )'
						)
							p {{ option.name }}
				.boolean(v-if='filter.type == "boolean"' :class='{ active : selectedFilters[filter.name] }' @click='toggleBoolean( filter )')
					p {{ filter.name }}
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
			return this.$store.state.primaryKey;
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

				const listFilters = filters.filter( a => a.type === 'list-item' || a.type === 'multi-list-item' )

				listFilters.forEach( ( filter ) => {
					const { name } = filter;

					const elBounds = this.$refs[name][0].getBoundingClientRect();

					const { width } = elBounds;
					const { left }  = elBounds;

					if ( left - width / 2 < leftBound ) {
						this.optionsClasses[name] = 'left';
					}

				} );

			} );

		},
	},

	methods : {

		position( filter ) {
			const { name } = filter;
			const ref = this.$refs[name];

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
			const { name } = filter;

			const payload = {
				name,
				value,
			};

			this.$store.dispatch( 'selectFilter', payload );
		},

		toggleBoolean( filter ) {
			const { name } = filter;

			const payload = {
				name,
				value : !this.selectedFilters[name]
			}

			this.$store.dispatch( 'selectFilter', payload );
		},

		setOpened( name, value ) {
			const payload = {
				name,
				value
			}
			this.$store.dispatch( 'updateOpened', payload )
		}
	},

}
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
			max-width: 100%;
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
