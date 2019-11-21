<template lang="pug">
	#catalog(@scroll.passive='scrollTopbar( $event )')
		//- loading state
		.loading-circles(v-show='state === "loading"')
			span
			span
			span

		.card-container.noselect(v-show='state === "loaded"')
			p.spacey(v-if='!displayedCourses.length') {{ view === "saved" ? "No saved courses" : "Nothing to show" }}
			card(
				v-for='course in displayedCourses'
				:key='course.key'
				:card='course'
				:model='model'
				:saved='savedCourseKeys.hasOwnProperty( course.key )'
				@view='viewCourse( course.key )'
				@save='saveCourse'
			)
			.view-more(@click='maxVisible += 10' v-show='filteredCourses.length > maxVisible') View More
			p.no-more.spacey(v-show='filteredCourses.length < maxVisible && displayedCourses.length !== 0') No more {{ view === "saved" ? "saved" : "" }} courses
			filters-preview(
				:max-visible='maxVisible'
				:filteredCourses='filteredCourses'
			)

</template>

<script>
import { HasProperty } from '@/lib/utils';
import FiltersPreview from '@/components/FiltersPreview';
import Card from '@/components/Card';

export default {
	name : 'catalog',

	props : {
		view : {
			type : String
		}
	},

	data : () => ( {
		maxVisible       : 50,
		isFiltersFromUrl : false
	} ),

	computed : {
		user() {
			return this.$store.state.user;
		},

		state() {
			return this.$store.state.courseState;
		},

		courses() {
			return this.$store.state.courses;
		},

		model() {
			return this.$store.state.model;
		},

		searchResults() {
			return this.$store.state.searchResults;
		},

		savedCourseKeys() {
			return this.$store.state.savedCourseKeys;
		},

		subjectMap() {
			return this.$store.state.subjectMap;
		},

		selectedFilters() {
			return this.$store.state.selectedFilters;
		},

		filters() {
			return this.$store.state.filters;
		},

		filteredCourses() {
			const filteredCourses = [];
			const {
				filters,
				selectedFilters,
				savedCourseKeys,
				view
			} = this;

			if ( !filters.length || !Object.keys( this.model ).length ) {
				return [];
			}

			// Use all courses or courses from the search results
			const courses = ( () => {
				if ( this.searchResults !== null && this.state === 'loaded' ) {
					return this.searchResults;
				}

				return this.courses;

			} )();

			// Filter by subjects
			courses.forEach( ( course ) => {
				let addCourse = true;

				if ( view === 'saved' && !HasProperty( savedCourseKeys, course.key ) ) {
					addCourse = false;

					return;
				}

				filters.forEach( ( filter ) => {
					const { key, type } = filter;

					const filterCondition = selectedFilters[key];
					if ( filterCondition === 'All' || filterCondition === false ) {
						// the default value of the filter is set
						return;
					}

					switch ( type ) {
						case 'label-list':
							if ( !course[key] ) {
								addCourse = false;
							}
							else if ( !course[key].find( a => a.value === filterCondition ) ) {
								addCourse = false;
							}

							break;

						case 'arbitrary':
							if ( !course[key] ) {
								addCourse = false;
							}
							break;

						default:
							// console.log( course[key], filterCondition );
							if ( course[key] !== filterCondition ) {
								addCourse = false;
							}
							break;
					}

				} );

				if ( addCourse ) {
					filteredCourses.push( course );
				}

			} );

			return filteredCourses;
		},

		displayedCourses() {
			return this.filteredCourses.slice( 0, this.maxVisible );
		},

	},

	watch : {
		'$route.query.key' : {
			handler( key ) {

				if ( !key ) {
					this.$store.dispatch( 'closeCourseInfo' );
					return;
				}

				this.$store.dispatch( 'openCourseInfo', key );
			}
		},

		state( state ) {
			const { key } = this.$route.query;

			// To open courseInfo on load
			if ( state === 'loaded' ) {
				if ( key ) {
					this.$store.dispatch( 'openCourseInfo', key );
				}
			}
		},

		'selectedFilters' : {
			deep      : true,
			immediate : true,
			handler( selectedFilters ) {

				if ( !Object.keys( selectedFilters ).length ) {
					return;
				}

				if ( !this.isFiltersFromUrl ) {
					this.loadFiltersFromUrl();
					this.isFiltersFromUrl = true;
				}

				this.setFiltersToUrl();
			}
		}
	},

	methods : {
		viewCourse( key ) {
			this.$router.push( {
				path  : this.$route.path,
				query : { key }
			} );
		},

		saveCourse( course ) {
			const { key } = course;

			this.$store.dispatch( 'saveCourse', key );
		},

		scrollTopbar( e ) {
			this.$emit( 'scroll-topbar', e );
		},

		loadFiltersFromUrl() {
			const { selectedFilters } = this;

			Object.keys( selectedFilters ).forEach( ( key ) => {
				const v = this.$route.query[key];

				if ( !v ) {
					return;
				}

				const isBoolean = v === 'true' || v === 'false';
				const value = isBoolean ? v === 'true' : v;

				const payload = {
					key,
					value,
				};

				this.$store.dispatch( 'selectFilter', payload );
			} );
		},

		setFiltersToUrl() {
			const { selectedFilters, filters } = this;

			const query = filters.reduce( ( obj, filter ) => {
				const { key, type } = filter;

				const defaultValue = ( () => {
					if ( type === 'boolean' || type === 'arbitrary' ) {
						return false;
					}

					return filter.options[0].value;
				} )();

				if ( selectedFilters[key] === defaultValue ) {
					return obj;
				}

				obj[key] = selectedFilters[key]; // eslint-disable-line
				return obj;


			}, {} );

			this.$router.push( {
				path : this.$route.path,
				query,
			} );
		}
	},

	components : {
		Card,
		FiltersPreview,
	}
};

</script>

<style lang="scss">
@import '@/assets/variables.scss';

#catalog {
	display: flex;
	flex-direction: column;
	overflow: auto;
	padding-top: 156px;
	transition: padding-top 0.5s ease;

	p.spacey {
		margin-top: 30px;
		text-align: center;
		font-size: 16px;
		width: 100%;

		&.no-more {
			margin-top: 0;
			padding: 30px 0;
		}
	}

	.loading-circles {
		height: 50px;
		overflow: hidden;
	}

	.card-container {
		display: flex;
		flex-wrap: wrap;
		margin: 10px;
		flex-shrink: 0;
		padding-bottom: 100px;

		.card {
			cursor: pointer;
			transform: scale(1,1);
			transition: transform 0.2s ease;

			&.active {
				transform: scale(0.95,0.95);
			}
		}
	}

	.view-more {
		width: 100%;
		margin: 15px;
		padding: 15px;
		border-radius: 50px;
		border: 2px solid $primary;
		font-size: 16px;
		color: $primary;
		cursor: pointer;
		text-align: center;
		margin-bottom: 50px;
	}

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
}

/* Small Devices, Tablets */
@media only screen and (min-width : 1px) and (max-width : 575px) {

	#catalog {
		padding-top: 245px;
	}

}
</style>
