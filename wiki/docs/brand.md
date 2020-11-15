---
title: Brand

---

import styles from '@site/src/css/docs.module.scss';
import clsx from 'clsx';
import useBaseUrl from '@docusaurus/useBaseUrl';

## Visual language

The visual language of NI-APH courses has made a long way since 2017 when it took place for the first time. 

<div className={styles.oldaph}>
    <div>
        <img src={useBaseUrl('img/docs/brand/aph_2017.png')} />
        <span>APH 2017</span>
    </div>
    <div>
        <img src={useBaseUrl('img/docs/brand/aph_2018.png')} />
        <span>APH 2018</span>
    </div>
    <div>
        <img src={useBaseUrl('img/docs/brand/aph_2019.png')} />
        <span>APH 2019</span>
    </div>
</div>


<div className={styles.figure}>
        <img src={useBaseUrl('img/docs/brand/aph_2020.png')} />
        <span>APH 2020</span>
</div>

In 2017, the design consisted of a simple logo made of **APH** letters and a striped effect over all images.
2018 brought several changes to the design - slides were readjusted from 4:3 to 16:9 ratio, colors were selected with more care and the striped effect was smoothened.
In 2019, all slides were rewritten from PowerPoint into HTML which introduced new opportunities - interactive content, CSS animations and themes. The logo could benefit from a new look, 
yet it still contained letters from the Czech title "Architektura Počítačových Her", which wasn't very convenient for a symbol. Moreover, slides were wrapped in fancy colored frames and 
titles were animated with a slight touch of chromatic aberration. Along with tech-like shiny backgrounds, the concept itself looked cool, but it couldn't do much justice the topic as a whole. Furthermore, these eye-candies found themselves distracting when one needed to study the content.

Ultimately, in 2020, a full-fledged brand template was introduced - color palette, a logo that has a good ring to the course itself, and unique visuals, including a grid-like pattern for the slides, suggesting
graph paper for architectural sketches. All fancy animations from 2019 have receded in a blaze of simplicity and minimalism.

## Logo

The APH logo is a graphic representation of the subject and the primary graphic element of its identity. The symbol is represented by a stylized microchip with joypad buttons on its surface - directional buttons on the left,
ABXY buttons on the right, rotated by 90 degrees counter-clockwise, and tiny start and select buttons in the middle. The yellow Y button is cut out from the left, at angle of 90 degrees, which turns the button into a silhouette
of Pac-Man, heading into two tiny buttons in the middle, indicating pac-dots.

The logo represents Architecture of Computer Games, where Pac-Man points out that the content is not solely technical.

<div className={styles.figure}>
        <img src={useBaseUrl('img/docs/brand/logo_measured.svg')} />
        <span>APH logo design</span>
</div>

<div className={styles.figure}>
        <img src={useBaseUrl('img/docs/brand/logo_colored.svg')} />
        <span>APH colored logo</span>
</div>


### Symbol

The symbol is represented by ABXY buttons that appear on the right side of the logo. It is a detachable part of the logo and can be used in specific cases, such as favicons.

<div className={styles.figure}>
        <img src={useBaseUrl('img/docs/brand/logo_detached.svg')} />
        <span>APH symbol</span>
</div>


### Logo Variations

Buttons can have the same color as the joypad (yet Pac-Man must be brighter than the rest), and the cover can be removed.
In case of a solid dark background, logo can be used without the cover. If the background has other distracting elements that could interfere with the readability of the logo, the default version should be used instead.

<div className={styles.oldaph}>
    <div>
        <img src={useBaseUrl('img/docs/brand/logo_colored.svg')} />
        <span>Default</span>
    </div>
    <div>
        <img src={useBaseUrl('img/docs/brand/logo_blackwhite.svg')} />
        <span>Black and White</span>
    </div>
    <div>
        <img src={useBaseUrl('img/docs/brand/logo_nocover.svg')} />
        <span>Without cover</span>
    </div>
</div>



## Colors

APH palette is bright and consists of several colors that helps the course to be unique, modern and cheerful.

### Primary colors

