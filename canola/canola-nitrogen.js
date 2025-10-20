import { html } from "../index.js";

customElements.define("canola-nitrogen", class extends HTMLElement {
  constructor() {
    super();
    // lbs N / 100lbs Canola
    this.unr_lookup = {
      1000: 13.0,
      1200: 11.6,
      1400: 10.6,
      1600: 9.8,
      1800: 9.1,
      2000: 8.5,
      2200: 8.1,
      2400: 7.7,
      2600: 7.3
    };
    // N lb/A
    this.preceeding_crop = {
      peas_gt_2500: 20,
      peas_bt_1500_2500: 15,
      peas_lt_1500: 10,
      winter_peas: 80, // IZZY NOTE: this is listed as a dubious source in the Excel, I should ask about this
      lentils_gt_1000: 10,
      alfalfa: 50,
      fallow: 0,
      winter_wheat: -35,
      spring_wheat: -30,
      spring_barley: -25
    }
  }

  less_than_map(input, obj) {
    let last = 0;
    for (const [key, value] of Object.entries(obj)) {
      if (input < key) return last
      else last = value
    }
  }
  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const unr = this.less_than_map(formdata.get("yield"), this.unr_lookup);
    form['unr'].value = unr;

    const required_n = unr * formdata.get("yield");
    form['required-n'].value = required_n;

    const crop_credit = this.preceeding_crop[formdata.get("preceeding-crop-type")]
    form['preceeding-crop-balance'].value = crop_credit;

    const som_n = formdata.get("som") * (formdata.get("till") ? 17 : 20);
    form['som-n'].value = som_n;

    const total_n = crop_credit +
                    som_n +
                    (+formdata.get("test-nitrate")) +
                    (+formdata.get("other_source"));
    form['total-n'].value = total_n;

    form['fertilizer-n'].value = required_n - total_n;
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <article>
        <header>Dryland Spring Canola Nitrogen Needs </header>
        <form>
          <label><strong> A: N supply needed to meet yield goal </strong></label>
          <div class="grid">
            <label for="yield">1. Estimate yield (lbs canola/Ac)</label>
            <input type="number" id="yield" name="yield">
          </div>
          <div class="grid">
            <label for="unr">2. UNR (lbs N/100 lbs canola)</label>
            <input type="number" id="unr" name="unr" disabled>
          </div>
          <div class="grid">
            <label for="required-n">3. Calculate total N required (lbs N/Ac)</label>
            <input type="number" id="required-n" name="required-n" disabled>
          </div>
          <label><strong>B: Soil N inventory </strong></label>
          <div class="grid">
            <label for="test-nitrate">1. Nitrate from Soil Test (lbs N/Ac)</label>
            <input type="number" id="test-nitrate" name="test-nitrate">
          </div>
          <div class="grid">
            <label for="preceeding-crop-type">2. Preceeding crop type</label>
            <select name="preceeding-crop-type" id="precceeding-crop-type">
              <option value="peas_gt_2500"> Peas &gt; 2500 lbs/Ac </option>
              <option value="peas_bt_1500_2500"> Peas 1500-2500 lbs/Ac </option>
              <option value="peas_lt_1500"> Peas &lt; 1500 lbs/Ac </option>
              <option value="winter_peas"> Winter Peas </option>
              <option value="lentils_gt_1000"> Lentils &gt; 1000 lbs/Ac </option>
              <option value="alfalfa"> Alfalfa </option>
              <option value="fallow"> Fallow </option>
              <option value="winter_wheat"> Winter Wheat </option>
              <option value="spring_wheat"> Spring Wheat </option>
              <option value="spring_barley"> Spring Barley </option>
            </select>
          </div>
          <div class="grid tabbed">
            <label for="preceeding-crop-balance">&mdash; Preceeding crop debit/credit</label>
            <input type="number" name="preceeding-crop-balance" id="preceeding-crop-balance" disabled>
          </div>
          <div class="grid">
            <label for="som">3. Soil Organic Matter (%)</label>
            <input type="number" id="som" name="som" min="0" max="100">
          </div>
          <div class="grid tabbed">
            <label for="till">&mdash; Do you till? </label>
            <input type="checkbox" id="till" name="till">
          </div>
          <div class="grid tabbed">
            <label for="som-n">&mdash; Credit from organic matter (lbs/Ac)</label>
            <input type="number" id="som-n" name="som-n" disabled>
          </div>
          <div class="grid">
            <label for="other-source">4. Other credits (lbs/Ac)</label>
            <input type="number" id="other-source" name="other-source" value="0">
          </div>
          <div class="grid">
            <label for="total-n">5. Total N</label>
            <input type="number" id="total-n" name="total-n" disabled>
          </div>
          <label><strong> C: Fertilizer Recommendation </strong></label>
          <div class="grid result">
            <label for="required-n">1: Required fertilizer N (lbs/Ac)</label>
            <input type="number" id="fertilizer-n" name="fertilizer-n" readonly>
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
