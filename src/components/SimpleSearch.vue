<template lang='pug'>
.simple-search(v-if='state === "open"')
	.main-search
		.icon-search
		input(
			type='text'
			ref='search'
			v-model='query'
			:placeholder='options && options.placeholder ? options.placeholder : placeholder'
			@blur='wait( close )'
			@keydown='wait( search )'
			@keydown.enter='search'
		)
		.icon-close(
			@click='clear'
			:class='{ visible : query !== "" }'
		)
</template>

<script>
export default {
	name : 'simple-search',

	props : {
		state : {
			type    : String,
			default : () => 'open',
		},

		options : {
			type : [Object, Array],
		},

		placeholder : {
			type    : String,
			default : 'Search...',
		},

		timeout : {
			type    : Number,
			default : 500,
		}
	},

	data : () => ( {
		query : '',
		timer : null
	} ),

	watch : {
		state( state ) {
			if ( state === 'open' ) {
				this.$nextTick( () => this.$refs.search.focus() );
			}
		},

		query( query ) {
			if ( !query ) {
				this.$emit( 'search', '' );
			}
		}
	},

	methods : {

		close() {
			this.$emit( 'close' );
		},

		clearTimer() {
			if ( this.timer ) {
				window.clearTimeout( this.timer );
			}
		},

		clear() {
			this.clearTimer();
			this.query = '';

			this.$emit( 'search', '' );
			this.close();
		},

		wait( action ) {
			this.clearTimer();

			this.timer = window.setTimeout( () => {
				action();
			}, this.timeout );
		},

		search() {
			this.clearTimer();

			this.$emit( 'search', this.query );
		},

	}
};
</script>

<style lang='scss'>
@import '@/assets/variables.scss';

.simple-search {
	position: relative;
	transform: none;
	flex: 0 0 100%;
	top: 0;
	left: 0;

	.main-search {
		box-shadow: none;
		padding: 10px;
		border-radius: 15px;
		display: flex;
		align-items: center;
		box-shadow: $floatingObject;

		&:before {
			display: none;
		}

		.icon-search {
			margin: 0 10px;
			margin-right: 15px; // ? Account for the 10px in padding on the left due to the container
		}

		input {
			background: transparent;
			font-family: 'Poppins', sans-serif;
			// font-style: italic;
			font-weight: 300;
			font-size: 14px;
			flex: 1 0 auto;
		}

		.icon-close {
			transition: transform 0.2s ease, opacity 0.2s ease;
			opacity: 1;
			transform: scale(1,1);
		}

		.icon-close:not(.visible) {
			opacity: 0;
			transform: scale(0,0);
			pointer-events: none;
		}
	}
}
</style>
