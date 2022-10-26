const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const childprocess = require('child_process');
const prompt = inquirer.createPromptModule();

prompt([
  {
    type: 'input',
    name: 'project',
    message: '请输入模块名称'
  }
]).then(data => {
  const dir = createProjectDir(data.project);
  createTypeScriptConfigFile(dir);
  createPackageFile(dir, data.project, data.bin);
  createReadme(dir, data.project);
  const src = createDir(dir, 'src');
  createIndexFile(src, data.project);
  childprocess.spawn('lerna', ['bootstrap'], {
    stdio: 'inherit'
  });
});

function createProjectDir(name) {
  const dir = path.resolve(process.cwd(), 'packages', name);
  fs.mkdirSync(dir);
  return dir;
}

function createTypeScriptConfigFile(dir) {
  const template = {
    "extends": "../../tsconfig.json",
    "extendsExact": true,
    "compilerOptions": {
      "declaration": true,
      "outDir": "dist",
    },
    "include": ["src"]
  }
  fs.writeFileSync(path.resolve(dir, 'tsconfig.json'), JSON.stringify(template, null, 2), 'utf8');
}

function createPackageFile(dir, project) {
  const template = {
    "name": "@codixjs/" + project,
    "version": "1.0.0",
    "description": "react web framework:" + project,
    "author": "shenyunjie ",
    "homepage": "https://github.com/cevio/drake/tree/master/packages/" + project,
    "license": "MIT",
    "main": "dist/index.js",
    "keywords": [
      "npm"
    ],
    "directories": {
      "lib": "src"
    },
    "files": [
      "dist"
    ],
    "scripts": {
      "build": "rm -rf ./dist && tsc",
    },
    "publishConfig": {
      "access": "public"
    }
  }
  fs.writeFileSync(path.resolve(dir, 'package.json'), JSON.stringify(template, null, 2), 'utf8');
}

function createReadme(dir, project) {
  const template = `# \`@codixjs/${project}\`

  > TODO: description
  
  ## Usage
  
  \`\`\`
  const container = require('@nppm/${project}');
  
  // TODO: DEMONSTRATE API
  \`\`\``;
  fs.writeFileSync(path.resolve(dir, 'README.md'), template, 'utf8');
}

function createDir(dir, name) {
  const _dir = path.resolve(dir, name);
  fs.mkdirSync(_dir);
  return _dir;
}

function createIndexFile(src) {
  fs.writeFileSync(path.resolve(src, 'index.ts'), `export const abc = 1;`, 'utf8');
}