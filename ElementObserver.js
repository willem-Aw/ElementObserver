/**
 * ElementObserver
 * ----------------
 * Observe un ensemble d'éléments via IntersectionObserver et pilote
 * des animations d'entrée via des attributs data-*.
 *
 * @example
 * import ElementObserver from './ElementObserver.js';
 *
 * new ElementObserver('.anim', {
 *   direction  : 'up',        // up|down|left|right|zoomin|zoominout|zoomout
 *   once       : true,        // true = observe une seule fois puis unobserve
 *   rootMargin : '0px 0px -10% 0px',
 *   threshold  : 0.15,
 *   root       : null
 * });
 *
 * Toutes les options sont facultatives : si une valeur n'est pas fournie
 * (ou vaut explicitement undefined), la classe applique une valeur par
 * défaut (voir ElementObserver.#DEFAULTS ci-dessous).
 *
 * Comportement :
 *   - Ajoute data-anim-direction="<direction>" sur chaque élément observé.
 *   - Ajoute data-anim-visible="true" + classe "is-visible" à l'entrée
 *     dans le viewport.
 *   - Si once=false, retire l'attribut/la classe à la sortie.
 *   - Fallback : si IntersectionObserver n'est pas supporté, tous les
 *     éléments sont révélés immédiatement.
 *
 * CSS type :
 *   [data-anim-direction] { opacity: 0; transition: opacity .6s, transform .6s; }
 *   [data-anim-direction="up"] { transform: translateY(24px); }
 *   [data-anim-direction="up"][data-anim-visible="true"] { opacity: 1; transform: none; }
 */
export default class ElementObserver {
	/**
	 * Valeurs par défaut appliquées pour toute option non fournie
	 * (ou explicitement undefined) au constructeur.
	 */
	static #DEFAULTS = {
		direction: 'up',
		once: true,
		rootMargin: '0px 0px -10% 0px',
		threshold: 0.15,
		root: null
	};

	/** @type {Element[]} */
	#elements = [];

	/** @type {IntersectionObserver|null} */
	#observer = null;

	/** @type {typeof ElementObserver.DEFAULTS} */
	#options;

	/**
	 * @param {string|Element|NodeListOf<Element>|Element[]} selector
	 * @param {Partial<{direction:string, once:boolean, rootMargin:string, threshold:number|number[], root:Element|null}>} [options]
	 */
	constructor(selector, options = {}) {
		this.#options = ElementObserver.#mergeOptions(options);
		this.#elements = ElementObserver.#resolveElements(selector);
		this.#init();
	}

	// API publique

	/**
	 * Ajoute dynamiquement des éléments à l'observation
	 * (contenu injecté en AJAX, slides clonées par Swiper, etc.).
	 * @param {string|Element|NodeListOf<Element>|Element[]} selector
	 */
	observeMore(selector) {
		const newElements = ElementObserver.#resolveElements(selector);

		for (const el of newElements) {
			el.setAttribute('data-anim-direction', this.#options.direction);
			this.#elements.push(el);

			if (this.#observer) {
				this.#observer.observe(el);
			} else {
				this.#reveal(el);
			}
		}
	}

	/**
	 * Force la révélation d'un élément (ex : besoin métier ponctuel).
	 * @param {Element} el
	 */
	reveal(el) {
		this.#reveal(el);
	}

	/** Stoppe l'observation et libère les références. */
	destroy() {
		this.#observer?.disconnect();
		this.#observer = null;
		this.#elements = [];
	}

	/** @returns {Element[]} Copie de la liste des éléments observés. */
	get elements() {
		return [...this.#elements];
	}

	/** @returns {Readonly<typeof ElementObserver.DEFAULTS>} Options effectives (fournies + défauts appliqués). */
	get options() {
		return { ...this.#options };
	}
	
	// Interne


	#init() {
		if (!this.#elements.length) return;

		for (const el of this.#elements) {
			el.setAttribute('data-anim-direction', this.#options.direction);
		}

		if (!('IntersectionObserver' in window)) {
			this.#revealAll();
			return;
		}

		this.#observer = new IntersectionObserver(this.#handleIntersect, {
			root: this.#options.root,
			rootMargin: this.#options.rootMargin,
			threshold: this.#options.threshold
		});

		for (const el of this.#elements) {
			this.#observer.observe(el);
		}
	}

	/**
	 * Champ de classe (arrow function) plutôt que méthode + bind() :
	 * une méthode privée classique ne peut pas être réassignée après
	 * coup (`this.#m = this.#m.bind(this)` lève une erreur), alors
	 * qu'un champ arrow function capture `this` nativement et reste
	 * une référence stable pour observe/unobserve.
	 * @param {IntersectionObserverEntry[]} entries
	 */
	#handleIntersect = (entries) => {
		for (const entry of entries) {
			const el = entry.target;

			if (entry.isIntersecting) {
				this.#reveal(el);
				if (this.#options.once) {
					this.#observer.unobserve(el);
				}
			} else if (!this.#options.once) {
				this.#hide(el);
			}
		}
	};

	/** @param {Element} el */
	#reveal(el) {
		el.setAttribute('data-anim-visible', 'true');
		el.classList.add('is-visible');
	}

	/** @param {Element} el */
	#hide(el) {
		el.removeAttribute('data-anim-visible');
		el.classList.remove('is-visible');
	}

	#revealAll() {
		for (const el of this.#elements) {
			this.#reveal(el);
		}
	}

	/**
	 * Fusionne les options fournies avec les valeurs par défaut.
	 * Une clé explicitement passée à `undefined` est ignorée
	 * (le défaut s'applique quand même) plutôt que d'écraser le défaut.
	 * @param {Object} options
	 */
	static #mergeOptions(options) {
		const merged = { ...ElementObserver.#DEFAULTS };
		for (const key of Object.keys(options)) {
			if (options[key] !== undefined) {
				merged[key] = options[key];
			}
		}
		return merged;
	}

	/**
	 * @param {string|Element|NodeListOf<Element>|Element[]} selector
	 * @returns {Element[]}
	 */
	static #resolveElements(selector) {
		if (!selector) return [];
		if (typeof selector === 'string') {
			return Array.from(document.querySelectorAll(selector));
		}
		if (selector instanceof Element) {
			return [selector];
		}
		return Array.from(selector);
	}
}
