import { html } from "../index.js";

customElements.define("fertilizer-calc", class extends HTMLElement {
  constructor() {
    super();
    this.unr_lookup = {
      1000: 12.2,
      1200: 11.0,
      1400: 10.1,
      1600: 9.4,
      1800: 8.8,
      2000: 8.3,
      2200: 7.9,
      2400: 7.5,
      2600: 7.2
    };
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

    const mineralized = formdata.get("som") * (formdata.get("till") ? 17 : 20);
    form['mineralized'].value = mineralized;

    const total_n = mineralized + (+formdata.get("test-nitrate")) + (+formdata.get("test-ammonium"));
    form['total-n'].value = total_n;

    form['fertilizer-n'].value = required_n - total_n;
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <article>
        <header>Nitrogen Fertilizer Calculator </header>
        <form>
          <div class="grid">
            <label for="yield">Step 1: Estimate yield (lbs/Ac)</label>
            <input type="number" id="yield" name="yield">
          </div>
          <div class="grid">
            <label for="unr">Step 2: UNR (lbs N/100 lbs canola)</label>
            <input type="number" id="unr" name="unr" disabled>
          </div>
          <div class="grid">
            <label for="required-n">Step 3: Calculate total N required (lbs/Ac)</label>
            <input type="number" id="required-n" name="required-n" disabled>
          </div>
          <div class="grid">
            <label>Step 4: Calculate available N</label>
          </div>
          <div class="grid">
            <label for="test-nitrate" class="tabbed">a. Nitrate from Soil Test (lbs/Ac)</label>
            <input type="number" id="test-nitrate" name="test-nitrate">
          </div>
          <div class="grid">
            <label for="test-ammonium" class="tabbed">b. Ammonium from Soil Test (lbs/Ac)</label>
            <input type="number" id="test-ammonium" name="test-ammonium">
          </div>
          <div class="grid">
            <label for="test-mineralized" class="tabbed">c. Mineralized from Soil Test (lbs/Ac)</label>
            <input type="number" id="mineralized" name="mineralized" disabled>
          </div>
          <div class="grid">
            <label for="som" class="tabbed">— Soil Organic Matter (%)</label>
            <input type="number" id="som" name="som">
          </div>
          <div class="grid">
            <label for="till" class="tabbed">— Do you till? </label>
            <input type="checkbox" id="till" name="till">
          </div>
          <div class="grid">
            <label for="total-n" class="tabbed">d. Total N</label>
            <input type="number" id="total-n" name="total-n" disabled>
          </div>
          <div class="grid result">
            <label for="required-n">Step 5: Required fertilizer N (lbs/Ac)</label>
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