- primary colors are **lemon yellow**, **emerald green**, **royal blue**, and **tomato red**
- these colors are to be used mainly for highlighting
- lemon yellow represents Pac-Man, the first game that introduced a character
- emerald green represents grass of open worlds worthy exploration from Zelda and Pokémon séries
- royal blue is a color of sky from the very first Super Mario game
- tomato red suggests lava from NES games, chambers of hell from Doom and desert plains from the first game of Dune

<div className={styles.colors}>
    <div>
        <div className={clsx(styles["bgr-lemon"], styles["color-rhino-80"])}>#E9E56F</div>
        <span>Lemon</span>
    </div>
    <div>
        <div className={styles["bgr-emerald"]}>#47D58A</div>
        <span>Emerald</span>
    </div>
    <div>
        <div className={styles["bgr-royal"]}>#6F8CE9</div>
        <span>Royal</span>
    </div>
    <div>
        <div className={styles["bgr-tomato"]}>#CF2F25</div>
        <span>Tomato</span>
    </div>
</div>

### Secondary colors

- secondary colors extend the pallete by modest manhattan color, distinctive and brightful aqua color, and pleasant matte azure

<div className={clsx(styles.colors, styles.smaller)}>
    <div>
        <div className={clsx(styles["bgr-manhattan"], styles["color-rhino-80"])}>#F6C9A0</div>
        <span>Manhattan</span>
    </div>
    <div>
        <div className={styles["bgr-aqua"]}>#6F8CE9</div>
        <span>Aqua</span>
    </div>
    <div>
        <div className={styles["bgr-azure"]}>#CF2F25</div>
        <span>Azure</span>
    </div>
</div>

### Light and dark shades

- every primary and secondary color has got their own light and dark variant

<div className={clsx(styles.colors, styles.smaller)}>
    <div>
        <div className={clsx(styles["bgr-tomato-light"], styles["color-rhino-90"])}>#FF867F</div>
        <span>Tomato Light</span>
    </div>
    <div>
        <div className={styles["bgr-tomato"]}>#CF2F25</div>
        <span>Tomato</span>
    </div>
    <div>
        <div className={styles["bgr-tomato-dark"]}>#7D0600</div>
        <span>Tomato Dark</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-manhattan-light"], styles["color-rhino-90"])}>#FFF2E6</div>
        <span>Manhattan Light</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-manhattan"], styles["color-rhino-60"])}>#F6C9A0</div>
        <span>Manhattan</span>
    </div>
    <div>
        <div className={styles["bgr-manhattan-dark"]}>#A56B36</div>
        <span>Manhattan Dark</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-goldenrod-light"], styles["color-rhino-90"])}>#FFD179</div>
        <span>Goldenrod Light</span>
    </div>
    <div>
        <div className={styles["bgr-goldenrod"]}>#FBB227</div>
        <span>Goldenrod</span>
    </div>
    <div>
        <div className={styles["bgr-goldenrod-dark"]}>#A96F00</div>
        <span>Goldenrod Dark</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-lemon-light"], styles["color-rhino-90"])}>#FFFDC8</div>
        <span>Lemon Light</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-lemon"], styles["color-rhino-60"])}>#E9E56F</div>
        <span>Lemon</span>
    </div>
    <div>
        <div className={styles["bgr-lemon-dark"]}>#A19D22</div>
        <span>Lemon Dark</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-emerald-light"], styles["color-rhino-90"])}>#A0F1C6</div>
        <span>Emerald Light</span>
    </div>
    <div>
        <div className={styles["bgr-emerald"]}>#47D58A</div>
        <span>Emerald</span>
    </div>
    <div>
        <div className={styles["bgr-emerald-dark"]}>#009244</div>
        <span>Emerald Dark</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-aqua-light"], styles["color-rhino-90"])}>#86ECEC</div>
        <span>Aqua Light</span>
    </div>
    <div>
        <div className={styles["bgr-aqua"]}>#30D2D5</div>
        <span>Aqua</span>
    </div>
    <div>
        <div className={styles["bgr-aqua-dark"]}>#00A0A0</div>
        <span>Aqua Dark</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-azure-light"], styles["color-rhino-90"])}>#7893EA</div>
        <span>Azure Light</span>
    </div>
    <div>
        <div className={styles["bgr-azure"]}>#2C57DF</div>
        <span>Azure</span>
    </div>
    <div>
        <div className={styles["bgr-azure-dark"]}>#0A2C9D</div>
        <span>Azure Dark</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-royal-light"], styles["color-rhino-90"])}>#C9D4FB</div>
        <span>Royal Light</span>
    </div>
    <div>
        <div className={styles["bgr-royal"]}>#6F8CE9</div>
        <span>Royal</span>
    </div>
    <div>
        <div className={styles["bgr-royal-dark"]}>#4D6FDC</div>
        <span>Royal Dark</span>
    </div>
