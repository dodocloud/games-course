---
title: Course requirements

---

- **demonstrate some degree of effort in your project**
- **prove that you have learned something**
- **have fun**

## Total evaluation
- will be collected on [grades.fit.cvut.cz](https://grades.fit.cvut.cz/)
- 100 points, 70 for the project, 30 for the exam
- to pass, you need to get:
  - 35 points from your project
  - 15 points from the exam
  - 50 points in total

## Project rules
- you can work as an individual or as a group of two (in such a case, however, the complexity of the work should look like so)
- **implement a simple web game**
- if you haven't worked with any game engine yet, **it's recommended to choose PixiJS library**, since it will be provided with many examples and minigames
  - yet, you can use any game engine you like
- the game will be deployed as a **web application** (you can either use gitlab CI/CD or any service of your choosing)
- **the topic is solely up to you**, yet it must be approved by the lecturer
- the game, especially the implementation of its mechanics, must be your own contribution. If you use any 3rd party libraries, tools, assets, or any existing minigames as a template project, it must be documented in the readme
- game assets, such as images and sounds, should have **Public Domain** license or any other license that makes the assets freely available
- pay your utmost attention to the technical solution, **clean code** and polished gameplay
- the deadline is set at **10.1.2021**

### Evaluation
- in order to receive maximum points, you must prove that **some effortful work went into your solution and you analyzed well the mechanics you implemented** 
- the only mandatory part is the Component Architecture
  - implement your game using ECS pattern (or any other specific pattern if the library/engine you chose supports it)
  - requirements: functional behavior of the game is divided into components that communicate primarily via messaging pattern
- it is better to submit a very simple yet polished and completed game than an ambicious somehow-working prototype
- some mechanics you may choose from:
  - interesting AI
  - advanced pathfinding
  - dialogue tree for event-based adventure game
  - particle systems
  - advanced steering behaviors
  - adaptive audio
  - advanced randomness (Perlin Noise)
  - looting table
  - physics engine (simple collision detector and resolver)

### How to start
- analyse a few existing games
- pick up some interesting mechanics
- choose one mechanic that will be the most challenging one from technical perspective
- make up or download very simple assets (dots, squares, circles)
- start prototyping
- bring your gaming mechanics to perfection
- polish your game (better assets, better HUD,...)
- prepare your game for submitting (add readme, diagrams, refactor your code a bit,...)

### Project description
- submit until 8.10.
- content: your team, engine/library of your choosing, list of game mechanics

**Example:**
- Genre: Platformer
- Library: PixiJS
- Space: 2D world, sidescroller, grid environment, 2 maps to choose from
- Objects: animated player, enemies, power-ups, weapons, platforms
- Actions
  - running, jumping over platforms, picking up power-ups, killing enemies, switching weapons
- Rules
  - player has got 2 weapons: a laser and a rifle. The laser affects the target instantly, the rifle shoots projectiles at a given speed
  - enemies spawn randomly
  - there is no exit. The goal is to survive as long as possible.
  - power-ups are falling from above. They add damage boost and extra speed to the player
- Technical mechanic
  - AI behavior - enemies will jump over platforms, chasing the player, capable of avoiding projectiles


### Instructions for submitting
- create your own repository under your username. The name should be NI-APH `gitlab.fit.cvut.cz/<username>/NI-APH`
- assign access permission to the lecturer (loginname svecadam)
- if you choose to use PixiJS or ThreeJS library for your work:
  - fork this repo to your own project
  - execute script `npm run clean-repo`, this will remove all materials, slides and other things not related to coding
  - remove all unnecessary dependencies from `package.json`
  - execute `npm run dev`
  - go to `localhost:1234`, you should see the skeleton project
  - skeleton is located in `src/my-game`, loaded from `view/index.html`
  - happy working
- your repository must contain ONLY your game and documentation in the README (or any other files that are linked from the readme)
- readme should contain following information:
  - where the game is deployed
  - how to make the game install and run
  - **diagram of the game architecture**
  - short description and manual, if necessary

### Milestones
- **until 8.10**, prepare the description of your project:
  - your team (if you are gonna work as an individual or in a group of two)
  - list of game mechanics  (space, objects, action, rules)
  - library/game engine you chose
  - send it all to the lecturer either via e-mail or in the MSTeams chat
- **on 26.11 and 3.12** for each group respectively:
  - every team/individual will present their progress during the lab
- **until ~~5.1.~~ 10.1. 2021**
  - finish and submit your project
- **after ~~5.1.~~ 10.1. 2021**
  - schedule a meeting with the lecturer for the final evaluation and the oral exam

| Date | Description |
| ------ | ------ | 
| 8.10. | List of mechanics for approval |
| 26.11 / 3.12 | Presentation of the progress |
| ~~5.1.~~ 10.1. | Deadline | 
| January | Evaluation + exam |

## Exam requirements
- just oral part, **30 points** in total
- 3 questions from topics that are marked with orange and red bulb in the slides
- **in order to pass, you must receive 15 points from the exam and 50 points in total**

## Evaluation table
- according to the Study and Examination Rules for Students of CTU 

| Grade | Range | Meaning |
| ------ | ------ | ------ |
| A | 90+ | excellent |
| B | 80-89 | very good |
| C | 70-79 | good |
| D | 60-69 | fine |
| E | 50-59 | satisfactory |
| F | 0-49 | unsatisfactory |