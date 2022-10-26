const fs = require('fs');
const path = require('path');
const argvs = process.argv.slice(2);
if (!argvs.length) throw new Error('miss link <package> arguments');

const cwd = process.cwd();
const pack = argvs[0];
const source = path.resolve(cwd, 'packages', pack);

if (!fs.existsSync(source)) throw new Error('cannot find the package ' + pack);

const pkgPath = path.resolve(source, 'package.json');
if (!fs.existsSync(pkgPath)) throw new Error('cannot find the package.json of ' + pack);
const pkg = require(pkgPath);
const name = pkg.name;
const dir = name.split('/')[0];
const dirpath = path.resolve(cwd, 'node_modules', dir);
if (!fs.existsSync(dirpath)) fs.mkdirSync(dirpath);
const target = path.resolve(cwd, 'node_modules', name);

fs.symlinkSync(source, target);
console.log('+', name, '->', 'node_modules/' + name)