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
import { ObjToArray, HasProperty } from '@/lib/utils';
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
		maxVisible : 50,
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
			const { filters, selectedFilters, savedCourseKeys, view } = this;

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

			return courses;

			// Filter by subjects
			courses.forEach( ( course, i ) => {

				let addCourse = true;

				if ( view === 'saved' && !HasProperty( savedCourseKeys, course.key ) ) {
					addCourse = false;

					return;
				}

				filters.forEach( ( filter ) => {
					const { name } = filter;

					// Use type from the courseModel instead of filter
					// because a filter type can be boolean but the courseModel
					// type is arbitrary. Arbitrary types with boolean filters
					// just check if the course has a value for that property
					const { type } = this.model[name];

					const filterCondition = selectedFilters[name];

					if ( filterCondition === 'All' || filterCondition === false ) {
						// the default value of the filter is set
						return;
					}

					switch ( type ) {

						case 'multi-list-item':

							if ( !course[name] ) {
								addCourse = false;
							}
							else {
								if ( !course[name][filterCondition] ) {
									addCourse = false;
								}
							}

							break;

						case 'arbitrary':
							if ( !course[name] ) {
								addCourse = false;
							}
							break;

						default:
							if ( course[name] !== filterCondition ) {
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
					return;
				}
			}

		}
	},

	methods : {
		viewCourse( key  ) {
			this.$router.push( {
					path : this.$route.path,
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
	},

	components : {
		Card,
		FiltersPreview,
	}

}

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

