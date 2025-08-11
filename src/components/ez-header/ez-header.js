/**
 * The `EzHeader` web component provides a Header with a burger menu and anchor link highlights.
 *
 * @class EzHeader
 * @extends HTMLElement
 */
class EzHeader extends HTMLElement {
  /**
   * Constructs a new `EzHeader` instance.
   *
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.content = document.getElementById('ez-header').content.cloneNode(true);
    this.content.querySelector('link').href=`${import.meta.resolve('./ez-header.css')}`;
    this.shadowRoot.appendChild(this.content);
    this.listElements = this.shadowRoot.querySelector('slot').assignedElements();
    this.linksAndTargets = [];
    this.burgerElement = this.shadowRoot.querySelector('button');
    this.timeout = null;
  }

    /**
   * Collects all anchor links inside the header and maps them to their target sections.
   */
  createLinksAntTargetsList() {
    this.listElements.forEach(i => {
      const link = i.querySelector('a');
      const target = document.getElementById(link?.getAttribute('href')?.slice(1));

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
    window.addEventListener('scroll', this.handleLinksScroll.bind(this));
  }

  /**
   * Called when the `EzHeader` element is inserted into the DOM.
   *
   * @memberof EzHeader
   * @returns {void}
   */
  connectedCallback() {
    this.createLinksAntTargetsList();
    this.setEventListeners();
  }
}

export const registerEzHeader = () => customElements.define('ez-header', EzHeader);
