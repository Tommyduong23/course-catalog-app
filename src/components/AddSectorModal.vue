<template lang="pug">
#add-sector-modal
	.modal-container(:class='{ active : state === "add-sector" }' @click.self='cancelSectorUpload')
		.modal-wrapper(:class='modalStep')
			.progress-indicators
				.progress-bar(v-bind:style='{ transform : `scale(${uploadProgress}, 1)` }')
				.loading-circles
					span
					span
					span
				.check.active
				.failure
					.failed
					.text Failed to Upload
			p.spacey {{ isEditing ? 'Edit' : 'Create a New' }} Sector
			custom-dropdown.sector-dropdown(
				v-model='newSector.title'
				:options='titleOptions'
			)
			.column
				.file-input.row
					p.label {{ isEditing ? 'Edit' : 'Upload' }} PDF
					file-upload(
						v-show='isAdmin'
						@file='uploadPDF'
						:allowed-ext='["pdf"]'
						:emit-immediately='true'
						:reset='state == "browse"'
						:id='"cte-upload"'
						:preview='newSector.fileUrl'
					)
				.file-input.row
					p.label {{ isEditing ? 'Edit' : 'Upload' }} Logo
					file-upload(
						v-show='isAdmin'
						@file='uploadLogo'
						:allowed-ext='["png", "jpg", "jpeg"]'
						:emit-immediately='true'
						:reset='state == "browse"'
						:preview='newSector.iconUrl'
					)
			.buttons
				.button.no-bg(@click='cancelSectorUpload') cancel
				.button(@click='() => { if ( isEditing ) { editSector() } else { saveSector() } }') save
			.error-message Please select a sector
</template>

<script>
import FileUpload from '@/components/FileUpload';
import CustomDropdown from '@/components/CustomDropdown';
import { firebase, Ref, FirebaseKey } from '@/lib/db';

export default {
	name : 'add-sector-modal',

	props : {
		activeSchoolKey : {
			type : String,
		}
	},

	components : {
		FileUpload,
		CustomDropdown,
	},

	data : () => ( {
		file           : null,
		logo           : null,
		uploadProgress : 0,
	} ),

	computed : {
		isAdmin() {
			return this.$store.state.isAdmin;
		},

		state() {
			return this.$store.state.modalState;
		},

		modalStep() {
			return this.$store.state.modalStep;
		},

		isEditing() {
			return this.$store.state.isEditing;
		},

		newSector() {
			return this.$store.state.newSector;
		},

		titleOptions() {
			return {
				options     : this.getSectors,
				defaultText : 'Select a Sector',
				searchable  : false,
			};
		},
	},

	methods : {
		async getSectors() {
			let data;

			const sectorKeys = [];

			await firebase.database().ref( 'cteSectors' )
				.once( 'value' )
				.then( ( snapshot ) => {
					data = snapshot.val();
					const keys = Object.keys( data );

					keys.forEach( ( key ) => {
						sectorKeys.push( key );
					} );
				} );

			// we're going to through our sector keys and return
			// a new array of the values from the sector keys by
			// using the data variable

			const formattedSectors = sectorKeys.reduce( ( sectors, key ) => {

				const { value } = data[key];

				sectors.push( {
					text : value,
					value
				} );

				return sectors;
			}, [] );

			return formattedSectors;
		},

		cancelSectorUpload() {
			this.$store.dispatch( 'closeSectorUpload' );
		},

		uploadPDF( file ) {
			this.file = file;
		},

		uploadLogo( logo ) {
			this.logo = logo;
		},

		async saveSector() {
			if ( !this.newSector.title ) {
				this.$store.dispatch( 'updateStore', ['modalStep', 'error'] );
				return;
			}

			this.$store.dispatch( 'updateStore', ['modalStep', 'uploading'] );

			const schoolKey = this.activeSchoolKey;
			const fileKey   = FirebaseKey();
			const { file }  = this;

			const logoKey = FirebaseKey();
			const { logo } = this;

			const uploadJobAsset = ( asset, key ) => {

				const type = asset.type.split( '/' )[1];

				const upload = firebase.storage()
					.ref( '/' )
					.child( schoolKey )
					.child( `${key}.${type}` )
					.put( asset );

				upload.on( 'state_changed', ( snapshot ) => {
					this.uploadProgress = ( snapshot.bytesTransferred / snapshot.totalBytes );
				} );

				return upload.then( snapshot => snapshot.ref.getDownloadURL() );
			};

			let fileUrl = null;
			let iconUrl = null;

			if ( file ) {
				fileUrl = await uploadJobAsset( file, fileKey );
			}

			if ( logo ) {
				iconUrl = await uploadJobAsset( logo, logoKey );
			}

			const newSector = Object.assign( {}, this.newSector );

			newSector.iconUrl = iconUrl;
			newSector.fileUrl = fileUrl;

			Ref.child( 'cte' )
				.child( schoolKey )
				.child( newSector.title )
				.set( newSector )
				.then( () => {

					this.$store.dispatch( 'updateStore', ['modalStep', 'finished'] );

					window.setTimeout( () => {
						this.cancelSectorUpload();
					}, 2000 );

				} )
				.catch( () => {
					this.$store.dispatch( 'updateStore', ['modalStep', 'failed'] );
				} );

		},

		async editSector() {
			const schoolKey = this.activeSchoolKey;
			const sectorKey = this.newSector.key;

			let fileUrl = this.newSector.fileUrl || null;
			let iconUrl = this.newSector.iconUrl || null;

			this.$store.dispatch( 'updateStore', ['modalStep', 'uploading'] );

			const uploadJobAsset = ( asset, key ) => {

				const type = asset.type.split( '/' )[1];

				const upload = firebase.storage()
					.ref( '/' )
					.child( schoolKey )
					.child( `${key}.${type}` )
					.put( asset );

				upload.on( 'state_changed', ( snapshot ) => {
					this.uploadProgress = ( snapshot.bytesTransferred / snapshot.totalBytes );
				} );

				return upload.then( snapshot => snapshot.ref.getDownloadURL() );
			};

			if ( this.file ) {
				fileUrl = await uploadJobAsset( this.file, this.newSector.fileKey );
			}

			if ( this.logo ) {
				iconUrl = await uploadJobAsset( this.logo, this.newSector.iconUrl );
			}

			const formattedSector = Object.assign( {}, this.newSector, { iconUrl, fileUrl } );

			Ref.child( 'cte' )
				.child( schoolKey )
				.child( sectorKey )
				.set( formattedSector )
				.then( ( ) => {
					this.$store.dispatch( 'updateStore', ['modalStep', 'finished'] );

					window.setTimeout( () => {
						this.cancelSectorUpload();
					}, 2000 );
				} )
				.catch( () => {
					this.$store.$dispatch( 'updateStore', ['modalStep', 'failed'] );
				} );

		},

	}
};
</script>

