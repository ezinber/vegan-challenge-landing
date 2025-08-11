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
    this.content = document.getElementById('ez-dialog').content.cloneNode(true);
    this.content.querySelector('link').href=`${import.meta.resolve('./ez-dialog.css')}`;
    this.shadowRoot.appendChild(this.content);
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
