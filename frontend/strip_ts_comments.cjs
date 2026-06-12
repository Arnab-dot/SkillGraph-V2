const fs = require('fs');
const strip = require('strip-comments');
const { globSync } = require('glob');

const files = globSync('src/**/*.{ts,tsx}');

files.forEach(file => {
    try {
        let code = fs.readFileSync(file, 'utf8');
        let stripped = strip(code);
        fs.writeFileSync(file, stripped);
        console.log(`Stripped ${file}`);
    } catch (err) {
        console.error(`Failed ${file}:`, err);
    }
});
