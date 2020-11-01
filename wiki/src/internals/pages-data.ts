export type slide = {
	group: number;
	id: string;
	hint?: string;
	desc?: string;
	date?: string;
}

export const slidesData: slide[] = [
	{
		group: 1,
		id: 'organization',
		hint: 'Lecture 0',
		desc: 'Organization'
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
		date: '5.11.2020'
	},
	{
		id: 'lecture08',
		group: 2,
		date: '12.11.2020'
	},
	{
		id: 'lecture09',
		group: 2,
		date: '26.11.2020'
	},
	{
		id: 'lecture10',
		group: 2,
		date: '3.12.2020'
	},
	{
		id: 'lecture11',
		group: 2,
		date: '10.12.2020'
	},
	{
		id: 'lecture12',
		group: 2,
		date: '17.12.2020'
	}
]
