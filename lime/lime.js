import "./mehlich.js";
import "./soilom-excal.js";
import "./soilom-ph.js";
import "./smp-ph.js";
import "./base-saturation.js";
import "./reserve-acidity.js";

export function adjust_lre(lre, form, formdata) {
  console.log(lre);
  const depth = formdata.get("depth");
  const lime_cce = formdata.get("lime-cce");
  const adj = (lre/(lime_cce/100))*(depth/6);
  form["lre-adj"].value = adj.toLocaleString(undefined, {'maximumFractionDigits': 0});
} 
