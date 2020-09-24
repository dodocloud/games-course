let guidelines;

/*
if (process.env.NODE_ENV === 'development') {
	 guidelines = {
		label: 'Guidelines (DEV ONLY)',
		type: 'category',
		items: [
			'guidelines/lexicon',
			'guidelines/markdown',
		]
	}
}*/


module.exports = {
	docs: [
		guidelines,
		{
			id: 'seminars',
			type: 'doc'
		},
		{
			id: 'environment',
			type: 'doc'
		},
		{
			id: 'requirements',
			type: 'doc'
		},
		{
			label: 'Tutorials',
			type: 'category',
			items: ['tutorials/typescript']
		}
	].filter(Boolean)
}
