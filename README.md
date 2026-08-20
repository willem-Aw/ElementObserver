# ElementObserver

`ElementObserver` est un utilitaire JavaScript léger et sans dépendance qui
observe des éléments du DOM avec l'API native `IntersectionObserver`. Il
déclenche des animations CSS lorsque les éléments entrent dans la fenêtre
visible, et peut également les masquer lorsqu'ils en sortent.

## Fichiers

- [ElementObserver.js](ElementObserver.js) : classe JavaScript principale.
- [element-observer-animations.css](element-observer-animations.css) :
  animations CSS prêtes à l'emploi.

## Installation

Copiez les deux fichiers dans votre projet, puis importez-les depuis votre
point d'entrée JavaScript et votre feuille de style :

```javascript
import ElementObserver from './ElementObserver.js';
import './element-observer-animations.css';
```

Avec des balises HTML classiques, utilisez un module JavaScript :

```html
<link rel="stylesheet" href="./element-observer-animations.css">
<script type="module" src="./main.js"></script>
```

## Cas d'utilisation

### Animation d'éléments au défilement

Ajoutez une classe commune aux éléments à animer :

```html
<section class="anim">Premier contenu</section>
<section class="anim">Deuxième contenu</section>
<section class="anim">Troisième contenu</section>
```

Initialisez ensuite l'observateur :

```javascript
import ElementObserver from './ElementObserver.js';

new ElementObserver('.anim', {
  direction: 'up',        // up|down|left|right|zoomin|zoominout|zoomout
  once: true,             // true = observe une seule fois puis unobserve
  rootMargin: '0px 0px -10% 0px',
  threshold: 0.15,
  root: null
});
```

La feuille de style fournie utilise les attributs ajoutés automatiquement par
la classe :

- `data-anim-direction` indique la direction choisie.
- `data-anim-visible="true"` est ajouté lorsque l'élément devient visible.
- La classe `is-visible` est ajoutée au même moment.

### Répéter l'animation à chaque entrée

Pour révéler et masquer les éléments à chaque passage dans la fenêtre visible,
utilisez `once: false` :

```javascript
new ElementObserver('.anim-repeat', {
  direction: 'zoominout',
  once: false,
  threshold: 0.25
});
```

### Observer des éléments ajoutés dynamiquement

La méthode `observeMore` permet d'ajouter des éléments après l'initialisation,
par exemple après une requête AJAX :

```javascript
const observer = new ElementObserver('.anim', { direction: 'left' });

// Après l'injection de nouveau contenu dans le DOM :
observer.observeMore('.nouveaux-elements');
```

## Options

Toutes les options sont facultatives. Lorsqu'une option vaut `undefined`, sa
valeur par défaut est conservée.

| Option | Type | Valeur par défaut | Description |
| --- | --- | --- | --- |
| `direction` | `string` | `'up'` | Direction : `up`, `down`, `left`, `right`, `zoomin`, `zoominout` ou `zoomout`. |
| `once` | `boolean` | `true` | Si `true`, cesse d'observer l'élément après sa première apparition. Si `false`, l'état est réinitialisé lorsqu'il sort de la fenêtre. |
| `rootMargin` | `string` | `'0px 0px -10% 0px'` | Marge appliquée à la zone d'intersection. |
| `threshold` | `number\|number[]` | `0.15` | Pourcentage de visibilité nécessaire pour déclencher l'observation. |
| `root` | `Element\|null` | `null` | Élément racine utilisé pour l'intersection. `null` correspond à la fenêtre visible. |

## API

- `observeMore(selector)` ajoute des éléments à l'observation.
- `reveal(element)` révèle immédiatement un élément.
- `destroy()` arrête l'observation et libère les références conservées.
- `elements` retourne une copie des éléments actuellement enregistrés.
- `options` retourne une copie des options effectives.

## Accessibilité et compatibilité

La feuille CSS fournie respecte la préférence système
`prefers-reduced-motion: reduce` en désactivant les animations et en révélant
immédiatement les éléments.

`ElementObserver` dépend de l'API native `IntersectionObserver`, disponible
dans les versions récentes de Chrome, Firefox, Edge et Safari. Pour prendre en
charge des navigateurs plus anciens, ajoutez un polyfill
`IntersectionObserver` adapté à votre projet.

Si `IntersectionObserver` n'est pas disponible, tous les éléments sont
révélés immédiatement.

## Développement

Le projet ne contient ni dépendance ni script de compilation. Ouvrez les
fichiers dans votre éditeur et intégrez-les directement dans votre projet.

## Licence

Aucun fichier de licence n'est fourni dans ce dépôt. Ajoutez une licence
adaptée à votre projet si nécessaire.
