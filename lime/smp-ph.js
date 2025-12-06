import { html } from "../index.js";
import { adjust_lre } from "./lime.js";

customElements.define("smp-ph", class extends HTMLElement {
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const smp = formdata.get("smp");
    const ph = formdata.get("ph");

    const lre = Math.max(0,
  		((8.38481203007521 + (smp * (-4.40576441102757)) + (ph * 3.5)) * 2000)
    ) * 0.9906;
    form["lre"].value = lre.toLocaleString(undefined, {'maximumFractionDigits': 0});

    adjust_lre(lre, form, formdata);
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <form>
        <div class="grid">
          <label for="smp">
            <span data-tooltip="For best accuracy Buffer pH must be between 4.8 and 6.7">
              SMP Buffer pH
            </span>
          </label>
          <input type="number" step="any" id="smp" name="smp" min="0" max="14">
        </div>
        <div class="grid">
          <label for="ph">
            <span data-tooltip="For best accuracy Target pH must be between 5.6 and 6.4">
              Target pH
            </span>
          </label>
          <input type="number" step="any" id="ph" name="ph" min="0" max="14">
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
