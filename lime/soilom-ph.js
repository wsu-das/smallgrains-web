import { html } from "../index.js";
import { adjust_lre } from "./lime.js";

customElements.define("soilom-ph", class extends HTMLElement {
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const om = formdata.get("om");
    const ph = formdata.get("ph");

    const lre = Math.max(0,
      ((7797)+(1584.2*om)+(-1810.7*ph)) * (0.892179)
    ) * 0.9906;
    form["lre"].value = lre.toLocaleString(undefined, {'maximumFractionDigits': 0});

    adjust_lre(lre, form, formdata);
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <form>
        <div class="grid">
          <label for="om">
            <span data-tooltip="if OM is in g/kg divide by 10 for percentage">
              Soil Organic Matter (%)
            </span>

          </label>
          <input type="number" step="any" id="om" name="om" min="0" max="100">
        </div>
        <div class="grid">
          <label for="ph"> Soil pH </label>
          <input type="number" step="any" id="ph" name="ph" min="0">
        </div>
        <div class="grid">
          <label for="lre">Liming Requirement Estimate (lb/Ac) </label>
          <input type="text" id="lre" name="lre" disabled>
        </div>
      </form>
    `);

    const form = this.querySelector("form");
    form.addEventListener('submit', this.handleSubmit.bind(this))
  }
});