</div>


### Contrasting colors

- midnight should only be used for backgrounds
- white color is a text color for labels. Default text color is Rhino 20

<div className={clsx(styles.colors)}>
    <div>
        <div className={styles["bgr-midnight-dark"]}>#03060C</div>
        <span>Midnight dark</span>
    </div>
    <div>
        <div className={styles["bgr-midnight"]}>#121824</div>
        <span>Midnight</span>
    </div>
    <div>
        <div className={styles["bgr-midnight-light"]}>#3A414E</div>
        <span>Midnight light</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-white"], styles["color-rhino-100"])}>#FFFFFF</div>
        <span>White</span>
    </div>
</div>


### Shades of Grey

- shades of Rhino color are used to differentiate between layouts and shapes

<div className={styles.colors}>
    <div>
        <div className={styles["bgr-rhino-100"]}>#1D232D</div>
        <span>Rhino-100</span>
    </div>
    <div>
        <div className={styles["bgr-rhino-90"]}>#2F3744</div>
        <span>Rhino-90</span>
    </div>
    <div>
        <div className={styles["bgr-rhino-80"]}>#535E70</div>
        <span>Rhino-80</span>
    </div>
    <div>
        <div className={styles["bgr-rhino-60"]}>#7B8694</div>
        <span>Rhino-60</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-rhino-40"], styles["color-rhino-80"])}>#A6AEB8</div>
        <span>Rhino-40</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-rhino-20"], styles["color-rhino-80"])}>#D2D6DC</div>
        <span>Rhino-20</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-rhino-10"], styles["color-rhino-60"])}>#E8EAEC</div>
        <span>Rhino-10</span>
    </div>
    <div>
        <div className={clsx(styles["bgr-rhino-5"], styles["color-rhino-60"])}>#F3F4F5</div>
        <span>Rhino-5</span>
    </div>
</div>


## Typography

Typography is crucial for the content. It must be simple, sleek and easy to read, as the content is intended mainly for education.

### Serif font

Primary font is **Source Sans Pro**. This font is used for written content, as well as some diagrams. Its light version slightly takes after OCR-B font, developed in 1968 for technical documentation.

<img src={useBaseUrl('img/docs/brand/font_sourcesans.svg')} />

### Monospace Font

Monospace font is **Inconsolata** and should only be used in code snippets and inside diagrams, in cases where serif font seems to be inappropriate.

<img src={useBaseUrl('img/docs/brand/font_inconsolata.svg')} />

### IBM VGA Font

PxPlus IBM VGA8 is an old bitmap font for IBM PC. Despite its very good readability, it's only intended for special cases, such as Commander Keen's tooltips and ancient code snippets where 
it can differentiate the content from other examples.

<img src={useBaseUrl('img/docs/brand/font_ibm.svg')} />

## Diagrams

Diagrams combine UML components and sci-fi HUD elements. Preferred color is **emerald**. Other colors should only be used to highlight respective parts.

<img src={useBaseUrl('img/docs/brand/diagrams.svg')} />

## Code Snippets

Source code is parsed by **prismJS**. Primary colors are **emerald**, **royal** and **tomato light**.

```javascript
function createIterator(array) {
    let currIdx = 0
    return {
        next() {
            return currIdx < array.lenth ? {
                value: array[currIdx++], done: false,
            } : { done: true }
        },
    }
}
```

## Slides

All slides are wrapped in a round frame of a grid-like pattern, suggesting architectonical graph paper. 
The frame is semi-transparent and the background may display any picture that is relevant to the content.

<img src={useBaseUrl('img/docs/brand/slides.jpg')} />
