import { html } from "../index.js";
import { adjust_lre } from "./lime.js";

customElements.define("soilom-excal", class extends HTMLElement {
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const om = formdata.get("om");
    const al = formdata.get("al");

    const lre = Math.max(0,
      ((-2170.7)+(1715.3*om)+(14.94*al)) * (0.892179)
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
          <label for="al">
            <span data-tooltip="if Al is in meq/100g (cmolc/kg) multiply by 90 for ppm">
              Exchangeable Aluminum (ppm)
            </span>
          </label>
          <input type="number" step="any" id="al" name="al" min="0">
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
