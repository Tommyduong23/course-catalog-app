<template lang="pug">
.dropdown.box(
	:class='{ open, optional : options.optional, "has-value" : localValue !== "" }' ref='dropdown'
	:tabindex='lastTabIndex'
	@mouseover='clearCloseTimeout'
	@mouseleave='setCloseTimeout'
	@keydown.enter='toggleDropdown'
)
	.select-display.failed(v-if='optionsState === "failed"')
		p.reload.spacey.error(@click='setOptions') Reload Options
			span.load-icon
				svg(
					xmlns='http://www.w3.org/2000/svg'
					version='1.1'
					width='512'
					height='512'
					viewBox='0 0 512 512'
				)
					title
					g#icomoon-ignore
					path(
						d='M444.84 83.16c-46.804-51.108-114.077-83.16-188.84-83.16-141.385 0-256 114.615-256 256h48c0-114.875 93.125-208 208-208 61.51 0 116.771 26.709 154.848 69.153l-74.848 74.847h176v-176l-67.16 67.16z'
					)
					path(
						d='M464 256c0 114.875-93.125 208-208 208-61.51 0-116.771-26.709-154.847-69.153l74.847-74.847h-176v176l67.16-67.16c46.804 51.108 114.077 83.16 188.84 83.16 141.385 0 256-114.615 256-256h-48z'
					)

	.select-display(v-else @click='toggleDropdown' :class='{ "has-min-label" : options.minimalLabel && ( localValue !== "" || searchQuery !== "" || hasErrors ) }')
		.icon-search(v-if='options.multiselect && options.searchable')
		.bubble(v-if='selectedOption && selectedOption.color' :style='{ backgroundColor : selectedOption.color }')
		p.minimal-label.highlight-text(v-if='options.minimalLabel') {{ options.minimalLabel }}
			span(
				v-if='options.multiselect && options.searchable && open'
				v-for='text in displayText'
			)  {{ text }}
			span.red.text-error(v-if='hasErrors') - {{ displayError }}
		input.main-display(
			v-model='searchQuery'
			:placeholder='options.searchPlaceholder'
			v-if='showSearch'
			ref='search'
		)
		p.main-display(v-else)
			span(v-for='text in displayText')  {{ text }}

	.options-container(
		ref='optionsWrapper'
		@mouseover='clearCloseTimeout'
		@mouseleave='setCloseTimeout'
	)
		.options-wrapper(v-show='open')
			p.spacey(v-if='!displayedOptions.length') No options to display
			.option(
				v-for='(option, index) in displayedOptions'
				tabindex='0'
				@click='select( option )'
				@keydown.enter.stop.prevent='select( option )'
				@keydown.escape='open = false'
				@blur='setCloseTimeout'
				@focus='clearCloseTimeout'
			)
				.bubble(v-if='option.color && !options.multiselect' :style='{ backgroundColor : option.color }')
				.checkbox(
					v-if='options.multiselect'
					:style='option.color ? { "border-color" : option.color } : {}'
					:class='{ checked : isSelected( option ) }'
				)
				p {{ option.text }}
			.option.clear(
				v-if='showClearSelection'
				@click='clearSelection()'
			)
				p Clear Selection
				.icon-close
</template>

<script>
import SimpleSearch from '@/components/SimpleSearch';
import { HasProperty, clone } from '@/lib/utils';
import Vue from 'vue';

