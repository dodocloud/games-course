// src/App.js
import React from 'react'

type APHCanvasProps = {
	name: string,
}

let examplesObj: NodeRequire

class APHCanvasRenderer extends React.Component<APHCanvasProps> {
	constructor (props) {
		super(props)
		this.myRef = React.createRef()

		if (!examplesObj) {
			(window as any).BASE_URL = '../../../examples';
			(window as any).parcelRequire = null
			examplesObj = require('@site/static/examples/examples.js')
		}
	}

	componentDidMount () {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.aphExample = new (window as any).APH[this.props.name]({ ...this.props })
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.aphExample.init(this.myRef.current)
	}

	componentWillUnmount () {
		if (this.aphExample) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			this.aphExample.destroy()
		}
	}

	aphExample: any;
	myRef: any

	render () {
		return <canvas ref={this.myRef} width={800} height={600} />
	}
}

export default (props) => {
	if (typeof (window) !== 'undefined') {
		return <APHCanvasRenderer {...props} />
	} else {
		return null
	}
}
