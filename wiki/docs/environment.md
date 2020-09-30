---
title: Environment

---

import styles from '@site/src/css/docs.module.scss';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Project structure

```
project
│
└───examples                // coding examples
│   │   assets              // assets that are copied into build folder
│   │   src                 // source files
│   │   view                // PUG templates that are bundled by Parcel
│   
└───scripts                 // scripts for pre-build, post-build, deployment etc.
│
└───slides                  // RevealJS-powered slides
│   │   assets              // assets (images, svg files, code snippets)
│   │   backgrounds         // background files for presentations
│   │   plugins             // RevealJS plugins
│   │   themes              // RevealJS themes (including APH theme for slides)
│   │   view                // PUG templates with all texts and declarations
│
└───wiki                    // docusaurus-powered wiki
│   │   blog                // place for a blog... not used right now
│   │   docs                // markdown documents with instructions, tutorials, guides etc.
│   │   plugins             // some plugins
│   │   src                 // React sources with custom components and themes
│   │   static              // static files (slides and examples are copied into this folder) 
│   │   types               // additional Typescript declarations
│
│   CHANGELOG.md            // changelog
│   package.json            // npm scripts and dependencies
│   README.md               // README file
│   tsconfig.json           // typescript config (only for pre-build)
│   tslint.json             // typescript linter settings for static checking
```

## Parcel
- [parcelJS](https://parceljs.org/) is a simple bundler that requires minimum configuration (alternative to webpack)
- great for prototyping, especially for PixiJS, as we only need a single canvas element and the rest will be stored in scripts
- **how it works**
  - you have a HTML file
  - this file is referencing other files, such as JavaScript files, TypeScript files, SASS styles, LESS,...
  - Parcel tries to process all referenced files and find appropriate parsers for each
  - for instance, TypeScript files need to be compiled into JavaScript, SASS has to be transformed into CSS
  - once everything is completed, Parcel will create **another** file in the output directory (e.g. `build_examples`) where it will store all processed files, appending hash strings to their filenames
  - this directory can be treated as a static webpage

<div className={styles.figure}>
    <img src={useBaseUrl('img/docs/environment.svg')} />
</div>

## Basic setup

- install [nodejs](https://nodejs.org/en/download/)
- go to the root directory of this project
- install all dependencies: `npm install`
- run the dev-server: `npm run dev-examples`
  - go to `localhost:1234/index.html` - you should see a simple dashboard
  - navigate to one of the examples
  - if you are using **Visual Studio Code**, don't forget to install `Debugger for Chrome`
  - go to `localhost:1234/01_sprite.html` - you should see a rotating sprite. Try out your debugger by setting a breakpoint in `examples/src/01-helloworld/sprite.ts`
  - try to change a few lines of code and save your changes. `Parcel` should re-compile and reset the page
- if you want to build the slides, run `npm run dev-slides` and navigate to `localhost:1234/index.html`
- if you want to build the wiki:
  - go to wiki folder
  - execute `npm install`
  - execute `npm start` and navigate to `localhost:3000`
- if you want to build everything
  - execute `npm run deploy-all` from the root folder. Everything gets bundled into `build_wiki` 


## Deployment

- every week, the current version goes public in [aph.dodo.me](https://aph.dodo.me)

