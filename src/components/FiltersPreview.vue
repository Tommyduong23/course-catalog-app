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
					p(v-if='filter.type === "list-item" || filter.type === "multi-list-item"') {{ filter.name }}: {{ filter.value }}
					p(v-else-if='filter.type === "boolean"') {{ filter.name }} only
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
				return {}
			}

			const filters = this.filters.reduce( ( obj, filter ) => {
				obj[filter.name] = filter; // eslint-disable-line

				return obj;
			}, {} );

			const appliedFilterKeys = filterKeys.filter( ( key ) => {
				const filter = filters[key];
				const { type } = filter;

				switch( type ) {

					case 'list-item':
						if ( filter.default.value === selectedFilters[key] ) {
							return false;
						}
						break;

					case 'multi-list-item':
						if ( filter.default.value === selectedFilters[key] ) {
							return false;
						}
						break;

					case 'boolean':
						if ( !selectedFilters[key] ) {
							return false;
						}
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

					switch( type ) {
						case 'list-item':
							option = filter.options.find( a => a.value === selected );
							v = option.name;
							break;

						case 'multi-list-item':
							option = filter.options.find( a => a.value === selected );
							v = option.name;
							break;

						case 'boolean':
							v = true;
							break;

						default:
							// should never reach this
							console.error( `UNEXPECTED TYPE: ${type} FOUND. EXPECTED 'boolean' OR 'dropdown'. UNABLE TO CREATE PREVIEW FOR THIS FILTER` );
							v = {};
							break;
					};

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
			const { type, name } = filterToClear;
			let payload;
			let filter;
			let defaultVal;

			switch ( type ) {

				case 'boolean' :
				 	payload = {
						name,
						value : false,
					};

					this.$store.dispatch( 'selectFilter', payload );

					break;

				case 'list-item' :
					filter     = this.filters.find( a => a.name === name );
					defaultVal = filter.default.value;

					payload = {
						name,
						value : defaultVal
					};

					this.$store.dispatch( 'selectFilter', payload );

					break;

				case 'multi-list-item':
					filter     = this.filters.find( a => a.name === name );
					defaultVal = filter.default.value;

					payload = {
						name,
						value : defaultVal
					};

					this.$store.dispatch( 'selectFilter', payload );
					break;

				default :
					break;
			}
		},

		resetFilters() {
			// reset each filter
			this.filters.forEach( ( filter ) => {
				const { name, type } = filter;

				switch ( type ) {

					case 'boolean' : {
						const payload = {
							name,
							value : false,
						};

						this.$store.dispatch( 'selectFilter', payload );

						break;
					}

					case 'list-item' : {
						const filter     = this.filters.find( a => a.name === name );
						const defaultVal = filter.default.value;

						const payload = {
							name,
							value : defaultVal
						};

						this.$store.dispatch( 'selectFilter', payload );

						break;
					}

					case 'multi-list-item' : {
						const filter     = this.filters.find( a => a.name === name );
						const defaultVal = filter.default.value;

						const payload = {
							name,
							value : defaultVal
						};

						this.$store.dispatch( 'selectFilter', payload );

						break;
					}


					default : {

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
