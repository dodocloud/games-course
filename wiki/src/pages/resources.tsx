import clsx from 'clsx'
import DocusaurusHead from '@docusaurus/Head'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React from 'react'

import Layout from '@theme/Layout'
import { MetadataContextProvider } from '@theme/useMetadataContext'

import { resourceSection, resourcesData } from '../internals/resources-data'

import sectionStyles from '../css/section.module.scss'
import resourceStyles from '../css/resources.module.scss'

const Resources = () => {
	return (
		<>{
			resourcesData.map((resourceSection: resourceSection) => {
				return (
					<section
						key={`resources_${resourceSection.name}`}
						className={clsx(sectionStyles.section)}
					>
						<h3
							className={clsx(sectionStyles.section__title, resourceStyles.resources__title, 'text--center')}
						>
							{resourceSection.name}
						</h3>
						{
							resourceSection.resources.map((resource, idx) => {
								return (
									<div key={`${resourceSection.name}_${idx}`} className={resourceStyles['slides--group']}>
										<div className={resourceStyles.resources__group}>
											<div className={resourceStyles.resource__container}>
												<div className={resourceStyles.content}>
													<h3>{resource.title}</h3>
													{resource.subTitle && <h4>{resource.subTitle}</h4>}
													{resource.description && <p>{resource.description}</p>}
													{resource.fields &&
													<div className={resourceStyles.fields}>
														{resource.fields.map((field, idx) => {
															return (
																<div key={`field_${idx}`} className={resourceStyles.field}>
																	<div>{field.key}:</div>
																	<div>{field.value}</div>
																</div>
															)
														})}
													</div>
													}
												</div>
												<div className={resourceStyles.icon}>
													<img src={`/img/pages/resources/${resource.icon}`} />
												</div>
											</div>
										</div>
									</div>
								)
							})
						}
					</section>
				)
			})
		}
		</>
	)
}

const ResourcesPage = () => {
	const { siteConfig } = useDocusaurusContext()
	const title = 'APH'

	return (
		<MetadataContextProvider>
			<Layout description={siteConfig.customFields.description} title={title}>
				<DocusaurusHead>
					<link rel="canonical" href={siteConfig.url} />
				</DocusaurusHead>
				<Resources />
			</Layout>
		</MetadataContextProvider>
	)
}

export default ResourcesPage
