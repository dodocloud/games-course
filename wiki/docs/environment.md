
---
title: Environment

---

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


## Basic setup

- install [nodejs](https://nodejs.org/en/download/)
- go to the root directory of this project
- install all dependencies: `npm install`
- run the dev-server: `npm run dev-examples`
- go to `localhost:1234/index.html` - you should see a simple dashboard
- navigate to one of the examples
- if you are using **Visual Studio Code**, don't forget to install `Debugger for Chrome`
- go to `localhost:1234/example-sprite.html` - you should see a rotating sprite. Try out your debugger by setting a breakpoint in `examples/src/example-sprite.ts`
- try to change a few lines of code and save your changes. `Parcel` should re-compile and reset the page


## Deployment

- every week, this project is published to [aph.dodo.me] (https://aph.dodo.me)

