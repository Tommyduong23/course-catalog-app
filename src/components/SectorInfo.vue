<template lang="pug">
	.sector-info
		.side(v-if='pathways')
			.sector(v-if='sectorCard')
				.title
					img(v-if='sectorCard.iconUrl' :src='sectorCard.iconUrl')
					h2 {{ sectorCard.title }}
				//- .description
				//- 	p {{ sector.description }}
			.pathways
				p.header Pathways
				.pathway(v-for='pathway in pathways')
					p.name {{ pathway.value }}
					.pathway-options
						p(@click='toggleDescription( pathway.value )') {{ isDescriptionOpen[pathway.value] ? 'hide' : 'full' }} description
						.dot
						p(@click='viewPathwayCourses( pathway.value )') view courses
					.pathway-description(:class='{ open : isDescriptionOpen[pathway.value] }')
						p(v-html='pathway.description')
		iframe.pdf-viewer(v-if='sectorCard && sectorCard.fileUrl' :src='sectorCard.fileUrl')
		.no-pdf(v-else)


</template>

<script>
import Vue from 'vue';
import { Ref } from '@/lib/db';

export default {
	name : 'sector-info',

	data : () => ( {
		schoolName : '',
		sectorName : '',

		sectorCard : null, // Info on the cte Cards. fileUrl, iconUrl
		pathways   : null,
		sector     : null, // has value and description

		isDescriptionOpen : {} // Keeps track of which pathway descriptions are showing
	} ),

	computed : {
		filters() {
			return this.$store.state.filters;
		}
	},

	created() {
		this.schoolName = this.$route.query.schoolName;
		this.sectorName = this.$route.query.sectorName;
	},

	watch : {
		sectorName() {
			const { schoolName, sectorName } = this;

			Ref
				.child( 'cte' )
				.child( schoolName )
				.child( sectorName )
				.once( 'value' )
				.then( ( snapshot ) => {
					this.sectorCard = snapshot.val();
				} );

			Ref
				.child( 'cteSectors' )
				.child( sectorName )
				.once( 'value' )
				.then( ( snapshot ) => {
					this.sector = snapshot.val();
				} );

			Ref
				.child( 'ctePathways' )
				.orderByChild( 'sector' )
				.equalTo( sectorName )
				.once( 'value' )
				.then( ( snapshot ) => {
					this.pathways = snapshot.val();
				} );
		},
	},

	methods : {
		toggleDescription( pathwayName ) {
			const isOpen = this.isDescriptionOpen[pathwayName] ? true : false;

			Vue.set( this.isDescriptionOpen, pathwayName, !isOpen );
		},

		viewPathwayCourses( pathwayName ) {
			const { filters } = this;

			// const schoolFilter = this.filters.find( ( filter ) => {
			// 	const { type } = filter;

			// 	if ( type !== 'list' && type !== 'multi-list' ) {
			// 		return false;
			// 	}

			// 	return filter.options.find( option => option.value === this.schoolName );
			// } );

			const pathwayFilter = this.filters.find( ( filter ) => {
				const { type } = filter;

				if ( type !== 'list' && type !== 'multi-list' ) {
					return false;
				}

				return filter.options.find( option => option.value === pathwayName );
			} );

			const query = ( () => {
				const obj = {};
				// if ( schoolFilter ) {
				// 	query[schoolFilter.key] = this.schoolName;
				// }

				if ( pathwayFilter ) {
					obj[pathwayFilter.key] = pathwayName;
				}

				return obj;
			} )();

			this.$router.push( {
				path : 'courses',
				query,
			} );
		}
	}

};
</script>

<style lang="scss">
	.sector-info	{
		height: 100vh;
		display: flex;

		.side {
			width : 350px;
			height: 100%;
			overflow: auto;

			.sector {
				margin: 30px 15px;

				.title {
					display: flex;
					flex-direction: column;
					align-items: center;

					h2 {
						color : $primary;
						text-align: center;
					}

					img, .no-icon {
						height: 100px;
						width: 100px;
						border-radius: 50%;
						margin-bottom: 15px;
					}

					p {
						font-size: 20px;
					}
				}

				.description {
					margin: 25px 15px;
				}
			}

			.pathways {
				overflow: auto;

				p.header {
					margin-left: 15px;
					margin-bottom : 15px;
					font-weight: 600;
					font-size: 20px;
					color: $primary;
				}

				.pathway {
					border-top: 1px solid $lightGrey;
					padding : 20px 15px;

					&:last-child {
						border-bottom: 1px solid $lightGrey;
					}

					.name {
						font-weight: 600;
					}

					.pathway-options {
						display: flex;
						align-items: center;
						margin-top: 5px;


						p {
							cursor: pointer;
							text-transform: uppercase;
							letter-spacing: 3px;
							font-size: 12px;
						}

						.dot {
							margin: 0px 10px;
							width: 5px;
							height: 5px;
							border-radius: 50%;
							background-color: $primary;
						}
					}

					.pathway-description {
						display: none;
						margin-top: 20px;

						&.open {
							display: flex;
						}
					}
				}
			}
		}

		.pdf-viewer {
			height: 100%;
			flex: 1 1 0;
		}

		.no-pdf {
			height: 100%;
			flex: 1 1 0;
			background :#d0d1db;
		}
	}

</style>
