<template lang="pug">
	.profile-image
		.sign-in(@click='emit( "profile-click" )' v-if='!user')
			p sign in
			.icon.icon-person
		.profile(@click='emit( "profile-click" )' v-else)
			.user
				p {{ user.displayName }}
				//- p.small(@click.stop='emit( "feedback-click" )') give feedback
			.picture(:style='{ backgroundImage : `url(${user.photoURL})` }' v-if='user.photoURL')
			.icon.icon-person(v-else)
</template>

<script>
export default {
	name : 'profile-image',

	computed : {

		user() {
			return this.$store.state.user;
		},

		uid() {
			const { user } = this;

			if ( !user ) {
				return null;
			}

			return user.uid;
		}

	},

	methods : {

		emit( event ) {
			this.$emit( event );
		}

	}
};
</script>


<style lang="scss">
@import '@/assets/variables.scss';

.profile-image {
	margin: 3px 10px;
	flex: 0 0 auto;
	cursor: pointer;
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: flex-end;

	p {
		font-size: 16px;
		font-weight: 600;
		color: $grey;

		&:nth-child(2) {
			font-size: 12px;
			font-weight: 600;
			text-transform: uppercase;
			color: $primary;
		}
	}

	.sign-in {
		display: flex;
		align-items: center;
		border-radius: 40px;
		min-width: 36px;
		padding: 8px 15px;

		.icon-person {
			font-size: 18px;
		}

		p {
			margin-right: 15px;
			flex-shrink: 0;
			text-transform: capitalize;
		}
	}

	.user {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.profile {
		display: flex;
		align-items: center;
		justify-content: space-between;
		.picture {
			height: 30px;
			width: 30px;
			border-radius: 15px;
			background-size: cover;
			background-position: center center;
		}

		p {
			margin-right: 15px;
		}
	}
}

@media only screen and (min-width : 1px) and (max-width : 575px) {
	.profile-image {
		margin: 0 !important;

		.sign-in {
			padding: 0 !important;
			border: none !important;

			.icon-person {
				font-size: 24px;
			}

			p {
				display: none !important;
			}
		}

		.profile {

			p {
				display: none !important;
			}
		}
	}
}
</style>
