// scripts/svg-to-ts.js
const fs = require('fs');
const path = require('path');

function generateTSFiles() {
  const outpuDir = './ts_files';
  const inputDir = './svgs';
  const files = fs.readdirSync(inputDir);

  files.forEach(file => {
    if (file.endsWith('.svg')) {
      const svgContent = fs.readFileSync(path.join(inputDir, file), 'utf8');
      const tsContent = `export default \`${svgContent.replace(/`/g, '\\`')}\`;`;
      let ts_file = file.replaceAll('-', '_');
      ts_file = ts_file.replaceAll('.svg', '_icon.ts');
      const tsFileName = path.join(outpuDir, ts_file);
      fs.writeFileSync(tsFileName, tsContent);
      console.log(`✅ Converted ${file} → ${path.basename(tsFileName)}`);
    }
  });
}

function makeIndexFile() {
  const tsFilesDir = './ts_files';
  const files = fs
    .readdirSync(tsFilesDir)
    .filter(f => f.endsWith('.ts') && f !== 'index.ts');

  const imports = files
    .map(f => {
      const name = f.replace('.ts', '');
      return `import ${name} from './ts_files/${name}';`;
    })
    .join('\n');

  const exports =
    `export const SvgIcons = {\n` +
    files
      .map(f => {
        const name = f.replace('.ts', '');
        let icon_name = name.replaceAll('_', '').toUpperCase();
        icon_name = icon_name.substring(0, icon_name.length - 4);
        return `  '${name}': { svg: ${name}, name: '${icon_name}' },`;
      })
      .join('\n') +
    `\n};\n`;

  const iconsDir = './';
  fs.writeFileSync(path.join(iconsDir, 'index.ts'), `${imports}\n\n${exports}`);
  console.log('✅ icons/index.ts generated.');
}
generateTSFiles();
makeIndexFile();
