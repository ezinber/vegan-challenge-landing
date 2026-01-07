const template = document.createElement('template');

template.innerHTML = /*html*/`
  <style>
    :host {
      --_transition: var(--transition-a, .2s linear);
      --_color-a: rgb(var(--color-a, #fff));
      --_color-b: rgb(var(--color-b, #000));
      --_font-size: var(--font-size-a, 1rem);
      --_burger-line-width: 3px;

      display: flex;
      margin: .5em;
      padding: 0 .5em;
      font-size: var(--_font-size);
      align-items: center;
      position: fixed;
      top: 0;
      color: var(--_color-a);
      background-color: var(--_color-b);
      border-radius: 1em;
      box-shadow: 2px 2px 4px black;
      z-index: 3;
      opacity: 1;
      transition:
        opacity var(--_transition),
        height var(--_transition),
        width var(--_transition);

      &:has([slot="logo"]) {
        padding-left: 2.5rem;
        margin-left: 2.5rem;
        border-top-left-radius: 0;
      }
    }

    ::slotted([slot="logo"]) {
      height: 5rem;
      width: 5rem;
      display: block;
      background-color: var(--_color-a);
      border-radius: 50%;
      padding: .4rem;
      position: absolute;
      left: -5rem;
    }

    @starting-style {
      :host {
        opacity: 0;
      }
    }

    nav {
      display: flex;
      justify-content: center;
      position: relative;
      flex: 1;
      transition:
        opacity var(--_transition),
        color var(--_transition);
      opacity: var(--_nav-opacity);
      visibility: var(--_nav-visibility);

      &:has(.logo) {
        padding-left: 5rem;
        background-color: red;
      }
    }

    ul {
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      list-style: none;
      gap: .5em;
    }

    ::slotted(li) {
      width: 100%;
      display: flex;
      position: relative;
      text-align: center;
    }

    button {
      font-size: inherit;
      display: none;
      padding: 0;
      position: absolute;
      bottom: 0;
      right: 0;
      width: 3em;
      height: 3em;
      cursor: pointer;
      background-color: transparent;
      border: none;
      z-index: 1;
    }

    button::before,
    button::after {
      content: '';
      width: 50%;
      height: var(--_burger-line-width);
      background-color: currentColor;
      transition: var(--_transition);
    }

    .opened {
      gap: 0;
    }

    .opened::before {
      transform: translateY(var(--_burger-line-width)) rotate(-45deg);
    }

    .opened::after {
      transform: rotate(45deg);
    }

    @media (width <= 640px) {
      :host {
        --_nav-opacity: 0;
        --_nav-visibility: hidden;

        width: 3em;
        height: 3em;
        padding: 0;
        top: auto;
        left: auto;
        right: 0;
        bottom: 0;

        &:has([slot="logo"]) {
          border-radius: 1rem;
        }
      }

      ::slotted(a[slot="logo"]) {
        position: absolute;
        top: -6rem;
        left: calc(50% - 2.5rem);
      }

      :host(.extended) {
        --_nav-opacity: 1;
        --_nav-visibility: visible;

        width: fit-content;
        height: fit-content;
        padding: 1em 1em 3em;

        &:has([slot="logo"]) {
          padding: 3.5rem .5em .5em;
        }
      }

      nav {
        flex-direction: column;
      }

      ul {
        min-width: 100%;
        min-height: 100%;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        justify-content: center;
        z-index: 1;
      }

      button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: .2em;
        transition: gap var(--_transition);
      }
    }
  </style>

  <nav>
    <slot name="logo"></slot>
    <ul>
      <slot>
        <!-- <li> elements expected -->
      </slot>
    </ul>
  </nav>
  <button type="menu" aria-label="Menu">
    <span></span>
  </button>
`

/**
 * The `EzHeader` web component provides a Header with a burger menu and anchor link highlights.
 *
 * @class EzHeader
 * @extends HTMLElement
 */
class EzHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode('true'));
    this.listElements = this.shadowRoot.querySelector('ul > slot').assignedElements();
    this.linksAndTargets = [];
    this.burgerElement = this.shadowRoot.querySelector('button');
    this.timeout = null;
  }

    /**
   * Collects all anchor links inside the header and maps them to their target sections.
   */
  createLinksAntTargetsList() {
    this.listElements.forEach(i => {
      let target;
      const link = i.querySelector('a');
      const href = link?.getAttribute('href');

      if (href?.startsWith('#')) {
        target = document.getElementById(href.slice(1));
      }

      if (target) {
        this.linksAndTargets.push({ link, target });
      }
    });
  }

  /**
   * Checks if the provided element is fully or partially in the viewport.
   * @param {HTMLElement} el - The target element to check.
   * @returns {boolean} - Whether the element is in the viewport or not.
   */
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;

    const isFullyVisible = rect.top >= 0 && rect.bottom <= windowHeight;
    const isPartiallyVisible = (rect.top < windowHeight / 2 && rect.bottom >= windowHeight / 2) || (rect.top >= 0 && rect.top < windowHeight / 2);

    return isFullyVisible || isPartiallyVisible;
  }

  /**
  * Handles scroll events to highlight anchor links whose target sections are visible.
  */
  handleLinksScroll() {
// throttle
    if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.timeout = null;

        this.linksAndTargets.forEach(i => {
        const { link, target } = i;

          if (this.isElementInViewport(target)) {
            link.classList.add(this.dataset.activeClass);
          } else {
            link.classList.remove(this.dataset.activeClass);
          }
        });
      }, 300);
    }


// debounce
//     clearTimeout(this.timeout);

//     this.timeout = setTimeout(() => {
//       this.linksAndTargets.forEach(i => {
//         const { link, target } = i;
//
//         if (this.isElementInViewport(target)) {
//           link.classList.add(this.dataset.activeClass);
//         } else {
//           link.classList.remove(this.dataset.activeClass);
//         }
//       });
//     }, 500)
  }

  /**
   * Toggles the burger menu and header classes when the burger menu is clicked.
   */
  handleBurgerMenuClick() {
    this.classList.toggle('extended');
    this.burgerElement.classList.toggle('opened');
  }

  /**
   * Sets up event listeners for the burger menu and window scroll events.
   */
  setEventListeners() {
    this.burgerElement.addEventListener('click', this.handleBurgerMenuClick.bind(this));

    if (this.linksAndTargets.length > 0) {
      window.addEventListener('scroll', this.handleLinksScroll.bind(this));
    }
  }

  /**
   * Called when the `EzHeader` element is inserted into the DOM.
   *
   * @memberof EzHeader
   * @returns {void}
   */
  connectedCallback() {
    if (this.dataset.activeClass) {
      this.createLinksAntTargetsList();
    }

    this.setEventListeners();
  }
}

export const registerEzHeader = () => customElements.define('ez-header', EzHeader);
