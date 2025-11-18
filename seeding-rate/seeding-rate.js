import { html } from "../index.js";

customElements.define("seeding-rate", class extends HTMLElement {
  constructor() {
    super();
    this.mappings = {
      "lbs-per-ac": {
        "lbs-per-ac" : (_0, _1, rate) => rate,
        "seeds-per-sqft" : (seeds_per_lb, germ_percent, rate) => (seeds_per_lb*germ_percent*rate)/43560,
        "seeds-per-ac" : (seeds_per_lb, germ_percent, rate) => seeds_per_lb*germ_percent*rate,
      },
      "seeds-per-sqft": {
        "lbs-per-ac" : (seeds_per_lb, germ_percent, rate) => (1/(seeds_per_lb*germ_percent))*rate*43560,
        "seeds-per-sqft" : (_0, _1, rate) => rate,
        "seeds-per-ac" : (seeds_per_lb, germ_percent, rate) => seeds_per_lb*germ_percent*((1/(seeds_per_lb*germ_percent))*rate*43560),
      },
      "seeds-per-ac": {
        "lbs-per-ac" : (seeds_per_lb, germ_percent, rate) => (1/(seeds_per_lb*germ_percent))*rate,
        "seeds-per-sqft" : (_0, _1, rate) => rate/43560,
        "seeds-per-ac" : (_0, _1, rate) => rate,
      },
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formdata = new FormData(form);

    const seeds_per_lb = formdata.get("seeds-per-lb");
    const germ_percent = formdata.get("germ-percent")/100; //convert percent to decimal
    const rate_unit = formdata.get("rate-unit");
    const rate = formdata.get("rate");
    Object.entries(this.mappings[rate_unit]).forEach(([unit, f]) => {
      form[unit].value = f(seeds_per_lb, germ_percent, rate).toLocaleString(undefined, {'maximumFractionDigits': 0});
    })
    
  }
    
  connectedCallback() {
    this.insertAdjacentHTML("afterbegin", html`
      <article>
        <header>Seeding Rate Calculator </header>
        <form>
          <div class="grid">
            <label for="seeds-per-lb">1. Seeds per pound </label>
            <input type="number" step="any" id="seeds-per-lb" name="seeds-per-lb">
          </div>
          <div class="grid">
            <label for="germ-percent">2. Germination Percentage </label>
            <input type="number" step="any" id="germ-percent" name="germ-percent">
          </div>
          <div class="grid">
            <label for="rate-unit">3. Targeted seed rate unit </label>
            <select name="rate-unit" id="rate-unit">
              <option value="lbs-per-ac">lbs/Ac</option>
              <option value="seeds-per-sqft">seeds/sqft</option>
              <option value="seeds-per-ac">seeds/Ac</option>
            </select>
          </div>
          <div class="grid">
            <label for="rate">3. Targeted seed rate value </label>
            <input type="number" step="any" id="rate" name="rate">
          </div>
          <div class="grid result">
            <label for="lbs-per-ac">4. Pounds per Acre </label>
            <input type="text" id="lbs-per-ac" name="lbs-per-ac" readonly>
          </div>
          <div class="grid result">
            <label for="seeds-per-sqft">5. Seeds per Square Foot </label>
            <input type="text" id="seeds-per-sqft" name="seeds-per-sqft" readonly>
          </div>
          <div class="grid result">
            <label for="seeds-per-ac">6. Seeds per Acre </label>
            <input type="text" id="seeds-per-ac" name="seeds-per-ac" readonly>
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
