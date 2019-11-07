<template lang="pug">
	.search-bar(
		:class='[ state, { empty : input === "" } ]'
		ref='searchBar'
	)
		label.icon.icon-search(:for='id')
		input(
			@focus='state = "focus"'
			@blur='state = "blur"'
			:id='id'
			v-model='input'
		)
</template>

<script>
import { FirebaseKey } from '@/lib/db';

export default {
	name : 'search-bar',

	props : {
		startingValue : {
			required : true
		},
	},

	data : () => ( {
		state : 'blurred',
		id    : FirebaseKey(),

		timer : null,
		input : '',
	} ),

	watch : {

		state( state ) {
			this.$emit( state );
		},

		input( text ) {

			this.$emit( 'input', text );

			if ( this.timer ) {
				window.clearTimeout( this.timer );
			}

			this.timer = window.setTimeout( () => {
				this.$emit( 'search', text );
			}, 200 );

		}
	}
};
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.search-bar {
	display: flex;
	align-items: center;
	border-radius: 30px;
	transition: min-width 0.5s ease;
	position: relative;
	width: auto;
	overflow: visible;

	&::before,
	&::after {
		position: absolute;
		left: 41px;
		font-size: 16px;
		font-family: "Work Sans", opensans;
		top: 50%;
		transform: translateY(-50%);
		opacity: 1;
		font-weight: 600;
		font-size: 16px;
		letter-spacing: 2px;
		color: $grey;
		pointer-events: none;
		white-space: nowrap;
	}

	&::before {
		content: "Search";
	}

	&::after {
		content: "Type Something";
		opacity: 0 !important;
		transition-delay: 0s;
	}

	&.blur {
		opacity: 1;
	}

	&.focus {

		&::before {
			opacity: 0 !important;
		}

		&::after {
			opacity: 1 !important;
		}

		input {
			opacity: 1;
		}

		&:not(.empty) {

			&::after {
				opacity: 0 !important;
			}
		}
	}

	&:not(.empty).blur {
		max-width: 100vw;

		&::before {
			opacity: 0;
		}

		input {
			opacity: 1;
			cursor: text;
		}
	}

	.icon-search {
		color: $grey !important;
		font-size: 16px !important;
	}

	input {
		background: transparent;
		border: none;
		outline: none;
		font-size: 18px;
		flex: 0 0 calc(100vw - 60px);
		opacity: 0;padding: 0 !important;
		cursor: pointer;
	}
}

@media only screen and (min-width : 1px) and (max-width : 575px) {
	.search-bar {
		will-change: max-width, transform, left;
		transition: max-width 0.5s ease, transform 0.5s ease, left 0.5s ease;
		border: none;
		background: white;
		transform: translate3d(0,0,0);
		left: 0;
		max-width: 160px;

		&::before,
		&::after {
			left: 56px;
			text-transform: uppercase;
		}

		.icon-search {
			font-size: 24px;
			margin-left: 0 !important;
		}
	}
}


</style>
