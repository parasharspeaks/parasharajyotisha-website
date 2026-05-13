Parashar Jyotisha Website — Step 1.5 Kundli Chart Fix

What changed in this step:
1. Fixed Lagna mismatch by reading textual rashi/sign values first, including nested API objects such as {name:'Simha'}.
2. Chart, summary, and planetary table now use the same rashi source.
3. Planet placement in South Indian and North Indian charts now follows the exact rashi/sign data from the API table.
4. North Indian chart text was simplified and made cleaner.
5. Standard convention used:
   - South Indian chart: fixed signs.
   - North Indian chart: fixed houses, signs move from Lagna.

Test first:
Open tools.html#kundli and generate the same chart. Confirm:
- Lagna summary, table badge, and highlighted chart Lagna match.
- Mercury, Mars, Saturn appear in the same rashi as the table.
- North Indian chart is readable.
