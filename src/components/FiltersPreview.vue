<template lang="pug">
	.filters-preview(v-if='filtersPreview.length && filteredCourses.length < maxVisible')
		.explanation
			p.small Not seeing what you expect?
			p.small Try clearing some of the filters you've applied.
		.filter-group
			.filter(
				v-for='filter in filtersPreview'
			)
				.text
					p(v-if='filter.type === "list" || filter.type === "multi-list"') {{ filter.key }}: {{ filter.value }}
					p(v-else-if='filter.type === "boolean" || filter.type === "arbitrary"') {{ filter.key }} only
				.icon-close(@click='clearFilter( filter )')
			.clear-all(v-if='filtersPreview.length > 1' @click='resetFilters') Clear All
</template>

<script>
export default {
	name : 'filters-preview',

	props : {
		maxVisible : {
			required : true,
		},
		filteredCourses : {
			required : true
		},
	},

	computed : {
		selectedFilters() {
			return this.$store.state.selectedFilters;
		},

		filters() {
			return this.$store.state.filters;
		},

		filtersPreview() {
			const { selectedFilters } = this;
			const filterKeys          = Object.keys( selectedFilters );

			if ( !this.filters.length ) {
				return {};
			}

			const filters = this.filters.reduce( ( obj, filter ) => {
				obj[filter.key] = filter; // eslint-disable-line

				return obj;
			}, {} );

			const appliedFilterKeys = filterKeys.filter( ( key ) => {
				const filter = filters[key];
				const { type } = filter;

				switch ( type ) {
					case 'list':
						if ( filter.options[0].value === selectedFilters[key] ) {
							return false;
						}
						break;

					case 'multi-list':
						if ( filter.options[0].value === selectedFilters[key] ) {
							return false;
						}
						break;

					case 'boolean':
						if ( !selectedFilters[key] ) {
							return false;
						}
						break;

					case 'arbitrary':
						if ( !selectedFilters[key] ) {
							return false;
						}
						break;

					default:
						break;
				}

				return true;
			} );

			return appliedFilterKeys.reduce( ( appliedFilters, key ) => {
				const filter         = filters[key];
				const { type, name } = filter;

				const value = ( () => {
					let v;
					let option;
					const selected = this.selectedFilters[key];

					switch ( type ) {
						case 'list':
							option = filter.options.find( a => a.value === selected );
							v = option.value;
							break;

						case 'multi-list':
							option = filter.options.find( a => a.value === selected );
							v = option.value;
							break;

						case 'boolean':
							v = true;
							break;

						case 'arbitrary':
							v = true;
							break;

						default:
							// should never reach this
							console.error( `UNEXPECTED TYPE: ${type} FOUND. EXPECTED 'boolean' OR 'dropdown'. UNABLE TO CREATE PREVIEW FOR THIS FILTER` );
							v = {};
							break;
					}

					return v;
				} )();

				return appliedFilters.concat( [{
					name,
					type,
					value,
					key
				}] );
			}, [] );
		}

	},

	methods : {
		clearFilter( filterToClear ) {
			const { type, key } = filterToClear;
			let payload;
			let filter;
			let defaultVal;

			switch ( type ) {

				case 'boolean':
					payload = {
						key,
						value : false,
					};

					this.$store.dispatch( 'selectFilter', payload );

					break;

				case 'arbitrary':
					payload = {
						key,
						value : false,
					};

					this.$store.dispatch( 'selectFilter', payload );

					break;


				case 'list':
					filter     = this.filters.find( a => a.key === key );
					defaultVal = filter.options[0].value;

					payload = {
						key,
						value : defaultVal
					};

					this.$store.dispatch( 'selectFilter', payload );

					break;

				case 'multi-list':
					filter     = this.filters.find( a => a.key === key );
					defaultVal = filter.options[0].value;

					payload = {
						key,
						value : defaultVal
					};

					this.$store.dispatch( 'selectFilter', payload );
					break;

				default:
					break;
			}
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
		}
	}

};
</script>


<style lang="scss">
@import '@/assets/variables.scss';

.filters-preview {
	position: relative;
	left: 50%;
	transform: translateX(-50%);
	margin: 30px 0;
	max-width: calc(100% - 30px);

	.explanation {

		p {
			font-size: 14px;
			text-align: center;
		}
	}

	.filter-group {
		background: white;
		border-radius: 10px;
		box-shadow: $floatingObject;
		margin-top: 15px;
		overflow: hidden;

		.filter,
		.clear-all {
			padding: 15px;
		}

		.filter {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.text {
				padding-right: 15px;
			}

			&:not(:nth-child(1)) {
				border-top: 1px solid $lightGrey;
			}
		}

		.clear-all {
			background: $cancel;
			color: white;
			font-weight: 600;
			cursor: pointer;
			text-align: center;
		}
	}
}

</style>
