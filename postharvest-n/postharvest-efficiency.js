import { html } from "../index.js";

customElements.define("postharvest-efficiency", class extends HTMLElement {
  constructor() {
    super();
    this.crop_params = {
      "Durum spring wheat":      {lbsN_per_bushel: 3.3, bu_per_inch: 5.5, n_uptake_factor: 0.15},
      "Hard red spring wheat":   {lbsN_per_bushel: 3.6, bu_per_inch: 6,   n_uptake_factor: 0.13},
      "Hard red winter wheat":   {lbsN_per_bushel: 3.0, bu_per_inch: 6,   n_uptake_factor: 0.13},
      "Hard white spring wheat": {lbsN_per_bushel: 3.2, bu_per_inch: 5.5, n_uptake_factor: 0.13},
      "Hard white winter wheat": {lbsN_per_bushel: 3.0, bu_per_inch: 7,   n_uptake_factor: 0.13},
      "Soft white spring wheat": {lbsN_per_bushel: 2.7, bu_per_inch: 5.5, n_uptake_factor: 0.15},
      "Soft white winter wheat": {lbsN_per_bushel: 2.7, bu_per_inch: 7,   n_uptake_factor: 0.15},
    };

    this.no3_coef = 3.5;
    this.nh4_coef = 3.5;

    this.organic_matter_multiplier = {
      "Conventional tillage system, annual cropping": 25,
      "Reduced tillage system, annual cropping":      17.5,
      "Summer fallow systems":                        15,
    };

    this.previous_legume_credit = {
      "Alfalfa hay":              50,
      "No preceding legume crop": 0,
      "Peas, < 2000 lb/ac yield": 10,
      "Peas, > 2000 lb/ac yield": 20,
    };

    this.previous_cereal_debit = {
      "No preceding wheat crop":                        0,
      "Preceding crop was wheat, <20 bu/acre yield":    0,
      "Preceding crop was wheat, >100 bu/acre yield":   50,
      "Preceding crop was wheat, 20-40 bu/acre yield":  7.5,
      "Preceding crop was wheat, 40-60 bu/acre yield":  15,
      "Preceding crop was wheat, 60-80 bu/acre yield":  30,
      "Preceding crop was wheat, 80-100 bu/acre yield": 45,
    };

  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    // Part A
    const crop = this.crop_params[formdata.get("crop-type")];
    form["lbN-per-bu"].value = crop.lbsN_per_bushel;
    form["bu-per-in"].value = crop.bu_per_inch;
    form["n-uptake-factor"].value = crop.n_uptake_factor;
    const est_yield = formdata.get("yield");
    const yield_removal = est_yield * crop.lbsN_per_bushel;
    const soil_moisture = formdata.get("soil-moisture");
    const rain = formdata.get("expected-rain");
    const water_removal = (+soil_moisture + +rain - 4) * crop.bu_per_inch * crop.lbsN_per_bushel;
    const larger_removal = Math.max(yield_removal, water_removal);
    form["n-requirement"].value = larger_removal;

    // Part B
    const nitrate_type = formdata.get("nitrate-test-type");
    const nitrate_value = formdata.get("nitrate-value");
    const nitrate_credit = nitrate_value * (nitrate_type !== "lb_ac" ? this.no3_coef : 1);
    const ammonium_type = formdata.get("ammonium-test-type");
    const ammonium_value = formdata.get("ammonium-value");
    const ammonium_credit = ammonium_value * (ammonium_type === "ppm" ? this.nh4_coef : 1);
    const som_coef = formdata.get("tillage-system");
    const som = formdata.get("som");
    const som_credit = som * som_coef;
    const legume_credit = +formdata.get("previous-legume");
    const cereal_debit = +formdata.get("previous-cereal");
    const soil_n_supply = nitrate_credit +
                          ammonium_credit +
                          som_credit +
                          legume_credit -
                          cereal_debit;
    form["n-supply"].value = soil_n_supply;
    const fertilizer_reccomendation = larger_removal - soil_n_supply;
    form["n-fertilizer"].value = fertilizer_reccomendation;

    // Part C
    const true_yield = +formdata.get("ph-yield");
    const protein = +formdata.get("protein");
    const n_fertilizer_applied = +formdata.get("n-fertilizer-applied");
    const n_uptake = true_yield * protein * crop.n_uptake_factor;
    form["n-uptake"].value = n_uptake;
    const n_efficiency = (n_uptake / (soil_n_supply +n_fertilizer_applied)) * 100;
    form["n-efficiency"].value = n_efficiency;
    const n_wheat_ratio = (soil_n_supply + n_fertilizer_applied) / true_yield;
    form["n-wheat-ratio"].value = n_wheat_ratio;
    const residual_n = n_fertilizer_applied + soil_n_supply - n_uptake;
    form["residual-n"].value = residual_n;

    // Part D
    const no3_depth_note = nitrate_type === "ppm_shallow" ?
      `\u2014 Soil test for residual nitrate-nitrogen should go to a depth of 4 feet for spring cereals; 6 feet for winter cereals \n\n` :
      ``;
    const n_balance_note = n_efficiency >= 5 ?
      `\u2014 A large amount of nitrogen may have been left in the field. Soil sample prior to next crop to assess residual nitrate nitrogen. \n\n` :
      `\u2014 Nitrogen balance exceeds 50% which indicates better than average uptake efficiency and nitrogen management practices. \n\n`;
    const nitrate_residue_note = nitrate_credit >= 100 ?
      `\u2014 A large amount of residual nitrate-nitrogen was left from the previous crop; Verify yield goal and nitrogen supply calculations to ensure accuracy \n\n` :
      ``;
    const n_wheat_ratio_note = n_wheat_ratio >= crop.lbsN_per_bushel ?
      `\u2014 lb N/bushel produced is worse than average. Lower application rates, split applications or a more accurate yield goal estimate is needed. \n\n` :
      `\u2014 lb N/bushel produced is better than average! \n\n`;
    const merged_note = n_balance_note + nitrate_residue_note + n_wheat_ratio_note + no3_depth_note;
    form["note"].value = merged_note;
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <article>
        <header>Post-Harvest Nitrogen Efficiency </header>
        <form>
          <section id="required-n-supply">
            <label><strong> A: Required Nitrogen Supply </strong></label>
            <div class="grid">
              <label for="crop-type"> 1: Crop type (bu/Ac)</label>
              <select name="crop-type" id="crop-type">
                ${
                 Object.keys(this.crop_params).map(key => {return `
                   <option value="${key}">${key}</option>
                 `}).join("")   
                }
              </select>
            </div>
            <div class="grid tabbed">
              <label for="lbN-per-bu">&mdash; lb N/bu</label>
              <input type="number" step="any" id="lbN-per-bu" name="lbN-per-bu" disabled>
            </div>
            <div class="grid tabbed">
              <label for="bu-per-in">&mdash; bu/in </label>
              <input type="number" step="any" id="bu-per-in" name="bu-per-in" disabled>
            </div>
            <div class="grid tabbed">
              <label for="n-uptake-factor">&mdash; Protein-N uptake factor</label>
              <input type="number" step="any" id="n-uptake-factor" name="n-uptake-factor" disabled>
            </div>
            <div class="grid">
              <label for="yield"> 2: Estimate yield (bu/Ac)</label>
              <input type="number" step="any" id="yield" name="yield">
            </div>
            <div class="grid">
              <label for="soil-moisture"> 3: Soil moisture (in)</label>
              <input type="number" step="any" id="soil-moisture" name="soil-moisture">
            </div>
            <div class="grid">
              <label for="expected-rain"> 4: Expected rainfall this season (in)</label>
              <input type="number" step="any" id="expected-rain" name="expected-rain">
            </div>
            <div class="grid">
              <label for="n-requirement"> 5: N supply requirement (lb N/Ac)</label>
              <input type="number" step="any" id="n-requirement" name="n-requirement" disabled>
            </div>
          </section>
          <section id="soil-n-inventory">
            <label><strong> B: Available N Supply </strong></label>
            <label> 1: Nitrate Credit </label>
            <div class="grid tabbed">
              <label for="nitrate-test-type">&mdash; Test unit</label>
              <select name="nitrate-test-type" id="nitrate-test-type">
                <option value="ppm_shallow">Concentration in PPM &le; 3ft</option>
                <option value="ppm">Concentration in PPM &gt; 3ft</option>
                <option value="lb_ac">lb/Ac Credit</option>
              </select>
            </div>
            <div class="grid tabbed">
              <label for="nitrate-value">&mdash; Test result </label>
              <input type="number" step="any" id="nitrate-value" name="nitrate-value">
            </div>
            <label> 2: Ammonium Credit </label>
            <div class="grid tabbed">
              <label for="ammonium-test-type">&mdash; Test unit</label>
              <select name="ammonium-test-type" id="ammonium-test-type">
                <option value="ppm">Concentration in PPM</option>
                <option value="lb_ac">lb/Ac Credit</option>
              </select>
            </div>
            <div class="grid tabbed">
              <label for="ammonium-value">&mdash; Test result </label>
              <input type="number" step="any" id="ammonium-value" name="ammonium-value">
            </div>
            <div class="grid">
              <label for="tillage-system"> 3: Tillage System </label>
              <select name="tillage-system" id="tillage-system">
                ${
                 Object.entries(this.organic_matter_multiplier).map(([key, val]) => {return `
                   <option value=${val}>${key}</option>
                 `}).join("")   
                }
              </select>
            </div>
            <div class="grid">
              <label for="som">4: Soil Organic Matter (%)</label>
              <input type="number" step="any" id="som" name="som">
            </div>
            <div class="grid">
              <label for="previous-legume"> 5: Previous Legume Credit </label>
              <select name="previous-legume" id="previous-legume">
                ${
                 Object.entries(this.previous_legume_credit).map(([key, val]) => {return `
                   <option value=${val}>${key}</option>
                 `}).join("")   
                }
              </select>
            </div>
            <div class="grid">
              <label for="previous-cereal"> 5: Previous Cereal Debit </label>
              <select name="previous-cereal" id="previous-cereal">
                ${
                 Object.entries(this.previous_cereal_debit).map(([key, val]) => {return `
                   <option value=${val}>${key}</option>
                 `}).join("")   
                }
              </select>
            </div>
            <div class="grid">
              <label for="n-supply"> 5: Soil N Supply (lb N/Ac)</label>
              <input type="number" step="any" id="n-supply" name="n-supply" disabled>
            </div>
            <div class="grid result">
              <label for="n-fertilizer">6: Fertilizer Nitrogen Reccomendation</label>
              <input type="number" step="any" id="n-fertilizer" name="n-fertilizer" readonly>
            </div>
          </section>
          <section id="postharvest">
            <label><strong> C: Post-Harvest Efficiency Calculations </strong></label>
            <div class="grid">
              <label for="ph-yield"> 1: Post-Harvest Yield (bu/Ac)</label>
              <input type="number" step="any" id="ph-yield" name="ph-yield">
            </div>
            <div class="grid">
              <label for="protein"> 2: Average Protein Content (%)</label>
              <input type="number" step="any" id="protein" name="protein">
            </div>
            <div class="grid">
              <label for="n-fertilizer-applied"> 3: Fertilizer N Applied (lb/Ac)</label>
              <input type="number" step="any" id="n-fertilizer-applied" name="n-fertilizer-applied">
            </div>
            <div class="grid">
              <label for="n-uptake"> 4: N Uptake (lb N/Ac)</label>
              <input type="number" step="any" id="n-uptake" name="n-uptake" disabled>
            </div>
            <div class="grid result">
              <label for="n-efficiency"> 5: N Uptake Efficiency (%)</label>
              <input type="number" step="any" id="n-efficiency" name="n-efficiency" readonly>
            </div>
            <div class="grid result">
              <label for="n-wheat-ratio"> 6: N to Wheat Ratio (lbs N/bu)</label>
              <input type="number" step="any" id="n-wheat-ratio" name="n-wheat-ratio" readonly>
            </div>
            <div class="grid result">
              <label for="residual-n"> 7: Potential residual N left in field (lbs N/Ac)</label>
              <input type="number" step="any" id="residual-n" name="residual-n" readonly>
            </div>
          </section>
          <section id="notes">
            <label for="note"><strong> D: Notes </strong></label>
            <textarea id="note" name="note" rows="20" disabled></textarea>
          </section>
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
