<template lang="pug">
	#courses
		top-bar(
			:state='topbarState'
			:scroll-top='scrollTop'
			@update-topbar='updateTopbar'
		)
		catalog(
			@scroll-topbar='scrollTopbar'
			:view='view'
		)

		mobile-filters
</template>

<script>
import TopBar from '@/components/TopBar';
import Catalog from '@/components/Catalog';
import MobileFilters from '@/components/MobileFilters';

export default {
	name : 'courses',

	props : {
		view : {
			type : String,
		}
	},

	data : () => ( {
		topbarState : '',
		scrollTop   : 0,
	} ),

	methods : {

		scrollTopbar( e ) {
			const scrollTop = e.target.scrollTop;
			const deltaY    = ( this.scrollTop - scrollTop );

			this.scrollTop = scrollTop;

			if ( this.topbarState === 'search' ) {
				return;
			}

			if ( scrollTop < 165 ) {
				this.topbarState = '';

				return;
			}

			if ( deltaY < 0 ) {
				this.topbarState = 'collapsed';
			}

			else {
				this.topbarState = '';
			}

		},

		updateTopbar( state ) {
			this.topbarState = state;
		}

	},

	components : {
		TopBar,
		Catalog,
		MobileFilters
	},

};
</script>

<style lang="scss">
	#courses {
		height: 100vh;
    display: flex;
    flex-direction: column;
    background: white;
	}
</style>
