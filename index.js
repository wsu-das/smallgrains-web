// for now this just hints some editors to do HTML syntax highlighting
// in the future we can replace this with an HTML sanitizer to prevent XSS
export function html(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

export const toDashCase = (title) => title.toLowerCase().replace(' ', '-');

customElements.define("das-sg-shell", class extends HTMLElement {
  constructor() {
    super();

    const links = html`
      <ul>
        <li hx-boost="true" id="variety-selector" href="/">
          <img src="/resources/img/das-us-logo-white-45h.png" alt="" href="" i="">
        </li>
        <li> <a hx-boost="true" id="variety-selector" href="/variety-selector">Variety Selector</a></li>
        <li> <a hx-boost="true" id="nitrogen-fertilizer" href="/nitrogen">Nitrogen Fertilizer</a></li>
        <li> <a hx-boost="true" id="postharvest-n" href="/postharvest-n">Post-Harvest Nitrogen</a></li>
        <li> <a hx-boost="true" id="lime-requirement" href="/lime">Lime Requirement</a></li>
        <li> <a hx-boost="true" id="spring-canola" href="/canola">Spring Canola</a></li>
        <li> <a hx-boost="true" id="straw-removal" href="/straw-removal">Straw Removal</a></li>
      </ul>
    `;
    
    this.outerHTML = html`
      <header>
        <button
          popovertarget="mobile-menu"
          aria-label="Show Site Menu"
          aria-controls="mobile-menu"
        ></button>
      </header>
      <aside id="desktop-menu">
        <nav>
          ${links}
        </nav>
      </aside>
      <aside id="mobile-menu" popover>
        <nav>
          ${links}
        </nav>
      </aside>
    `;
  }

  connectedCallback() {
    const page = this.getAttribute("page");
  }
});
