import { html } from "../index.js";
import { adjust_lre } from "./lime.js";

customElements.define("reserve-acidity", class extends HTMLElement {
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const ph = formdata.get("ph");
    const base_unit = formdata.get("base-unit");
    const ca = formdata.get("ca") / (base_unit==="ppm" ? 200 : 1);
    const mg = formdata.get("mg") / (base_unit==="ppm" ? 120 : 1);
    const k = formdata.get("k") / (base_unit==="ppm" ? 390 : 1);
    const na = formdata.get("na") / (base_unit==="ppm" ? 230 : 1);
    const al = formdata.get("al") / (base_unit==="ppm" ? 90 : 1);
    let reserve_acid = +formdata.get("reserve-acid");

    const sum_base = ca + mg + k + na;

    const cec_inner = (sum_base < 7) ?
	    ((sum_base-ph)*1.3) + 9 :
			(((sum_base-ph)*1.25)+8)*((-0.0334*ph)+1.27);
		const cec = (reserve_acid == 0) ?
		  cec_inner / 1.08:
		  sum_base + reserve_acid;
		if (reserve_acid == 0) {
		  reserve_acid = cec - sum_base;
		}

		const lre_coef = 1.5 * 892.179 * ((6*2.54)/20) * 1.3;
		const lre_al = al * lre_coef;
    const lre = reserve_acid * lre_coef;
    form["lre"].value = (
      (ph <= 5.4 && al > reserve_acid)?
      lre_al:
      lre
    ).toLocaleString(undefined, {'maximumFractionDigits': 0});

    adjust_lre(lre, form, formdata);
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <form>
        <div class="grid">
          <label for="ph"> Target pH </label>
          <input type="number" step="any" id="ph" name="ph" min="0" max="14">
        </div>
        <div class="grid">
          <label for="base-unit"> Base Unit </label>
          <select name="base-unit" id="base-unit">
            <option value="meq">meq/100g</option>
            <option value="ppm">ppm</option>
          </select>
        </div>
        <div class="grid">
          <label for="ca"> Ca </label>
          <input type="number" step="any" id="ca" name="ca" min="0">
        </div>
        <div class="grid">
          <label for="mg"> Mg </label>
          <input type="number" step="any" id="mg" name="mg" min="0">
        </div>
        <div class="grid">
          <label for="k"> K </label>
          <input type="number" step="any" id="k" name="k" min="0">
        </div>
        <div class="grid">
          <label for="na"> Na </label>
          <input type="number" step="any" id="na" name="na" min="0">
        </div>
        <div class="grid">
          <label for="al"> Exchangeable Al </label>
          <input type="number" step="any" id="al" name="al" min="0">
        </div>
        <div class="grid">
          <label for="reserve-acid">
            <span data-tooltip="Represents reserve acidity (may be represented differently than \"H+Al\" in soil test report)">
              H+Al (meq/100g)
            </span>
          </label>
          <input type="number" step="any" id="reserve-acid" name="reserve-acid" min="0" value="0">
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
