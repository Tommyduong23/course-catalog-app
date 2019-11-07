import Vue from 'vue';
import Router from 'vue-router';

import Courses from '@/components/Courses';
import Cte from '@/components/Cte';

Vue.use( Router );

export default new Router( {
	mode   : 'history',
	base   : process.env.BASE_URL,
	routes : [
		{
			path     : '/',
			redirect : '/courses',
			props    : { view : 'courses' }
		},
		{
			path      : '/courses',
			name      : 'Courses',
			component : Courses,
		},
		{
			path      : '/cte',
			name      : 'CTE',
			component : Cte,
		},
		{
			path      : '/saved',
			name      : 'Saved',
			component : Courses,
			props     : { view : 'saved' }
		}
	],
} );
