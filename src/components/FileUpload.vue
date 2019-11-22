<template lang="pug">
	.file-upload(:class='[state, { "has-file" : file }]')
		.drop-zone(
			@dragenter='handleDragEvent( $event, "enter" )'
			@dragleave='handleDragEvent( $event, "leave" )'
			@drop='getDropFile( $event )'
			:class='{ dragover }'
			ref='dropzone'
		)
			embed.file-preview(
				v-if='file || preview'
				:src='fileSrc || preview'
				:type='fileType'
			)
			.no-file
				p Drop Here
				p - or -
			.error-message(:class='{ active : error }')
				p.error {{ error }}
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
		},

		preview : {
			type : String,
		},
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
		state    : 'empty',

		fileSrc : null,
	} ),

	watch : {

		file( file ) {

			this.error = null;

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

	computed : {
		fileType() {
			if ( this.file ) {
				return this.file.type;
			}

			return '';
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

			const reader = new FileReader();

			reader.onload = ( fileData ) => {
				console.log( this );
				this.fileSrc = fileData.target.result;
			};

			reader.readAsDataURL( file );

		},

		validate( file ) {

			const ext = file.type.split( '/' )[1];

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

			> * {
				flex: 1 0 0;
			}

			.file-preview {
				flex: 0 0 100%;
				max-width: 100%;
				height: 150px;
				margin-bottom: 15px;
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

				&.active {
					display: block;
					opacity: 1!important;
				}
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
