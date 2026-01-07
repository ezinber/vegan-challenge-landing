const template = document.createElement('template');

template.innerHTML = /*html*/`
  <style>
    :host {
      --_gap: var(--gap, 1.5em);
      --_sides-padding: var(--prefer-sides-padding, var(--_gap));
      --_background-color: var(--color-background-b, #000);
      --_backdrop-filter: var(--backdrop-filter, blur(8px));
      --_transition: var(--transition-a, .2s linear);
      --_close-button-color: rgb(var(--color-a, 255, 255, 255));
      --_backdrop-color: rgba(var(--color-b, 0 0 0), var(--opacity-a, .8));

      display: block;
      width: 100%;
      height: 100%;
      font-size: inherit;
    }

    ::slotted([slot='button']) {
      height: 100%;
      width: 100%;
      display: none;
    }

    ::slotted([slot='content']) {
      max-height: 80vw;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    button {
      box-sizing: border-box;
      padding: 0;
      background: none;
      border: none;
      font-size: inherit;
      cursor: pointer;
      z-index: 1;
      text-align: start;
      color: inherit;
      font-family: inherit;
      line-height: inherit;
    }

    button[type="button"] {
      width: 100%;
      height: 100%;
      transform: translateY(0);
      transition: transform var(--_transition);

      &:hover {
        transform: translateY(-.5rem);
      }
    }

    button[type="submit"] {
      width: 2em;
      aspect-ratio: 1;
      display: block;
      position: relative;
    }

    button[type="submit"]::before,
    button[type="submit"]::after {
      content: '';
      display: block;
      width: 100%;
      height: 3px;
      position: absolute;
      top: 50%;
      background-color: var(--_close-button-color);
      rotate: 45deg;
    }

    button[type="submit"]::after {
      rotate: -45deg;
    }

    form {
      width: fit-content;
      height: fit-content;
      margin: .5em auto 0;
    }

    .close-btn {
      position: fixed;
      width: fit-content;
      padding: .5em;
      bottom: 0;
      right: 0;
    }

    dialog {
      padding: 0;
      flex-direction: column;
      border: none;
      background: none;
      opacity: 0;
      transition:
        opacity var(--_transition),
        overlay var(--_transition) allow-discrete,
        display var(--_transition) allow-discrete;
    }

    dialog::backdrop {
      background-color: transparent;
      backdrop-filter: none;
      transition:
        display var(--_transition) allow-discrete,
        overlay var(--_transition) allow-discrete,
        background-color var(--_transition),
        backdrop-filter var(--_transition);
    }

    dialog[open] {
      opacity: 1;
      display: flex;
    }

    dialog[open]::backdrop {
      background-color: var(--_backdrop-color);
      backdrop-filter: var(--_backdrop-filter);
    }

    @starting-style {
      dialog:open {
        opacity: 0;
      }

      dialog:open::backdrop {
        backdrop-filter: none;
        background-color: transparent;
      }
    }

  </style>
  <button type="button">
      <slot name="button"></slot>
  </button>
  <dialog>
    <slot name="content"></slot>
    <form method="dialog">
      <button type="submit" class="hover-opacity"></button>
    </form>
  </dialog>
`

/**
 * The `EzDialog` web component provides a simple and customizable dialog interface.
 *
 * @class EzDialog
 * @extends HTMLElement
 */
class EzDialog extends HTMLElement {
  /**
   * Constructs a new `EzDialog` instance.
   *
   * @constructor
   */
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(template.content.cloneNode('true'));
    this.dialogOpenButton = this.shadowRoot.querySelector('button');
    this.dialog = this.shadowRoot.querySelector('dialog');
  }

  /**
   * Called when the `EzDialog` element is inserted into the DOM.
   *
   * @memberof EzDialog
   * @returns {void}
   */
  connectedCallback() {
    this.dialogOpenButton.addEventListener('click', () => this.dialog.showModal());

    this.dialog.addEventListener('click', (evt) => {
      if (evt.target === this.dialog) this.dialog.close();
    });
  }
}

/**
 * Registers the `EzDialog` custom element with the browser's `customElements` registry.
 *
 * @function registerEzDialog
 * @returns {void}
 */
export const registerEzDialog = () => customElements.define('ez-dialog', EzDialog);
