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
			p.spacey {{ isEditing ? 'Edit' : 'Upload a New' }} Sector
			.input
				.input-label(:class='{ active : newSector.title !== "" }') Name
				input(type='text' v-model='newSector.title' placeholder='Type a Name')
			.row
				.file-input
					p.label {{ isEditing ? 'Edit' : 'Upload' }} PDF
					file-upload(
						v-show='isAdmin'
						@file='uploadPDF'
						:allowed-ext='["pdf"]'
						:emit-immediately='true'
						:reset='state == "browse"'
						:id='"cte-upload"'
					)
				.file-input
					p.label {{ isEditing ? 'Edit' : 'Upload' }} Logo
					file-upload(
						v-show='isAdmin'
						@file='uploadLogo'
						:allowed-ext='["png", "jpg"]'
						:emit-immediately='true'
						:reset='state == "browse"'
					)
			.buttons
				.button.no-bg(@click='cancelSectorUpload') cancel
				.button(@click='() => { if ( isEditing ) { editSector() } else { saveSector() } }') save
			.error-message Please add a name, file and logo
</template>

<script>
import FileUpload from '@/components/FileUpload';
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
		}
	},

	methods : {
		cancelSectorUpload() {
			this.$store.dispatch( 'closeSectorUpload' );
		},

		uploadPDF( file ) {
			this.file = file;
		},

		uploadLogo( logo ) {
			this.logo = logo;
		},

		saveSector() {
			if ( !this.newSector.title || !this.file || !this.logo ) {
				this.$store.dispatch( 'updateStore', ['modalStep', 'error'] );
				return;
			}

			this.$store.dispatch( 'updateStore', ['modalStep', 'uploading'] );

			const schoolKey = this.activeSchoolKey;
			const fileKey   = FirebaseKey();
			const { file }  = this;

			const logoKey = FirebaseKey();
			const { logo } = this;

			const uploadFileJob = firebase.storage()
				.ref( '/' )
				.child( schoolKey )
				.child( `${fileKey}.pdf` )
				.put( file );

			const uploadLogoJob = firebase.storage()
				.ref( '/' )
				.child( schoolKey )
				.child( `${logoKey}.png` )
				.put( logo );

			uploadFileJob.on( 'state_changed', ( snapshot ) => {
				this.uploadProgress = ( snapshot.bytesTransferred / snapshot.totalBytes );
			} );

			Promise.all( [
				uploadFileJob.then( snapshot => snapshot.ref.getDownloadURL() ),
				uploadLogoJob.then( snapshot => snapshot.ref.getDownloadURL() )
			] )
			.then( ( urls ) => {
				const fileUrl = urls[0];
				const logoUrl = urls[1];

				const newSector = Object.assign( {}, this.newSector );

				newSector.fileKey = fileKey;
				newSector.url     = fileUrl;
				newSector.logoKey = logoKey;
				newSector.logoUrl = logoUrl;

				return Ref.child( 'cte' )
					.child( schoolKey )
					.push()
					.set( newSector );

			} )
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

		editSector() {
			const schoolKey = this.activeSchoolKey;
			const sectorKey = this.newSector.key;

			const promises = [];

			this.$store.dispatch( 'updateStore', ['modalStep', 'uploading'] );

			if ( this.file ) {

				const fileKey = this.newSector.fileKey || FirebaseKey();

				const uploadFileJob = firebase.storage()
					.ref( '/' )
					.child( schoolKey )
					.child( `${fileKey}.pdf` )
					.put( this.file );

				promises.push( uploadFileJob );

				uploadFileJob.on( 'state_changed', ( snapshot ) => {
					this.uploadProgress = ( snapshot.bytesTransferred / snapshot.totalBytes );
				} );

				uploadFileJob.then( snapshot => snapshot.ref.getDownloadURL() )
					.then( ( url ) => {

						return Ref.child( 'cte' )
							.child( schoolKey )
							.child( sectorKey )
							.update( {
								fileKey,
								url,
							} );

					} );

			}

			if ( this.logo ) {
				const logoKey = this.newSector.logoKey || FirebaseKey();

				const uploadLogoJob = firebase.storage()
					.ref( '/' )
					.child( schoolKey )
					.child( `${logoKey}.png` )
					.put( this.logo );

				promises.push( uploadLogoJob );

				uploadLogoJob.then( snapshot => snapshot.ref.getDownloadURL() )
					.then( ( url ) => {

						return Ref.child( 'cte' )
							.child( schoolKey )
							.child( sectorKey )
							.update( {
								logoKey,
								logoUrl : url
							} );

					} );
			}

			Ref.child( 'cte' )
				.child( schoolKey )
				.child( sectorKey )
				.child( 'title' )
				.set( this.newSector.title );

			Promise.all( promises )
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

}
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
			overflow: hidden;
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

			.file-input {
				width: 50%;

				p.label {
					color: $primary;
					font-size: 18px;
				}

				.file-upload {

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
