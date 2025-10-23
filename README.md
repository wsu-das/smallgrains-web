# New Small Grains Web (WIP !!!)
This repository hosts the fully-rewritten version of WSU CAHNRS's Small Grains calculator suite as well as the excel sheets that they are based off of. 
The exception to this is the larger variety selection tool, which lives elsewhere but it `iframe'd` into this website for convenience.  

**Currently implemented calculators:**
| Status | Name                             | Notes                                                                                                |
|--------|----------------------------------|------------------------------------------------------------------------------------------------------|
| 🚧      | Variety Selection Tool `iframe`  | The site currently blocks being rendered inside another website. Need to get added to the whitelist. |
| ✅      | Nitrogen Fertilizer              |                                                                                                      |
| 🚧      | Lime Requirement Estimate        | Excel sheet is locked, awaiting unlocked version to work from                                        |
| ❌      | Residue Production Calculator    | Awaiting Excel sheet for reference                                                                   |
| ❌      | Seeding Rate Converter           | Awaiting Excel sheet for reference                                                                   |
| ✅      | Spring Canola Nitrogen Rate      |                                                                                                      |
| ✅      | Post-Harvest Nitrogen Efficiency |                                                                                                      |
| ✅      | Straw Removal                    | Needs clarification on "CCE/CEC(?)" units                                                            |

## Development details
This is a dead-simple static website, and as such it is being hosted on GitHub Pages to save us the infrastructural headache of putting it on our own VPS.
In my (Izzy's) humble opinion, this is the web as it generally should be for 90% of websites that don't involve a database or authentication. If you look
through the code you will find that there are no
- JS frameworks
- JS packages
- jQuery
- Bootstrap
- Tailwind
- etc

and it would be preferable if it stayed that way!  

This project is both a rescue operation for the small grains calculators and an experiement in designing front-ends with modern web standards, using the
best new options available to us in plain ol' HTML, CSS, and JavaScript in all browsers (IE doesn't count!). The most important of these is Web Components.
This isn't even a particularly _new_ feature, per se, and to be honest it can be a contentious one among frontend devs. I understand their concerns, and
respectfully I think they're wrong, stemming from the obsessive addiction to overcomplicated website design. I also think that Mozilla has done a lot of
damage to the Web Component standard's reputation by pushing the Shadow DOM so hard; this is also a consequence of everyone's addiction to overcomplicated
frontend. I say: trust in semantic HTML+CSS, and feel your JavaScript burden evaporate.  

The one big import for this project is [PicoCSS](https://picocss.com/). It is currently the best out-of-the-box setup for styling semantic HTML.
To be completely honest, as much as I love and appreciate both Pico and the principals it is built from, I think it is a very inelegant system and I (Izzy)
plan on creating a successor in my spare time in the near future using the wonderful features in available to us in modern baseline CSS.
