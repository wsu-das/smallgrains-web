import { html } from "../index.js";

customElements.define("mehlich-calc", class extends HTMLElement {
  constructor() {
    super();
  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const ph = formdata.get("ph");
    const depth = formdata.get("depth");

    const soil_ac = Math.max((6.6-ph)/(0.25), 0)
    form["soil-ac"].value = soil_ac.toFixed(1);
    const lre = (0.446 * ((0.1 * (soil_ac**2)) + soil_ac) * 2000) * (depth / 6);
    form["lre"].value = lre.toLocaleString(undefined, {'maximumFractionDigits': 0});
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <article>
        <header>Liming Requirement estimate using Mehlich Buffer pH </header>
        <form>
          <div class="grid">
            <label for="ph"> 1. Mehlich Buffer pH </label>
            <input type="number" step="any" id="ph" name="ph">
          </div>
          <div class="grid">
            <label for="depth">
              2. 
              <span data-tooltip="For example, if sampling from 0 to 3 in (or 3 to 6 in), enter 3">
                Sample Depth (in)
              </span>
            </label>
            <input type="number" step="any" id="depth" name="depth" value=6>
          </div>
          <div class="grid">
            <label for="soil-ac">3. Soil Acidity (meq / 100 cm<sup>3</sup>) </label>
            <input type="number" step="any" id="soil-ac" name="soil-ac" disabled>
          </div>
          <div class="grid result">
            <label for="lre">4. Liming Requirement Estimate (lb/Ac) </label>
            <input type="text" id="lre" name="lre" readonly>
          </div>
          <div class="grid">
            <input type="submit" value="Calculate" />
            <input type="reset" value="Reset" />
          </div>
        </form>
      </article>
    `);

    const form = this.querySelector("form");
    form.addEventListener('submit', this.handleSubmit.bind(this))
  }
});
