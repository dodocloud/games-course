import clsx from 'clsx'
import DocusaurusHead from '@docusaurus/Head'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import React from 'react'

import Layout from '@theme/Layout'
import { MetadataContextProvider } from '@theme/useMetadataContext'

import featureStyles from '../css/feature.module.css'
import sectionStyles from '../css/section.module.css'
import titleStyles from '../css/title.module.css'
import slidesStyles from '../css/slides.module.css'

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
	return (
		<section
			className={clsx(sectionStyles.section)}
		>
			<h3
				className={clsx(sectionStyles.section__title, slidesStyles.slides__title, 'text--center')}
			>
				Lectures
			</h3>
			<div className={slidesStyles.slides__group}>
				<div className={slidesStyles.input_container}>
					<a className={slidesStyles.link_button} id="lecture00" href="/slides/organization.html" />
					<div className={slidesStyles.link_tile}>
						<a className={slidesStyles.inner_container} href="/slides/organization.html?print-pdf">
							<img className={slidesStyles.print} src="/img/pages/index/ic_print.svg" />
						</a>
						<div className={slidesStyles.inner_hint}>Lecture 0</div>
						<div className={slidesStyles.icon}>
							<img src="/img/pages/index/ic_organization.svg" />
						</div>
						<label className={slidesStyles.link_tile_label} htmlFor="lecture01">Organization</label>
					</div>
				</div>
			</div>
			<div className={sectionStyles['section--inner']}>
				<div className={slidesStyles.slides__group}>
					<div className={slidesStyles.input_container}>
						<a className={slidesStyles.link_button} id="lecture01" href="/slides/lecture01.html" />
						<div className={slidesStyles.link_tile}>
							<a className={slidesStyles.inner_container} href="/slides/lecture01.html?print-pdf">
								<img className={slidesStyles.print} src="/img/pages/index/ic_print.svg" />
							</a>
							<div className={slidesStyles.inner_hint}>Lecture 01</div>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lecture01.svg" />
							</div>
							<label className={slidesStyles.link_tile_label} htmlFor="lecture01">Games</label>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
					<div className={slidesStyles.input_container}>
						<div className={slidesStyles.link_tile}>
							<div className={slidesStyles.icon}>
								<img src="/img/pages/index/ic_lock.svg" />
							</div>
						</div>
					</div>
				</div>
			</div>
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
					Improved ECSA support library
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
