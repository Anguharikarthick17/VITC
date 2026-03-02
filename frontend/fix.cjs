const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

// The formatter is injecting spaces like rgba(168, 85, 247, 0.4)
// Let's just strip ALL rgba(...) and replace with hex using regex
css = css.replace(/rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*0\.2\s*\)/g, '#06b6d433');
css = css.replace(/rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*0\.3\s*\)/g, '#06b6d44c');
css = css.replace(/rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*0\.4\s*\)/g, '#06b6d466');
css = css.replace(/rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*0\.5\s*\)/g, '#06b6d480');
css = css.replace(/rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*0\.6\s*\)/g, '#06b6d499');
css = css.replace(/rgba\(\s*6\s*,\s*182\s*,\s*212\s*,\s*0\.7\s*\)/g, '#06b6d4b2');

css = css.replace(/rgba\(\s*168\s*,\s*85\s*,\s*247\s*,\s*0\.2\s*\)/g, '#a855f733');
css = css.replace(/rgba\(\s*168\s*,\s*85\s*,\s*247\s*,\s*0\.3\s*\)/g, '#a855f74c');
css = css.replace(/rgba\(\s*168\s*,\s*85\s*,\s*247\s*,\s*0\.4\s*\)/g, '#a855f766');
css = css.replace(/rgba\(\s*168\s*,\s*85\s*,\s*247\s*,\s*0\.5\s*\)/g, '#a855f780');
css = css.replace(/rgba\(\s*168\s*,\s*85\s*,\s*247\s*,\s*0\.7\s*\)/g, '#a855f7b2');

css = css.replace(/rgba\(\s*225\s*,\s*29\s*,\s*72\s*,\s*0\.2\s*\)/g, '#e11d4833');
css = css.replace(/rgba\(\s*225\s*,\s*29\s*,\s*72\s*,\s*0\.3\s*\)/g, '#e11d484c');
css = css.replace(/rgba\(\s*225\s*,\s*29\s*,\s*72\s*,\s*0\.4\s*\)/g, '#e11d4866');
css = css.replace(/rgba\(\s*225\s*,\s*29\s*,\s*72\s*,\s*0\.5\s*\)/g, '#e11d4880');

css = css.replace(/rgba\(\s*234\s*,\s*179\s*,\s*8\s*,\s*0\.2\s*\)/g, '#eab30833');
css = css.replace(/rgba\(\s*234\s*,\s*179\s*,\s*8\s*,\s*0\.3\s*\)/g, '#eab3084c');

css = css.replace(/rgba\(\s*16\s*,\s*185\s*,\s*129\s*,\s*0\.2\s*\)/g, '#10b98133');
css = css.replace(/rgba\(\s*16\s*,\s*185\s*,\s*129\s*,\s*0\.3\s*\)/g, '#10b9814c');

css = css.replace(/rgba\(\s*217\s*,\s*70\s*,\s*239\s*,\s*0\.2\s*\)/g, '#d946ef33');
css = css.replace(/rgba\(\s*217\s*,\s*70\s*,\s*239\s*,\s*0\.3\s*\)/g, '#d946ef4c');

css = css.replace(/rgba\(\s*249\s*,\s*115\s*,\s*22\s*,\s*0\.2\s*\)/g, '#f9731633');
css = css.replace(/rgba\(\s*249\s*,\s*115\s*,\s*22\s*,\s*0\.3\s*\)/g, '#f973164c');

css = css.replace(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.3\s*\)/g, '#0000004c');

fs.writeFileSync('src/index.css', css);
console.log('Fixed CSS hexes with spaces');