<style lang="scss">
#add-sector-modal {
	.modal-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255,255,255,0.5);
		opacity: 0;
		transition: opacity 0.4s ease;
		pointer-events: none;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		will-change: opacity;

		&.active {
			opacity: 1;
			pointer-events: all;

			.modal-wrapper {
				transform: scale( 1, 1 );

				.buttons .button {
					pointer-events: all;
				}
			}
		}

		.modal-wrapper {
			max-width: 700px;
			max-height: 90vh;
			transform: scale(0.8,0.8);
			transition: transform 0.4s ease;
			padding: 25px;
			border-radius: 10px;
			box-shadow: $floatingObject;
			background: white;
			position: relative;
			width: 80%;
			display: flex;
			flex-direction: column;
			overflow: hidden scroll;
			will-change: transition;

			&.error {

				.buttons {
					transform: translate3d(0, 0px, 0 );
				}

				.error-message {
					opacity: 1;
				}
			}

			&.uploading,
			&.finished,
			&.failed {

				.progress-indicators {
					opacity: 1;
				}
			}

			&.finished {

				.progress-indicators {

					.loading-circles {
						opacity: 0;
						transform: translate3d(-50%,calc(-50% - 30px),0);
					}

					.check {
						opacity: 1 !important;
						transform: translate3d(-50%,-50%,0) scale(3,3);
					}
				}
			}

			&.failed {

				.progress-indicators {

					.loading-circles {
						opacity: 0;
					}

					.failure {
						opacity: 1;
						transform: translate3d(-50%,-50%,0) scale(3,3);
					}
				}
			}

			.progress-indicators {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: white;
				pointer-events: none;
				opacity: 0;
				z-index: 100 !important;

				.loading-circles,
				.check,
				.failure {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate3d(-50%,-50%, 0);
					transition: transform 0.5s ease, opacity 0.5s ease;
				}

				.check {
					opacity: 0;
					transform: translate3d(-50%,calc(-50% + 50px), 0) scale( 3, 3 );
				}

				.failure {
					transform: translate3d(-50%,calc(-50% + 50px), 0) scale(1,1);
					opacity: 0;
					display: flex;
					flex-direction: column;
					align-items: center;

					.failed {
						height: 30px;
						width: 30px;
						border-radius: 50%;
						background: $cancel;
						position: relative;

						&::before,
						&::after {
							content: ' ';
							position: absolute;
							top: 50%;
							left: 50%;
							height: 20px;
							width: 4px;
							border-radius: 2px;
							background: white;
						}

						&::before {
							transform: translate(-50%,-50%) rotate(45deg);
						}

						&::after {
							transform: translate(-50%,-50%) rotate(-45deg);
						}
					}

					.text {
						margin-top: 10px;
						font-size: 6px;
						color: $cancel;
					}
				}

				.progress-bar {
					position: absolute;
					height: 100%;
					width: 100%;
					top: 0;
					left: 0;
					background: $secondary;
					transition: transform 0.2s ease;
				}
			}

			.spacey {
				padding-bottom: 10px;
				border-bottom: 1px solid $lightGrey;
			}

			.sector-dropdown {
				z-index: 11!important;
				width: 100%;
				padding-top: 15px;

				.select-display {
					z-index: 2;

					p {
						width: 100%;

						&.minimal-label {
							left: 0;
						}
					}
				}
			}

			> p {
				pointer-events: none;
			}

			p {
				text-align: center;
			}

			.input {
				margin: 40px 0;

				.input-label {
					text-align: center;
					color: $primary;
					transform: translate3d(0,100%,0);
					opacity: 0;
					transition: transform 0.2s ease, opacity 0.2s ease;
					pointer-events: none;

					&.active {
						transform: translate3d(0,0,0);
						opacity: 1;
					}
				}

				input {
					text-align: center;
					font-size: 24px;
					font-weight: 400;
					width: 100%;
				}
			}

			.column {
				align-items: center;
				margin: 10px 0;

				.file-input {
					width: 100%;
					align-items: center;
					justify-content: space-evenly;

					&:not( :first-of-type ) {
						margin-top: 15px;
					}

					p.label {
						color: $primary;
						font-size: 18px;
						width: 20%;
					}

					.file-upload {
						width: 70%;

						&.error {

							.file {
								display: none;
							}

							label {
								color: $cancel !important;
								border: 2px solid $cancel !important;
							}
						}

						.button {
							display: none !important;
						}

						.drop-zone {
							padding: 20px;
							display: flex;
							align-items: center;
							justify-content: center;
							flex-direction: row-reverse;
							flex-wrap: wrap;

							.upload-button {
								padding: 15px;
								border-radius: 30px;
								border: 2px solid $primary;
								text-transform: uppercase;
								background: transparent;
							}

							.file {
								overflow: hidden;

								p {
									overflow: hidden;
									text-overflow: ellipsis;
									font-size: 14px;
								}

							}

							.upload-button,
							.no-file p,
							.file,
							.error-msg p {
								color: $primary;
								font-size: 14px;
								letter-spacing: 5px;
								text-transform: uppercase;
							}

							.error-msg p {
								color: $cancel !important;
							}

							.file,
							.error-msg {
								margin: 0;
								margin-left: 15px;
							}

							.no-file {

								p {
									margin-left: 15px;

									&::before {
										content: 'or ';
									}

									&:nth-child(2) {
										display: none;
									}
								}
							}
						}

						p {
							color: $primary;

							&.error {
								color: $cancel;
							}
						}
					}
				}
			}

			> *:not(.file-upload) {
				z-index: 10;
			}

			.buttons {
				display: flex;
				align-items: flex-end;
				justify-content: center;
				pointer-events: none;
				transform: translate3d(0,20px,0);
				transition: transform 0.2s ease;

				.button {
					border-radius: 30px;
					margin: 0 15px;
					text-transform: uppercase;
					letter-spacing: 3px;
					font-size: 12px;
					padding: 15px;

					&.no-bg {
						background: transparent;
						color: $grey;
					}
				}
			}

			.error-message {
				color: $cancel;
				opacity: 0;
				transition: opacity 0.2s ease;
				text-align: center;
				pointer-events: none;
				margin-top: 10px;
			}
		}
	}
}
</style>
