import { html } from "../index.js";
import { adjust_lre } from "./lime.js";

customElements.define("base-saturation", class extends HTMLElement {
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const ph = +formdata.get("ph");
    const base_unit = +formdata.get("base-unit");
    const ca = +formdata.get("ca") * (base_unit==="ppm" ? 1/200 : 1);
    const mg = +formdata.get("mg") * (base_unit==="ppm" ? 1/120 : 1);
    const k = +formdata.get("k") * (base_unit==="ppm" ? 1/390 : 1);
    const na = +formdata.get("na") * (base_unit==="ppm" ? 1/230 : 1);
    const reserve_acid = +formdata.get("reserve-acid");
    const target_bs = +formdata.get("tbs");

    const sum_base = ca + mg + k + na;

    // slightly disentangled version of the WORST excel spreadsheet I've ever seen in my life
    // like seriously man it was THIS:
    // =IF($C$10=0,(IF($C$9=0,(IF($D$8<7,((($D$8-$C$3)*1.3)+9),(((($D$8-$C$3)*1.25)+8)*((-0.0334*$C$3)+1.27)))/1.08),SUM($C$4:$C$7,$C$9))),"NA")
    // holy shit
    const cec_inner = (sum_base < 7) ?
	    ((sum_base-ph)*1.3) + 9 :
			(((sum_base-ph)*1.25)+8)*((-0.0334*ph)+1.27);
		const cec = (reserve_acid == 0) ?
		  cec_inner / 1.08:
		  sum_base + reserve_acid;
		console.log(cec);
		const actual_bs = (sum_base/cec)*100;
		console.log(actual_bs);

    const lre = Math.max(0,
      (((target_bs-actual_bs)*cec) / (100)) * (892.179) * ((6*2.54)/(20)) * (1.3)
    );
    form["lre"].value = lre.toLocaleString(undefined, {'maximumFractionDigits': 0});
    
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
          <label for="reserve-acid"> 6.
            <span data-tooltip="Represents reserve acidity (may be represented differently than \"H+Al\" in soil test report)">
              H+Al (meq/100g)
            </span>
          </label>
          <input type="number" step="any" id="reserve-acid" name="reserve-acid" min="0" value="0">
        </div>
        <div class="grid">
          <label for="abs"> Actual Base Saturation (%) </label>
          <input type="number" step="any" id="abs" name="abs" disabled>
        </div>
        <div class="grid">
          <label for="tbs"> Target Base Saturation (%) </label>
          <input type="number" step="any" id="tbs" name="tbs" min="0" max="100">
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
