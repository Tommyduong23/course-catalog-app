<template lang="pug">
	.card(
		:class='{ active }'
		@click='view'
		@mousedown='active = true'
		@mouseup='active = false'
		@mouseleave='active = false'
		@touchstart='active = true'
		@touchend='active = false'
		@touchmove='active = false'
	)
		.row.subject
			h3 {{ card[titleKey] }}
			.check(
				@click.stop='save'
				@mousedown.stop='() => {}'
				@touchstart.stop='() => {}'
				:class='{ active : saved }'
			)
		.row.categories
			p.tag(v-for='tag in tags' v-if='tag.name' :style='tag.style') {{ tag.name }}
		.description
			p {{ card[descriptionKey] || 'No description available for this course' }}
		.button
			p learn more
</template>

<script>
import { ObjToArray } from '@/lib/utils';

export default {
	name : 'card',

	props : {

		saved : {
			required : true,
			type     : Boolean
		},

		card : {
			default : null
		},

		courseModel : {
			default : () => {},
		},

		titleKey : {
			default : '',
		},

		descriptionKey : {
			default : '',
		},

		tagKeys : {
			default : []
		},

	},

	data : () => ( {
		active : false,
	} ),

	computed : {

		schoolsArray() {

			const card = this.card;

			if ( !card || !card.schools ) {
				return [];
			}

			const schools = Object.keys( card.schools ).map( key => card.schools[key] );

			return schools;

		},

		displayedSchools() {
			return this.schoolsArray.slice( 0, 6 );
		},

		tags() {
			const { courseModel, tagKeys, card } = this;

			const tags = [];
			tagKeys.forEach( ( key, i ) => {
				const model = courseModel[key];
				const { type } = model;

				const tag = {
					style : {
						filter : `hue-rotate(${i * 50}deg)`
					}
				};

				switch ( type ) {
					case 'boolean':
						tag.name = key;
						tags.push( tag );
						break;

					case 'arbitrary':
						tag.name = key;
						tags.push( tag );
						break;

					case 'list-item':
						tag.name = card[key];
						tags.push( tag );
						break;

					case 'multi-list-item':
						 ObjToArray( card[key] ).forEach( ( item ) => {

							const t = {
								name  : item.value,
								style : {
									filter : `hue-rotate(${i * 50}deg)`
								}
							};

							tags.push( t );
						} );
						break;

					default:
						break;

				}

			} );

			return tags;
		},

	},

	methods : {

		save() {
			const { card } = this;

			this.$emit( 'save', card );

		},

		view() {

			const { card } = this;
			this.$emit( 'view', card );

		},

	},
};
</script>

<style lang="scss">
@import '@/assets/variables.scss';

.card {
	margin: 15px;
	background-color: white;
	padding: 30px 0 0 0;
	font-weight: 300;
	box-shadow: $floatingObject;
	border-radius: 5px;
	display: flex;
	flex-direction: column;
	border-radius: 15px;
	overflow: hidden;
	max-height: 500px;
	overflow: hidden;
	position: relative;

	&::after {
		content: ' ';
		position: absolute;
		height: 30px;
		width: 100%;
		left: 0;
		top: calc(100% - 84px); // height of button
		transform: translateY(-100%);
		background-image: linear-gradient( to top, white, rgba(255,255,255,0) );
	}

	.row{
		align-items: center;
		padding: 0 30px;
		flex-shrink: 0;

		&.subject{
			justify-content: space-between;
			text-transform: capitalize;
			margin-bottom: 15px;

			h3 {
				font-size: 24px;
				color: $primary;
				padding-right: 5px;
			}

			i {
				cursor: pointer;
			}
		}

		&.categories{
			flex-wrap: wrap;

			.tag {
				border-radius: 20px;
				padding: 5px 12px;
				font-weight: 400;
				text-transform: uppercase;
				margin: 0px 10px 5px 0px;
				border: $primaryAccent 2px solid;
				color: $primaryAccent;

			}

		}

	}

	.description {
		margin: 10px 0;
		flex: 1 1 auto;
		overflow: hidden;
		padding: 0 30px;

		.label {
			margin: 15px 0 0 0;
			color: lighten( $primary, 15 );
			text-transform: uppercase;
			font-weight: 600;
			font-size: 14px;
			text-align: center;
		}

		.column {
			text-transform: capitalize;
			margin-top: 15px;

			p {
				font-size: 18px;
				margin: 5px 0;

				&:nth-of-type(1){
					margin-top: 0;
				}
			}

			.more {
				color: $primary;
			}
		}
	}

	.button {
		margin-top: 20px;
		text-transform: capitalize;
		background: $secondary;
		color: $primary;
		font-weight: 600;
		border-radius: 0;
		padding: 15px 30px;
		flex-shrink: 0;
	}
}
/* Phones */
@media only screen and (min-width : 1px) and (max-width : 575px) {

	.card{
		width: 100%;
	}
}

/* Small Devices, Tablets */
@media only screen and (min-width : 576px) and (max-width : 992px) {

	.card{
		width: calc( ( 100% - 60px ) / 2 );
	}
}

/* Medium Devices, Desktops */
@media only screen and (min-width : 992px) and (max-width : 1199px) {
	.card {
		width: calc( ( 100% / 2 ) - 30px);
	}
}

/* Large Devices, Wide Screens */
@media only screen and (min-width : 1200px) {
	.card{
		width: calc( ( 100% / 3 ) - 30px);
	}
}
</style>
