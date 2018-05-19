const spawn = require('cross-spawn');
const chalk = require('chalk');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const commander = require('commander');
const validateProjectName = require('validate-npm-package-name');
const packageJson = require('../package.json');

let projectName;
let devDependencies = ['webpack', 'webpack-cli', 'html-webpack-plugin', 'clean-webpack-plugin', 'webpack-dev-server', 'css-loader', 'webpack-merge', 'style-loader', 'babel-preset-env', 'babel-loader', 'babel-polyfill', 'babel-preset-react'];
let dependencies = ['react', 'react-dom'];

const program = commander
    .version(packageJson.version)
    .usage('create-react [options]')
    .arguments('<project-name>')
    .action(name => {
        projectName = name;
    })
    .allowUnknownOption()
    .parse(process.argv);

if(projectName == undefined) {
    console.log(chalk.red('Please pass the project name while using create-react!'));
    console.log(chalk.green('for example:'))
    console.log();
    console.log('create-react-application react-app');
}
else {
    const validateResult = validateProjectName(projectName);
    if(validateResult.validForNewPackages) {
        copyTemplates();
        generatePackageJson();
        installAll();
        //console.log(chalk.green(`Congratulations! React app has been created successfully in ${process.cwd()}`));
    }
    else {
        console.log(chalk.red('The project name given is invalid!'));
        process.exit(1);
    }
}

function installAll() {
    console.log(chalk.green('Start installing ...'));
    const child = spawn('cnpm', ['install', '-D'].concat(devDependencies), { 
        stdio: 'inherit' 
    });
    
    child.on('close', function(code) {
        if(code !== 0) {
            console.log(chalk.red('Error occured while installing dependencies!'));
            process.exit(1);
        }
        else {
            const child = spawn('cnpm', ['install', '--save'].concat(dependencies), {
                stdio: 'inherit'
            })
            child.on('close', function(code) {
                if(code !== 0) {
                    console.log(chalk.red('Error occured while installing dependencies!'));
                    process.exit(1);
                }
                else {
                    console.log(chalk.green('Installation completed successfully!'));
                    console.log();
                    console.log(chalk.green('Start the local server with : '))
                    console.log();
                    console.log(chalk.cyan('    npm run start'))
                    console.log();
                    console.log(chalk.green('or build your app via :'));
                    console.log();
                    console.log(chalk.cyan('    npm run build'));
                }
            })
        }
    });
}

function copyTemplates() {
    try {
        if(!fs.existsSync(path.resolve(__dirname, '../templates'))) {
            console.log(chalk.red('Cannot find the template files !'));
            process.exit(1);
        }
        fs.copySync(path.resolve(__dirname, '../templates'), process.cwd());
        console.log(chalk.green('Template files copied successfully!'));
        return true;
    }
    catch(e) {
        console.log(chalk.red(`Error occured: ${e}`))
    }
}

function generatePackageJson() {
    let packageJson = {
        name: projectName,
        version: '1.0.0',
        description: '',
        scripts: {
            start: 'webpack-dev-server --open --config webpack.dev.conf.js',
            build: 'webpack --config webpack.prod.conf.js'
        },
        author: '',
        license: ''
    };
    try {
        fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), JSON.stringify(packageJson));
        console.log(chalk.green('Package.json generated successfully!'));
    }
    catch(e) {
        console.log(chalk.red(e))
    }
}