
export type slide = {
	group: number;
	id: string;
	hint?: string;
	desc?: string;
	date?: string;
}

export type slideSection = {
	name: string;
	slides: slide[];
}

export const slidesData: slideSection[] = [
	{
		name: 'Lectures',
		slides: [
			{
				group: 1,
				id: 'organization',
				hint: '',
				desc: 'Organization'
			},
			{
				group: 1,
				id: 'summary',
				hint: '',
				desc: 'Summary'
			},
			{
				group: 2,
				id: 'lecture01',
				hint: 'Lecture 1',
				desc: 'Games'
			},
			{
				id: 'lecture02',
				group: 2,
				hint: 'Lecture 2',
				desc: 'Engines'
			},
			{
				id: 'lecture03',
				group: 2,
				hint: 'Lecture 3',
				desc: 'Assets'
			},
			{
				id: 'lecture04',
				group: 2,
				hint: 'Lecture 4',
				desc: 'Components'
			},
			{
				id: 'lecture05',
				group: 2,
				hint: 'Lecture 5',
				desc: 'Patterns'
			},
			{
				id: 'lecture06',
				group: 2,
				hint: 'Lecture 6',
				desc: 'Audio'
			},
			{
				id: 'lecture07',
				group: 2,
				hint: 'Lecture 7',
				desc: 'Space'
			},
			{
				id: 'lecture08',
				group: 2,
				hint: 'Lecture 8',
				desc: 'Physics'
			},
			{
				id: 'lecture09',
				group: 2,
				hint: 'Lecture 9',
				desc: 'Graphics'
			},
			{
				id: 'lecture10',
				group: 2,
				hint: 'Lecture 10',
				desc: 'AI'
			},
			{
				id: 'lecture11',
				group: 2,
				hint: 'Lecture 11',
				desc: 'Multiplayer'
			},
			{
				id: 'lecture12',
				group: 2,
				date: '17.12.2020'
			}
		]
	},
	{
		name: 'Minitalks',
		slides: [
			{
				group: 1,
				id: 'bonus_speedrunning',
				hint: '',
				desc: 'Speedrunning'
			},
			{
				group: 1,
				id: 'bonus_tutorials',
				hint: '',
				desc: 'Tutorials'
			},
			{
				group: 1,
				id: 'bonus_colors',
				hint: '',
				desc: 'Colors'
			},
			{
				group: 1,
				id: 'bonus_exposition',
				hint: '',
				desc: 'Exposition'
			},
			{
				group: 1,
				id: 'bonus_doom',
				hint: '',
				desc: 'Doom'
			},
			{
				group: 1,
				id: 'bonus_drm',
				hint: '',
				desc: 'DRM'
			},
			{
				group: 1,
				id: 'bonus_demoscene',
				hint: '',
				desc: 'Demoscene'
			},
			{
				group: 1,
				id: 'bonus_emulators',
				hint: '',
				desc: 'Emulators'
			},
			{
				group: 1,
				id: 'bonus_ui',
				hint: '',
				desc: 'Game UI'
			}
		]
	}
]
