import { html, toDashCase } from "../index.js";

customElements.define("straw-removal", class extends HTMLElement {
  constructor() {
    super();

    this.harvest_indices = {
      "AP Exceed": 0.375,
      "AP Iliad": 0.406,
      "AP Dynamic": 0.382,
      "ARS-Castella": 0.380,
      "ARS-Crescent": 0.353,
      "Battle AX": 0.376,
      "Canvas": 0.380,
      "Curiosity CL+": 0.360,
      "Devote": 0.376,
      "Guardian": 0.348,
      "Jasper": 0.350,
      "Kairos": 0.370,
      "Keldin": 0.373,
      "LCS Artdeco": 0.408,
      "LCS Blackjack": 0.413,
      "LCS Drive": 0.404,
      "LCS Hulk": 0.361,
      "LCS Jet": 0.404,
      "LCS Rocket": 0.388,
      "LCS Shine": 0.429,
      "LCS Sonic": 0.396,
      "M-idas": 0.443,
      "M-press": 0.415,
      "Mela CL+": 0.259,
      "Nixon": 0.385,
      "Norwest Duet": 0.362,
      "Norwest Tandem": 0.412,
      "OR2x2 CL+": 0.377,
      "Otto": 0.401,
      "Piranha CL+": 0.367,
      "PNW Hailey": 0.355,
      "Pritchett": 0.363,
      "Puma": 0.345,
      "Purl": 0.376,
      "Resilience CL+": 0.383,
      "Scorpio": 0.353,
      "Sockeye CL+": 0.365,
      "Stingray CL+": 0.352,
      "SY Clearstone": 0.281,
      "SY Command": 0.397,
      "SY Dayton": 0.405,
      "UI Magic CL+": 0.382,
      "Unknown": 0.376,
      "VI Frost": 0.312,
      "VI Presto CL+": 0.375,
      "VI Voodoo CL+": 0.367,
      "WB1529": 0.410,
      "WB4303": 0.396,
      "WB4311": 0.386,
      "WB4394": 0.313,
      "WB4623 CLP": 0.332,
      "Whistler": 0.362,
      "Xerpha": 0.357,
      "YSC-215": 0.370,
    }

    this.default_nutrient_params = {
      "N":    {concentration_lb_per_lb: 0.00642,   cost_usd_per_lb: 0.50},
      "P2O5": {concentration_lb_per_lb: 0.00092,   cost_usd_per_lb: 1.50},
      "S":    {concentration_lb_per_lb: 0.0006,    cost_usd_per_lb: 0.40},
      "Zn":   {concentration_lb_per_lb: 0.0001115, cost_usd_per_lb: 1.00},
      "B":    {concentration_lb_per_lb: 0.000622,  cost_usd_per_lb: 1.00},
    }

    this.default_cation_params = {
      "K2O": {concentration_lb_per_lb: 0.014,  coef_lb_to_cec: (50/94)},
      "Ca":  {concentration_lb_per_lb: 0.012,  coef_lb_to_cec: (100/40)},
      "Mg":  {concentration_lb_per_lb: 0.0087, coef_lb_to_cec: (100/24)},
    }

    this.liming_materials_cec = {
      "Calcium Carbonate": 1.00,
      "Calcitic Limestone": 0.97,
      "Dolomitic Limestone": 1.05,
      "Sugar Beet Lime": 0.77,
      "Liquid Suspended Calcite": 0.94,
    }
    this.liming_materials_price_usd_per_ton = 50.00;

    this.msc_lbsC_per_ac = {
      "Till - continuous cropping": 1964.000,
      "Till - 1/3 fallow": 2672.000,
      "Till - 1/2 fallow": 3571.000,
      "No-till - continuous cropping": 1781.000,
      "No-till - 1/3 fallow": 2190.000,
      "No-till - 1/2 fallow": 2947.000,
    };
  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    // Part A
    const water_in = formdata.get("water");
    const water_cm = water_in * 2.54;

    const harvest_idx = formdata.get("variety");

    const grain_yield_kg_per_ha = (154 * water_cm) - 905;
    const conv_1 = (2.2)*(1/2.47)*(1/60);
    const grain_yield_bu_per_ac = grain_yield_kg_per_ha * conv_1;

    const straw_prod_kg_per_ha = (grain_yield_kg_per_ha / harvest_idx) - grain_yield_kg_per_ha;
    const conv_2 = (2.2)*(1/2.47)*(1/2000);
    const straw_harvest_percent = formdata.get("straw-harvest-percent");
    const straw_yield_ton_per_ac = straw_prod_kg_per_ha * conv_2 * (straw_harvest_percent / 100);

    form["grain-yield"].value = Math.round(grain_yield_bu_per_ac);
    form["straw-yield"].value = straw_yield_ton_per_ac.toFixed(2);

    // Part B
    let nutrient_cost_usd_per_ac = 0;
    Object.keys(this.default_nutrient_params).forEach((key, idx) => {
      const concentration = formdata.get(key+"-concentration");
      const price_usd_per_lb = formdata.get(key+"-price");

      const removed_lb_per_ac = straw_yield_ton_per_ac * concentration * 2000;
      const cost_usd_per_ac = removed_lb_per_ac * price_usd_per_lb;
      nutrient_cost_usd_per_ac += cost_usd_per_ac;
      form[key+"-removal"].value = removed_lb_per_ac;
      form[key+"-cost"].value = cost_usd_per_ac;
    });
    form["nutrient-removal-cost"].value = nutrient_cost_usd_per_ac;

    // Part C
    let total_cation_removal_cec = 0;
    Object.entries(this.default_cation_params).forEach(([key, val], idx) => {
      const concentration = formdata.get(key+"-concentration");

      const removed_lb_per_ac = straw_yield_ton_per_ac * concentration * 2000;
      const removed_cec_per_ac = removed_lb_per_ac * val.coef_lb_to_cec;
      total_cation_removal_cec += removed_cec_per_ac;
      form[key+"-removal"].value = removed_lb_per_ac;
      form[key+"-cec"].value = removed_cec_per_ac;
    });
    form["total-cec-removal"].value = total_cation_removal_cec;
    const cec_concentration = formdata.get("liming-material");
    form["liming-material-cec"].value = cec_concentration;
    const liming_price_usd_per_ton = formdata.get("liming-material-price");
    const cation_removal_cost_usd_per_ac = (
      ((total_cation_removal_cec / cec_concentration)/2000) *
      liming_price_usd_per_ton
    ) + 10 // application cost per Ac
    form["cation-removal-cost"].value = cation_removal_cost_usd_per_ac;

    // Part D
    const msc = formdata.get("cropping-system");
    form["c-maintenance"].value = msc;
    const c_concentration = formdata.get("c-concentration");
    const c_straw_removal = c_concentration * straw_yield_ton_per_ac * 2000;
    const c_remaining = (c_straw_removal/((straw_harvest_percent/100))) - c_straw_removal;
    form["c-straw-removal"].value = c_straw_removal;
    form["c-remaining"].value = c_remaining;

    // Part E
    const straw_price_usd_per_ton = formdata.get("straw-sale-price");
    const straw_revenue_usd_per_ac = straw_price_usd_per_ton * straw_yield_ton_per_ac;
    form["straw-revenue"].value = straw_revenue_usd_per_ac;
    const operating_costs = formdata.get("operating-costs");
    const removal_related_costs = cation_removal_cost_usd_per_ac + nutrient_cost_usd_per_ac;
    form["removal-related-costs"].value = removal_related_costs;
    const profit = straw_revenue_usd_per_ac - operating_costs - removal_related_costs;
    form["profit"].value = profit;
    form["soc-status"].value = (c_remaining >= c_straw_removal) ?
                                "Above SOC Maintenance Level" :
                                "Below SOC Maintenance Level";
  }
    
  connectedCallback() {
    const cec = html`<i data-tooltip="Cation Exchange Capacity">CEC</i>`;
    this.insertAdjacentHTML("afterbegin", html`
      <article>
        <header>Straw Removal Calculator </header>
        <form>
          <section id="part-a">
            <label><strong> A: Estimate grain and straw yield from available moisture </strong></label>
            <div class="grid">
              <label for="water">1. Available water (in)</label>
              <input type="number" step="any" id="water" name="water">
            </div>
            <div class="grid">
              <label for="unr">2. Variety </label>
              <select name="variety" id="variety">
                ${
                  Object.entries(this.harvest_indices).map(([key, val]) => {return `
                    <option value="${val}">${key}</option>
                  `}).join("")    
                }
              </select>
            </div>
            <div class="grid">
              <label for="straw-harvest-percent">3. Straw harvest (%)</label>
              <input
                type="number"
                step="any"
                id="straw-harvest-percent"
                name="straw-harvest-percent"
                min="0"
                max="100"
              >
            </div>
            <div class="grid">
              <label for="grain-yield">4. Grain yield (bu/Ac)</label>
              <input type="number" id="grain-yield" name="grain-yield" disabled>
            </div>
            <div class="grid">
              <label for="straw-yield">5. Straw yield (Ton/Ac)</label>
              <input type="number" id="straw-yield" name="straw-yield" disabled>
            </div>
          </section>
          <section id="part-b">
            <label><strong> B: Estimate Nutrient Removal </strong></label>
            ${
              Object.entries(this.default_nutrient_params).map(([key, val], idx) => {return `
                <div class="grid">
                  <label for="${key}-concentration">${idx+1}a. ${key} Concentration (lbs/lb)</label>
                  <input
                    type="number"
                    step="any"
                    id="${key}-concentration"
                    name="${key}-concentration"
                    value=${val.concentration_lb_per_lb}
                  >
                </div>
                <div class="grid">
                  <label for="${key}-price">${idx+1}b. ${key} Price ($/lb)</label>
                  <input
                    type="number"
                    step="any"
                    id="${key}-price"
                    name="${key}-price"
                    value=${val.cost_usd_per_lb}
                  >
                </div>
                <div class="grid tabbed">
                  <label for="${key}-removal">&mdash; Removal (lbs/Ac)</label>
                  <input type="number" id="${key}-removal" name="${key}-removal" disabled>
                </div>
                <div class="grid tabbed">
                  <label for="${key}-cost">&mdash; Cost ($/Ac)</label>
                  <input type="number" id="${key}-cost" name="${key}-cost" disabled>
                </div>
              `}).join("")
            }
            <div class="grid">
              <label for="nutrient-removal-cost">
                ${Object.entries(this.default_nutrient_params).length+1}. Total Nutrient Removal Cost (lbs/Ac)
              </label>
              <input type="number" id="nutrient-removal-cost" name="nutrient-removal-cost" disabled>
            </div>
          </section>
          <section id="part-c">
            <label><strong> C: Estimate Cation Removal </strong></label>
            ${
              Object.entries(this.default_cation_params).map(([key, val], idx) => {return `
                <div class="grid">
                  <label for="${key}-concentration">${idx+1} ${key} Concentration (lbs/lb)</label>
                  <input
                    type="number"
                    step="any"
                    id="${key}-concentration"
                    name="${key}-concentration"
                    value=${val.concentration_lb_per_lb}
                  >
                </div>
                <div class="grid tabbed">
                  <label for="${key}-removal">&mdash; Removal (lbs/Ac)</label>
                  <input type="number" id="${key}-removal" name="${key}-removal" disabled>
                </div>
                <div class="grid tabbed">
                  <label for="${key}-cec">&mdash; Cation Removal (${cec}/Ac)</label>
                  <input type="number" id="${key}-cec" name="${key}-cec" disabled>
                </div>
              `}).join("")
            }
            <div class="grid">
              <label for="total-cec-removal">
                ${Object.entries(this.default_cation_params).length+1}. Total CEC Removal (${cec}/Ac)
              </label>
              <input type="number" id="total-cec-removal" name="total-cec-removal" disabled>
            </div>
            <div class="grid">
              <label for="liming-material">
                ${Object.entries(this.default_cation_params).length+2}. Liming Material
              </label>
              <select name="liming-material" id="liming-material">
                ${
                  Object.entries(this.liming_materials_cec).map(([key, val]) => {return `
                    <option value="${val}">${key}</option>
                  `})
                }
              </select>
            </div>
            <div class="grid tabbed">
              <label for="liming-material-cec"> &mdash; Liming Material Strength (${cec}) </label>
              <input type="number" id="liming-material-cec" name="liming-material-cec" disabled>
            </div>
            <div class="grid">
              <label for="liming-material-price">
                ${Object.entries(this.default_cation_params).length+3}. Liming Material Price ($/ton)
              </label>
              <input
                type="number"
                step="any"
                id="liming-material-price"
                name="liming-material-price"
                value="${this.liming_materials_price_usd_per_ton}"
              >
            </div>
            <div class="grid">
              <label for="cation-removal-cost">
                ${Object.entries(this.default_cation_params).length+4}. Total Cation Removal Cost ($/Ac)
              </label>
              <input type="number" id="cation-removal-cost" name="cation-removal-cost" disabled>
            </div>
          </section>
          <section id="part-d">
            <label><strong> D: Soil Organic Carbon Removal </strong></label>
            <div class="grid">
              <label for="cropping-system">1. Cropping System</label>
              <select name="cropping-system" id="cropping-system">
                ${
                  Object.entries(this.msc_lbsC_per_ac).map(([key, val]) => {return `
                    <option value="${val}">${key}</option>
                  `})
                }
              </select>
            </div>
            <div class="grid tabbed">
              <label for="c-maintenance">&mdash; Maintenance C (lbs/Ac)</label>
              <input type="number" id="c-maintenance" name="c-maintenance" disabled>
            </div>
            <div class="grid">
              <label for="c-concentration">2. C Concentration</label>
              <input type="number" step="any" id="c-concentration" name="c-concentration" value="0.45">
            </div>
            <div class="grid tabbed">
              <label for="c-straw-removal">&mdash; C Removed from Straw (lbs/Ac)</label>
              <input type="number" id="c-straw-removal" name="c-straw-removal" disabled>
            </div>
            <div class="grid tabbed">
              <label for="c-remaining">&mdash; C Remaining (lbs/Ac)</label>
              <input type="number" id="c-remaining" name="c-remaining" disabled>
            </div>
          </section>
          <section id="part-e">
            <label><strong> E: Final Balance </strong></label>
            <div class="grid">
              <label for="straw-sale-price">1. Straw Sale Price ($/Ton) </label>
              <input type="number" step="any" id="straw-sale-price" name="straw-sale-price" value="60">
            </div>
            <div class="grid tabbed">
              <label for="straw-revenue">&mdash; Estimated Straw revenue ($/Ac) </label>
              <input type="number" step="any" id="straw-revenue" name="straw-revenue" disabled>
            </div>
            <div class="grid">
              <label for="operating-costs">2. Operating Costs ($/Ac) </label>
              <input type="number" step="any" id="operating-costs" name="operating-costs" value="40">
            </div>
            <div class="grid">
              <label for="removal-related-costs">3. Removal-related Costs ($/Ac) </label>
              <input type="number" step="any" id="removal-related-costs" name="removal-related-costs" disabled>
            </div>
            <div class="grid result">
              <label for="profit">4. Net Profit ($/Ac) </label>
              <input type="number" step="any" id="profit" name="profit" readonly>
            </div>
            <div class="grid result">
              <label for="soc-status">5. SOC Status </label>
              <input type="text" step="any" id="soc-status" name="soc-status" readonly>
            </div>
          </section>
          <div class="grid">
            <input type="submit" value="Calculate" />
            <input type="reset" value="Reset" />
          </div>
    `);

    const form = this.querySelector("form");
    form.addEventListener('submit', this.handleSubmit.bind(this))
  }
});