export default {
	name : 'custom-dropdown',

	props : {

		default : String,

		options : {
			type : [Object, Array],
		},

		field : {
			type : Object
		},

		errors : {
			type : [Object, String, Boolean],
		},

		lastTabIndex : {
			type : Number,
		},

		value : {
			type : [String, Number, Object, Array],
		},

	},

	data : () => ( {
		localValue : '',
		open       : false,

		selected : {}, // + Used only when multiselect option is applied

		searchQuery            : '',
		multiSelectSearchState : 'closed',

		selectOptions : [],
		optionsState  : null,

		closeTimeout : null,
		displayError : null,
	} ),

	computed : {

		displaySelected() {
			const { selected, selectOptions, options } = this;

			if ( !selected || !Object.keys( selected ).length || !selectOptions || !selectOptions.length ) {
				return [];
			}

			const keys = Object.keys( selected ).filter( a => selected[a] );

			const keyProp = options.keyProp || 'value';

			return keys.map( ( key ) => {
				const foundSelection  = selectOptions.find( a => a[keyProp] == key );

				return foundSelection;
			} ).filter( a => a !== undefined );
		},

		displayText() {
			const { selectOptions : options } = this;

			if ( this.optionsState === 'failed' ) {
				return null;
			}

			if ( !options.length || this.optionsState === 'loading' ) {
				return [this.options.loadingText || 'Loading...'];
			}

			const placeholder = ( () => {
				const { options : o } = this;

				if ( o.defaultText ) {
					return o.defaultText;
				}

				if ( o.minimalLabel ) {
					return o.minimalLabel;
				}
			} )();

			if ( !this.options.multiselect ) {
				// use soft equals here
				const selected = options.find( a => a.value == this.localValue ) || {};

				return [selected.text || placeholder];
			}

			const keys     = Object.keys( this.selected );
			const selected = keys.filter( a => this.selected[a] );

			const { selectedText } = this.options;

			const maxDisplayed = 2;

			if ( selectedText ) {
				return selectedText( selected );
			}

			const selectionLength = this.displaySelected.length;

			if ( selectionLength ) {

				if ( this.options.multiselectLabel === 'simple' ) {
					return [`${selectionLength} selected`];
				}

				return this.displaySelected.reduce( ( acc, value, index ) => {

					// if this is the first one and there's no other items
					// don't add a comma
					if ( index === 0 && selectionLength === 1 ) {
						acc.push( `${value.text}` );
						return acc;
					}

					if ( index < maxDisplayed ) {

						// here we're checking to see if this is the last item in our array and
						// if it's the item that would be right before the "and __ more" item.
						// the reason why we're checking is so we can know if we should or
						// shouldn't add the comma at the end of the item.
						if ( ( index === maxDisplayed - 1 ) && ( index === selectionLength - 1 ) ) {
							acc.push( `${value.text}` );
							return acc;
						}

						acc.push( `${value.text},` );
						return acc;
					}

					// if it's the last one we are able to display (due to maxDisplayed)
					// return how many are left that were selected
					if ( index === maxDisplayed ) {
						acc.push( `and ${selectionLength - maxDisplayed} more` );
						return acc;
					}

					return acc;

				}, [] );

			}

			return ['None selected'];
		},

		hasErrors() {
			return ( typeof this.displayError === 'string' && !!this.displayError );
		},

		selectedOption() {

			if ( Array.isArray( this.selectOptions ) ) {
				return this.selectOptions.find( a => a.value === this.localValue );
			}

			return {
				text  : '',
				value : null,
			};
		},

		searchPerfectMatch() {
			if ( this.localValue === '' || this.localValue === null ) {
				return true; // ! this is temporary
			}

			if ( this.options.multiselect ) {
				return false;
			}

			const { selectedOption : selected } = this;

			return this.searchQuery === selected.text;
		},

		displayedOptions() {
			if ( this.options.searchable && this.searchQuery && !this.searchPerfectMatch ) {
				return this.selectOptions.filter( a => a.text.toLowerCase().indexOf( this.searchQuery.toLowerCase() ) !== -1 );
			}

			return this.selectOptions;
		},

		showClearSelection() {
			if ( this.options.multiselect ) {
				const keys = Object.keys( this.localValue );

				return keys.find( a => this.localValue[a] ) !== undefined;
			}

			return this.localValue !== '';
		},

		showSearch() {
			if ( !this.options.multiselect ) {
				return this.options.searchable;
			}

			return ( this.options.searchable && this.multiSelectSearchState === 'open' );
		}

	},

	created() {
		if ( this.options.multiselect ) {
			if ( !Array.isArray( this.value ) ) {
				this.selected = clone( this.value );
			}

			else {
				this.selected = this.value.reduce( ( obj, item ) => {
					const added = {};
					added[item[this.options.keyProp]] = true;

					return {
						...obj,
						...added,
					};
				}, {} );
			}
		}

		else {
			this.localValue = this.value;
		}

		// we must either display or
		// retrieve these options
		const { options } = this.options;

		// this is a list. Nothing needs
		// to be done.
		if ( typeof options === 'object' || Array.isArray( options ) ) {
			this.selectOptions = options;
			this.setDefaultValue();

			return;
		}

		// this is a function to either
		// generate programatically (e.g. 1-10)
		// or load from an external source.
		if ( typeof options === 'function' ) {
			this.setOptions();
		}
	},

	watch : {

		open( open ) {

			this.$nextTick( () => {

				if ( !open && this.$refs.optionsWrapper !== undefined ) {
					this.$refs.optionsWrapper.scrollTop = 0;
				}

			} );

			if ( open && ( this.options.multiselect && this.options.searchable ) ) {
				this.multiSelectSearchState = 'open';

				this.$nextTick( () => {
					this.$refs.search.focus();
				} );
			}

			else {
				this.multiSelectSearchState = 'closed';
			}

		},

		'value' : {
			immediate : true,
			handler( value ) {
				this.displayError = null;

				if ( value !== this.localValue ) {
					this.localValue = value;
				}
			}
		},

		localValue( value ) {
			if ( value !== this.value ) {
				this.$emit( 'input', value );
			}
		},

		searchQuery() {
			// I added this so i could get the option.text
			// of the selected option if there is a better way lmk
			// I used this in the NewFiltersModal in the CustomDropdown - Tommy
			this.$emit( 'text', this.searchQuery );

			if ( !this.options.searchable || this.options.multiselect ) {
				return;
			}


			if ( !this.searchPerfectMatch ) {
				this.open = true;
				this.localValue = '';
			}
		},

		errors( errors ) {
			if ( errors === false ) {
				this.displayError = 'Required';

				return;
			}

			this.displayError = errors;
		},

		'selectedOption.text' : function ( text ) {
			if ( text == '' ) {
				return;
			}

			if ( text !== this.searchQuery && this.options.searchable ) {
				this.searchQuery = text;
			}
		},

		'selected' : {
			deep : true,
			handler() {
				this.setLocalValue();
			}
		},

		selectOptions() {
			this.setLocalValue();
		}

	},

	methods : {

		setOptions() {

			// display a loading text in the dropdown
			const loadingOption = {
				text  : 'Loading Options...',
				value : null,
			};

			this.optionsState  = 'loading';
			this.selectOptions = [];

			const { options } = this.options;

			// if a value is immediately
			// generated, this promise will immediately
			// resolve, otherwise it will resolve
			// when the promise fulfills
			Promise
				.resolve()
				.then( () => options() )
				.then( ( value ) => {
					this.optionsState  = 'success';
					this.selectOptions = value;

					this.setDefaultValue();
				} )
				.catch( () => {

					// because this happens so quickly we want to let
					// the user know that we tried again upon their
					// request. We're going to do this by adding a
					// little magic and timing it out for visual effect
					setTimeout( () => {
						this.optionsState  = 'failed';
						this.open          = false;
						this.selectOptions = [];
					}, 1000 );

				} );

		},

		select( option ) {
			if ( this.options.multiselect ) {
				const value = ( () => {
					if ( option.value ) {
						return option.value;
					}

					const { keyProp } = this.options;

					return option[keyProp];
				} )();

				Vue.set( this.selected, value, !this.selected[value] );

				return;
			}

			else {
				this.localValue  = option.value;
				this.searchQuery = option.text;
			}

			this.open = false;

			if ( this.$refs.search ) {
				this.$refs.search.blur();
			}
		},

		isSelected( option ) {
			const value = ( () => {
				if ( option.value ) {
					return option.value;
				}

				return option[this.options.keyProp];
			} )();

			return this.selected[value];
		},

		toggleDropdown() {
			if ( this.searchQuery && !this.searchPerfectMatch ) {
				return;
			}

			this.open = !this.open;
		},

		setDefaultValue() {
			const { defaultValue } = this.options;

			if ( !HasProperty( this.options, 'defaultValue' ) ) {
				return;
			}

			if ( typeof defaultValue === 'function' ) {
				// start with promise.resolve because it will
				// support synchronous functions just fine but will
				// also support asynchronous functions
				Promise.resolve()
					.then( () => defaultValue() )
					.then( ( val ) => {

						// if the value we get is an object, set the value
						// and add the object to the beginning of the array
						if ( typeof val === 'object' ) {
							this.localValue = val.value;
							this.selectOptions.unshift( val );

							return;
						}

						// otherwise just set the value
						this.localValue = val;
					} )
					.then( () => {
						// check if the default value exists in the options.
						// if it doesn't, then we're just going to end up with
						// an empty dropdown looking at us which sucks.
						const { localValue : val } = this;

						// find the selected option
						const selectedOption = this.selectOptions.find( a => a.value === val );
						if ( selectedOption === undefined ) {
							// if it doesn't exist, then just set the localValue to an
							// empty string
							this.localValue = '';
						}
					} );

				return;
			}

			this.localValue = defaultValue;
		},

		setCloseTimeout() {
			const isSearchableMultiselect = ( this.options.multiselect && this.options.searchable );

			if ( this.searchQuery && !this.searchPerfectMatch && !isSearchableMultiselect ) {
				// don't autoclose a searched dropdown
				return;
			}

			this.closeTimeout = window.setTimeout( () => {
				this.open = false;

				if ( isSearchableMultiselect ) {
					this.searchQuery = '';
				}
			}, 200 );
		},

		clearCloseTimeout() {
			if ( this.closeTimeout ) {
				window.clearTimeout( this.closeTimeout );
			}
		},

		clearSelection() {
			if ( !this.options.multiselect ) {
				this.select( { value : "", text : "" } )

				return;
			}

			const keys = Object.keys( this.selected );
			keys.forEach( ( key ) => {
				this.selected[key] = false;
			} );
		},

		setLocalValue() {
			const { selected, selectOptions, options } = this;

			if ( !selected || !Object.keys( selected ).length || !selectOptions || !selectOptions.length ) {
				return;
			}

			if ( !options.keyProp ) {
				this.localValue = selected;
				return;
			}

			const keys      = Object.keys( selected ).filter( a => selected[a] );
			this.localValue = keys.map( ( key ) => {
				const { keyProp }     = options;
				const obj             = {};

				obj[keyProp] = key;


				return obj;
			} );
		}

	},

	components : {
		SimpleSearch,
	}
};
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.dropdown {
	width: 200px;
	position: relative;
	cursor: pointer;

	&::before {
		top: 50% !important;
		transform: translateY( -50% );
	}

	&:not(.open) {
		border-bottom-left-radius: 15px;
		border-bottom-right-radius: 15px;

		.options-container {
			max-height: 0;
			overflow: hidden;
			padding: 0;
			border-color: transparent;
			background-color: transparent;
			z-index: -1;

			.options-wrapper {

				&::before {
					height: 0;
					width: 0;
				}

				.option {
					opacity: 0;
				}
			}
		}

		.select-display {

			&::before {
				transform: translate(0px, -50%) rotate(-45deg);
			}

			&::after {
				transform: translate(5px, -50%) rotate(45deg);
			}
		}
	}

	&.open {
		border-bottom-left-radius: 0px!important;
		border-bottom-right-radius: 0px!important;
		box-shadow: none!important;
		z-index: 10;

		.select-display {
			border-bottom-left-radius: 0;
			border-bottom-right-radius: 0;
		}

		.options-container {

			.options-wrapper {

				.option {
					opacity: 1;
					transform: translate3d(0,0,0);
				}
			}
		}
	}

	&.optional:not(.has-value):not(.open) {
		box-shadow: none;
		border: 2px dashed $secondary;

		.select-display {
			padding: 13px;
		}
	}

	.select-display {
		padding: 15px;
		width: 100%;
		position: relative;
    z-index: 2;
    background: white;
		border-radius: 15px;
		position: relative;
		overflow: hidden;
		height: 100%;
		display: flex;
		align-items: center;

		.icon-search {
			margin-right: 15px;
			color: $secondary;

			~ p.minimal-label {
				left: 48px;
			}
		}

		&.failed {

			&::before, &::after {
				display: none;
			}

			p {

				&.error {
					color: $cancel;
					position: relative;
					width: 100%;

					.load-icon {
						font-weight: 600;
						position: absolute;
						right: 5px;
						top: 50%;
						transform: translateY(-50%);
						color: inherit;

						svg {
							height: 16px;
							width: 16px;
							fill: $cancel;
						}
					}
				}
			}
		}

		.bubble {
			position: absolute;
			top: 50%;
			left: 0;
			height: 20px;
			width: 15px;
			border-radius: 6px;
			transform: translate(-50%,-50%);
		}

		input {
			width: 100%;
			color: $primary;
		}

		&.has-min-label {

			p.minimal-label {
				opacity: 1;
				transform: translate3d(0,-7px,0);
			}

			.main-display {
				transform: translate3d(0,7px,0);
			}
		}

		&::before, &::after {
			content: ' ';
			height: 9px;
			width: 2px;
			background: $primary;
			border-radius: 12px;
			right: 30px;
			position: absolute;
			transition: .2s ease-in-out;
			top: 50%;
			transform: translate3d( 0, -50%, 0 );
			z-index: 2;
		}

		&::before {
			transform: translate3d(0px, -50%, 0) rotate(45deg);
		}

		&::after {
			transform: translate3d(5px, -50%, 0) rotate(-45deg);
		}

		.main-display {
			transition: transform 0.2s ease;

			p:first-of-type {
				position: relative;
				top: 5px;
				padding-bottom: 10px; // this is to offset the top positioning
			}

			p {
				padding-bottom: 5px;
			}
		}

		p {
			color: $primary;
			font-weight: 500;
			overflow: hidden;
			margin: 0;
			font-size: 16px;

			&.minimal-label {
				color: $primary;
				font-size: 12px;
				opacity: 0;
				transform: translate3d(0,0,0);
				position: absolute;
				left: 15px;
				top: 15px;
				transition: opacity 0.2s ease, transform 0.2s ease;
			}
		}
	}

	.options-container {
		padding-top: 58px;
		position: absolute;
		top: 0;
		background: white;
		border-radius: 15px;
		z-index: 1;
		width: 100%;
		box-shadow: $floatingObject;
		overflow: hidden;

		&::before {
			content: '';
			position: absolute;
			top: 55px;
			left: 0;
			width: 100%;
			z-index: -1;
			height: 50px;
			background: $gradientOne;
		}

		.options-wrapper {
			overflow: auto;
			padding: 12px 0;
			max-height: 200px;
			position: relative;

			&::-webkit-scrollbar {
				width: 0;
			}

			p.spacey {
				text-align: center;
			}

			.option {
				padding: 3px 15px;
				width: 100%;
				opacity: 0.75;
				transform: translate3d(-10px, 0, 0);
				opacity: 0;
				transition: transform 0.15s ease, opacity 0.15s ease;
				display: flex;
				align-items: center;

				&.clear {
					opacity: 0.5;
					display: flex;
					align-items: center;
					justify-content: space-between;

					.icon-close {
						height: 10px;
						width: 10px;
						margin-right: 5px;

						&::before,
						&::after {
							height: 10px;
							width: 2px;
						}
					}

					p {
						color: $cancel;
						font-size: 12px;
					}
				}

				&:nth-child(2) {
					transition-delay: 0.03s;
				}

				&:nth-child(3) {
					transition-delay: 0.06s;
				}

				&:nth-child(4) {
					transition-delay: 0.1s;
				}

				&:nth-child(5) {
					transition-delay: 0.15s;
				}

				&:nth-child(6) {
					transition-delay: 0.21s;
				}

				&:nth-child(7) {
					transition-delay: 0.28s;
				}

				&:hover {
					opacity: 1;
				}

				.checkbox {
					height: 18px;
					width: 18px;
					min-width: 18px;
					border-radius: 3px;
					margin-right: 10px;
					border: 2px solid $lightGrey;
					position: relative;

					&.checked {
						border-color: $primary;
						background: lighten($primary, 30);

						&::after {
							content: ' ';
							height: 4px;
							width: 8px;
							border: 3px solid $primary;
							border-top: 0;
							border-right: 0;
							position: absolute;
							top: 35%;
							left: 50%;
							transform: translate(-50%,-50%) rotate(-45deg);
						}

						+ p {
							color: $primary;
						}
					}
				}

				.bubble {
					position: relative;
					height: 10px;
					width: 10px;
					border-radius: 3px;
					margin-right: 5px;
					flex-shrink: 0;
				}

				p {
					text-align: left;
					margin: 0 ;
					font-weight: 500;
					font-size: 14px;
					color: $primary;
				}
			}
		}
	}
}
</style>
