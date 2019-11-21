<template lang="pug">
	#sectors
		.sectors-wrapper(v-if='sectors.length && !loadingSectors')
			.cte-sector(v-for='sector in sectors' @click='routeTo( sector)')
				.sector
					.logo
						img(v-if='sector.iconUrl' :src='sector.iconUrl')
					.title
						p {{ sector.title }}
					.sub-title Learn more
				.hover-bar(v-if='isAdmin')
					.btns
						.btn-float.trash(
							@click.stop.prevent='deleteSector( sector )'
							:class='{ confirm : areYouSure }'
							@mouseleave='areYouSure = false'
						)
							img(src='/img/trash.svg')
						.btn-float.edit(
							@click.stop.prevent='openSectorUpload( sector )'
						)
							img(src='/img/edit.svg')
			.upload-new-sector(
				v-if='isAdmin'
				@click='openSectorUpload()'
			)
				.plus-sign
				.text add a new sector

		//- shown when there are no sectors
		p.spacey(v-if='!sectors.length && !loadingSectors') No sectors for {{ activeSchool.name }}
		.upload-new-sector(
			v-if='!sectors.length && !loadingSectors && isAdmin'
			@click='openSectorUpload()'
		)
			.plus-sign
			.text add a new sector

</template>


<script>
import { Ref } from '@/lib/db';

export default {
	name : 'sectors',

	props : {
		activeSchool : {
			type : Object
		}
	},

	data : () => ( {
		areYouSure : false,
	} ),

	computed : {
		user() {
			return this.$store.state.user;
		},

		isAdmin() {
			return this.$store.state.isAdmin;
		},

		sectors() {
			return this.$store.state.sectors;
		},

		loadingSectors() {
			return this.$store.state.loadingSectors;
		},

	},

	methods : {
		openSectorUpload( sector = null ) {
			this.$store.dispatch( 'openSectorUpload', sector );
		},

		deleteSector( sector ) {

			if ( !this.areYouSure ) {
				this.areYouSure = true;
				return;
			}

			const sectorKey = sector.key;
			const schoolKey = this.activeSchool.key;

			Ref.child( 'cte' )
				.child( schoolKey )
				.child( sectorKey )
				.child( 'deleted_at' )
				.set( Date.now() );

			this.areYouSure = false;

		},

		routeTo( sector ) {
			this.$router.push( {
				path  : 'sector-info',
				query : {
					schoolName : this.activeSchool.value,
					sectorName : sector.key,
				}
			} );
		}
	},
};
</script>

<style lang="scss">

#sectors {
	p.spacey {
		text-align: center;
		margin-top: 30px;
	}

	.upload-new-sector {
		min-height: 100px;
		padding: 25px;
		background-color: $secondary;
		border: 2px dashed $primary;
		border-radius: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		cursor: pointer;

		.plus-sign {
			height: 50px;
			width: 50px;
			margin-bottom: 25px;
			position: relative;

			&::before,
			&::after {
				content: ' ';
				position: absolute;
				top: 50%;
				left: 50%;
				height: 30px;
				width: 4px;
				border-radius: 2px;
				background-color: $primary;
			}

			&::before {
				transform: translate(-50%,-50%);
			}

			&::after {
				transform: translate(-50%,-50%) rotate(90deg);;
			}
		}

		.text {
			max-width: 150px;
			text-transform: uppercase;
			letter-spacing: 5px;
			color: $primary;
			line-height: 150%;
			text-align: center;
		}
	}

	// displays when there are no sectors
	> .upload-new-sector {
		position: relative;
		left: 50%;
		transform: translateX(-50%);
		display: inline-flex;
		margin-top: 30px;
	}

	.sectors-wrapper {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		padding: 10px;

		.cte-sector,
		.upload-new-sector {
			width: calc((100% - 100px)/5);
		}

		.cte-sector {
			display: flex;
			margin: 10px;
			position: relative;

			&:visited,
			&:link {
				color: $defaultTextColor !important;
				text-decoration: none;
			}

			&:hover {

				.hover-bar {
					opacity: 1;
					pointer-events: all;

					.btns {
						transform: translateY(0);
					}
				}

			}

			.sector:active ~ .hover-bar {
				transform: scale( 0.9, 0.9 ) translateY(10px);
			}

			.sector {
				padding: 15px;
				border-radius: 10px;
				box-shadow: $floatingObject;
				background: white;
				cursor: pointer;
				min-height: 250px;
				display: flex;
				flex-direction: column;
				flex: 1 1 0;
				transform: scale(1,1);
				transition: transform 0.2s ease;

				&:active {
					transform: scale(0.9,0.9);
				}

			}

			.hover-bar {
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				display: flex;
				flex-direction: column;
				opacity: 0;
				transition: opacity 0.2s ease, transform 0.2s ease;
				z-index: 10;
				pointer-events: none;
				transform: scale(1,1);
				transition: transform 0.2s ease;

				.btns {
					width: 100%;
					display: flex;
					flex-flow: row-reverse;
					justify-content: space-between;
					transform: translateY(-40px);
					transition: transform 0.2s ease;
					align-items: start;
					overflow: hidden;


					.btn-float {
						padding: 0 20px;
						height: 50px;
						margin: 10px;
						border-radius: 25px;
						background: $lightGrey;
						box-shadow: $floatingObject;
						display: flex;
						align-items: center;
						justify-content: center;
						transition: box-shadow 0.2s ease;
						position: relative;
						cursor: pointer;
						pointer-events: all;

						&:active {
							box-shadow: none;
						}

						&.edit {
							background-color: #C8D1E8
						}

						&.trash {
							background-color: $cancel;

							&::before {
								content: 'click again to delete';
								font-size: 12px;
								color: white;
								text-transform: uppercase;
								white-space: nowrap;
								overflow: hidden;
								text-overflow: hidden;
								max-width: 0;
								max-height: 0;
								margin-bottom: 2px;
								transition: max-width 0.2s ease;
							}

							&.confirm {

								img {
									display: none;
								}

								&::before {
									max-width: 300px;
									max-height: none;
								}
							}

						}


					}
				}
			}

			.title {
				flex: 1 0 auto;

				p {
					font-size: 18px;
					text-align: center;
				}
			}

			.logo {
				margin: 15px;
				align-self: center;
				width: 50%;
				margin-bottom: 30px;

				img {
					width: 100%;
					max-width: 250px;
				}
			}

			.sub-title {
				font-size: 12px;
				text-transform: uppercase;
				color: $primary;
				letter-spacing: 5px;
				margin-top: 15px;
				flex: 0 0 auto;
				line-height: 150%;
				text-align: center;
			}
		}

		.upload-new-sector {
			margin: 10px;
		}
	}
}


/* phones */
@media only screen and (min-width : 1px) and (max-width : 575px) {
	#sectors {
		.sectors-wrapper {

			.cte-sector,
			.upload-new-sector {
				width: calc((100% - 20px)/1) !important;
			}

		}
	}
}

/* tablets */
@media only screen and ( min-width: 576px ) and ( max-width : 1072px ) {
	#sectors {
		.sectors-wrapper {

			.cte-sector,
			.upload-new-sector {
				width: calc((100% - 60px)/3) !important;
			}

		}
	}
}


/* desktops */
@media only screen and ( min-width: 1073px ) and ( max-width : 1257px ) {
	#sectors {
		.sectors-wrapper {

			.cte-sector,
			.upload-new-sector {
				width: calc((100% - 80px)/4) !important;
			}

		}
	}
}


</style>
