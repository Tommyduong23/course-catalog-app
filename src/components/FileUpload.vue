<template lang="pug">
	.file-upload(:class='[state, { "has-file" : file }]')
		.drop-zone(
			@dragenter='handleDragEvent( $event, "enter" )'
			@dragleave='handleDragEvent( $event, "leave" )'
			@drop='getDropFile( $event )'
			:class='{ dragover }'
			ref='dropzone'
		)
			.no-file
				p Drop Here
				p - or -
			.error-message
				p {{ error }}
			.file(v-if='file')
				p {{ file.name }}
			label.upload-button(:for='id') Choose a file
			input(:id='id' type='file' @change='getInputFile( $event )' ref='fileInput')
		.button(v-show='file' @click='upload( file )') Upload
</template>

<script>
export default {
	name : 'file-upload',

	props : {
		allowedExt : {
			type : Array
		},
		// whether to emit on drop or on upload clicked
		emitImmediately : {
			type    : Boolean,
			default : false,
		},

		reset : {
			type : Boolean,
		},

		id : {
			type    : String,
			default : 'manual-upload',
		}
	},

	mounted() {

		const { dropzone } = this.$refs;

		const events = ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'];

		events.forEach( ( event ) => {

			dropzone.addEventListener( event, ( e ) => {
				e.preventDefault();
				e.stopPropagation();
			} );

			document.addEventListener( event, ( e ) => {
				e.preventDefault();
				e.stopPropagation();
			} );

		} );


	},

	data : () => ( {
		dragover : false,
		file     : null,
		error    : null,
		state    : 'empty'
	} ),

	watch : {

		file( file ) {

			if ( !file ) {
				this.state = 'empty';
				return;
			}

			if ( !this.validate( file ) ) {
				this.state = 'error';
				this.error = 'File type not allowed';
				return;
			}

			this.state = 'select';

			if ( this.emitImmediately ) {
				this.$emit( 'file', file );
			}

		},

		reset( shouldReset ) {

			if ( shouldReset ) {
				this.file     = null;
				this.dragover = false;
				this.state    = 'empty';
				this.error    = null;

				const input = document.getElementById( this.id );
				input.value = null;
			}

		}

	},

	methods : {
		handleDragEvent( e, state ) {

			// Dont do anything when leaving button
			if ( e.target.className === 'upload-button' ) {
				return;
			}

			// Dont do anything when entering button
			if ( e.fromElement.className === 'upload-button' ) {
				return;
			}

			this.dragover = state === 'enter';

		},

		getDropFile( e ) {

			e.stopImmediatePropagation();
			e.preventDefault();

			const file = e.dataTransfer.files[0];

			this.dragover = false;

			this.file = file;

		},

		getInputFile( e ) {

			e.stopImmediatePropagation();
			e.preventDefault();

			const file = e.target.files[0];

			this.file = file;

		},

		validate( file ) {

			const ext = file.name.split( '.' )[1];

			let valid = false;

			if ( !this.allowedExt ) {
				return true;
			}

			this.allowedExt.forEach( ( a ) => {

				if ( ext === a ) {
					valid = true;
				}

			} );

			return valid;

		},

		upload( file ) {

			this.$emit( 'file', file );

			this.file = null;
			this.$refs.fileInput.value = null;

		},

	}

};
</script>

<style lang="scss">
	.file-upload {
		margin: 15px;

		&.empty {

			.drop-zone {
				.no-file {
					display: block;
				}
			}

		}

		&.select {

			.drop-zone {
				.file {
					display: block;
				}
			}

			.button {
				display: flex;
			}

		}

		&.error {

			.drop-zone {
				.file {
					display: block;
				}

				.error-message {
					display: block;
				}

			}
		}

		input[type="file"] {
			display: none;
		}

		.drop-zone {
			border: #4d6ea2 dashed 1px;
			border-radius: 5px;
			padding: 20px 20px 40px;
			text-align: center;

			&.dragover {
				background-color: #4d6ea2;
			}

			.no-file {
				display: none;

				p {
					color: white;
					pointer-events: none;
					margin: 10px 0px;

					&:nth-child( 2 ) {

						margin-bottom: 25px;

					}

				}
			}

			.file {
				display: none;
				color: white;
				pointer-events: none;
				margin: 10px 0px 25px;

			}

			.error-message {
				display: none;
				color: white;
				pointer-events: none;
				margin: 10px 0px;
			}

			label.upload-button {
				background-color: #4d6ea2;
				padding: 10px;
				border-radius: 5px;
				color: white;
				cursor: pointer;
			}
		}

		.button {
			display: none;
			background-color: #4d6ea2;
			margin-top: 10px;
		}

	}
</style>
