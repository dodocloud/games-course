import clsx from 'clsx'
import DocusaurusHead from '@docusaurus/Head'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React from 'react'

import Layout from '@theme/Layout'
import { MetadataContextProvider } from '@theme/useMetadataContext'

import { slidesData, slide } from '../internals/pages-data'

import featureStyles from '../css/feature.module.scss'
import sectionStyles from '../css/section.module.scss'
import titleStyles from '../css/title.module.scss'
import slidesStyles from '../css/slides.module.scss'

const Title = () => {
	return (
		<section
			className={clsx(sectionStyles.section)}
		>
			<div className={sectionStyles['section--inner']}>
				<div className={titleStyles.title}>
					<div className={titleStyles.title__title}>
						<h2>Architecture of Computer Games</h2>
						<h3>Materials for lectures</h3>
					</div>
					<div className={titleStyles.title__logo}>
						<img src="/img/pages/index/logo.svg" />
					</div>
				</div>
			</div>
		</section>
	)
}

const Slides = () => {
	const groupedSlides = slidesData.reduce(
		(entryMap, e) => entryMap.set(e.group, [...entryMap.get(e.group) || [], e]),
		new Map<number, slide[]>()
	)

	return (
		<section
			className={clsx(sectionStyles.section)}
		>
			<h3
				className={clsx(sectionStyles.section__title, slidesStyles.slides__title, 'text--center')}
			>
				Lectures
			</h3>
			{
				Array.from(groupedSlides.keys()).map(groupId => {
					return (
						<div key={`inner_${groupId}`} className={slidesStyles['slides--group']}>
							<div className={slidesStyles.slides__group}>
								{
									groupedSlides.get(groupId)?.map(slide => {
										return (
											<div key={`${groupId}_${slide.id}`} className={slidesStyles.input_container}>
												{slide.desc &&
													<>
														<a className={slidesStyles.link_button} id={slide.id} href={`/slides/${slide.id}.html`} />
														<div className={slidesStyles.link_tile}>
															<a className={slidesStyles.inner_container} href={`/slides/${slide.id}.html?print-pdf`}>
																<img src="/img/pages/index/ic_print.svg" />
															</a>
															<a className={slidesStyles.inner_container} href={`/slides/${slide.id}.html?presentation`}>
																<img src="/img/pages/index/ic_presentation.svg" />
															</a>
															<div className={slidesStyles.inner_hint}>{slide.hint}</div>
															<div className={slidesStyles.icon}>
																<img src={`/img/pages/index/ic_${slide.id}.svg`} />
															</div>
															<label className={slidesStyles.link_tile_label} htmlFor={slide.id}>{slide.desc}</label>
														</div>
													</>
												}
												{!slide.desc &&
													<div className={slidesStyles.link_tile}>
														<div className={slidesStyles.icon}>
															<img src="/img/pages/index/ic_lock.svg" />
															<p className={slidesStyles.link_date}>{slide.date}</p>
														</div>
													</div>
												}
											</div>
										)
									})
								}
							</div>
						</div>
					)
				})
			}
		</section>
	)
}

const Feature = () => (
	<section
		className={clsx(sectionStyles.section, sectionStyles['section--odd'])}
	>
		<div className={sectionStyles['section--inner']}>
			<div className={featureStyles.feature}>
				<img
					className={featureStyles.feature__illustration}
					src="/img/pages/index/new_design.svg"
				/>

				<h2 className={featureStyles.feature__title}>New design</h2>

				<p className={featureStyles.feature__description}>
					New color palette
				</p>
				<p className={featureStyles.feature__description}>
					New diagrams
				</p>
				<p className={featureStyles.feature__description}>
					New in-slide tooltips
				</p>
				<p className={featureStyles.feature__description}>
					New dashboard
				</p>
			</div>

			<div className={featureStyles.feature}>
				<img
					className={featureStyles.feature__illustration}
					src="/img/pages/index/new_topics.svg"
				/>

				<h2 className={featureStyles.feature__title}>
					New topics
				</h2>

				<p className={featureStyles.feature__description}>
					Game Audio
				</p>
				<p className={featureStyles.feature__description}>
					Game Design
				</p>
				<p className={featureStyles.feature__description}>
					Game Assets
				</p>
				<p className={featureStyles.feature__description}>And much more...</p>
			</div>

			<div className={featureStyles.feature}>
				<img
					className={featureStyles.feature__illustration}
					src="/img/pages/index/new_examples.svg"
				/>

				<h2 className={featureStyles.feature__title}>New examples</h2>

				<p className={featureStyles.feature__description}>
					PixiJS and ThreeJS libraries
				</p>
				<p className={featureStyles.feature__description}>
					Improved ECS support library
				</p>
			</div>
		</div>
	</section>
)

const Home = () => {
	const { siteConfig } = useDocusaurusContext()
	const title = 'APH'

	return (
		<MetadataContextProvider>
			<Layout description={siteConfig.customFields.description} title={title}>
				<DocusaurusHead>
					<link rel="canonical" href={siteConfig.url} />
				</DocusaurusHead>
				<Title />
				<Feature />
				<Slides />
			</Layout>
		</MetadataContextProvider>
	)
}

export default Home
