import clsx from 'clsx'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React from 'react'

import useMetadataContext from '@theme/useMetadataContext'

import sectionStyles from '../../css/section.module.scss'
import footerStyles from './styles.module.scss'

const Footer = () => {
	const { siteConfig } = useDocusaurusContext()
	const metadataContext = useMetadataContext()

	return (
		<footer
			className={clsx(footerStyles.footer, sectionStyles.section, {
				[footerStyles['footer--alt']]: metadataContext.altFooter === true
			})}
		>
			<div className={footerStyles.footer__bottom}>
				<p className={footerStyles.footer__copyright}>
					{siteConfig.customFields.copyright},&nbsp;<a href="mailto:vesecky.adam@gmail.com">vesecky.adam@gmail.com</a>
				</p>
			</div>
		</footer>
	)
}

export default Footer
