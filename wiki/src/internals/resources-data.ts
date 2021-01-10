
export type resourceField = {
	key: string;
	value: string;
}

export type resourceItem = {
	title: string;
	subTitle?: string;
	description?: string;
	fields?: resourceField[];
	icon: string;
}

export type resourceSection = {
	name: string;
	resources: resourceItem[];
}

export const resourcesData: resourceSection[] = [
	{
		name: 'Books',
		resources: [
			{
				title: 'Game Engine Architecture (3rd ed.)',
				subTitle: 'Json Gregory, 2018',
				fields: [
					{
						key: 'Lectures',
						value: 'Games, Engines, Assets, Audio, Physics, Space'
					}
				],
				icon: 'books/book_game_engine_arch.jpg'
			},
			{
				title: 'Game Programming Patterns',
				subTitle: 'Robert Nystrom, 2014',
				fields: [
					{
						key: 'Lectures',
						value: 'Patterns'
					}
				],
				icon: 'books/book_programming_patterns.jpg'
			},
			{
				title: 'Game Sound: An Introduction to the History, Theory, and Practice of Video Game Music and Sound Design',
				subTitle: 'Karen Collins, 2008',
				fields: [
					{
						key: 'Lectures',
						value: 'Audio'
					}
				],
				icon: 'books/book_audio.jpg'
			},
			{
				title: 'Essential Mathematics for Games and Interactive Applications',
				subTitle: 'Van Verth, 2008',
				fields: [
					{
						key: 'Lectures',
						value: 'Space, Physics'
					}
				],
				icon: 'books/book_math_for_games.jpg'
			},
			{
				title: 'Procedural Generation in Game Design ',
				subTitle: 'Tayna Short, Tarn Adams, 2017',
				fields: [
					{
						key: 'Lectures',
						value: 'Space, Physics, Design'
					}
				],
				icon: 'books/book_procedural_generation.jpg'
			},
			{
				title: 'Game Physics Engine Development',
				subTitle: 'Ian Millington, 2010',
				fields: [
					{
						key: 'Lectures',
						value: 'Physics'
					}
				],
				icon: 'books/book_physics.jpg'
			},
			{
				title: 'Programming Game AI by Example',
				subTitle: 'Mat Buckland, 2005',
				fields: [
					{
						key: 'Lectures',
						value: 'Game AI'
					}
				],
				icon: 'books/book_ai_by_example.jpg'
			},
			{
				title: 'Artificial Intelligence: A Modern Approach (4th ed.)',
				subTitle: 'Stuart Russell, 2020',
				fields: [
					{
						key: 'Lectures',
						value: 'Game AI'
					}
				],
				icon: 'books/book_ai_modern_approach.jpg'
			},
			{
				title: 'Multiplayer Game Programming',
				subTitle: 'Joshua Glazer, 2015',
				fields: [
					{
						key: 'Lectures',
						value: 'Multiplayer'
					}
				],
				icon: 'books/book_multiplayer.jpg'
			},
			{
				title: 'Level Up! The Guide to Great Video Game Design',
				subTitle: 'Scott Rogers, 2014',
				fields: [
					{
						key: 'Lectures',
						value: 'Design'
					}
				],
				icon: 'books/book_levelup.jpg'
			},
			{
				title: 'Theory of Fun for Game Design',
				subTitle: 'Raph Koster, 2004',
				fields: [
					{
						key: 'Lectures',
						value: 'Design'
					}
				],
				icon: 'books/book_theory_of_fun.jpg'
			},
			{
				title: 'Games, Design and Play: A detailed approach to iterative game design',
				subTitle: 'Colleen Macklin, 2016',
				fields: [
					{
						key: 'Lectures',
						value: 'Games, Design'
					}
				],
				icon: 'books/book_games.jpg'
			}
		]
	}
]
