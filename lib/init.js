const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');

module.exports = async function init() {
  console.log(chalk.blue('🎯 Initializing vibe configuration...'));
  
  // Check if .vibecode.json already exists
  const configPath = path.join(process.cwd(), '.vibecode.json');
  if (fs.existsSync(configPath)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: '.vibecode.json already exists. Do you want to overwrite it?',
        default: false
      }
    ]);
    
    if (!overwrite) {
      console.log(chalk.yellow('Initialization cancelled.'));
      return;
    }
  }

  // Prompt for configuration values
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'platform',
      message: 'Platform URL:',
      default: 'https://app.base44.com'
    },
    {
      type: 'input',
      name: 'projectId',
      message: 'App ID:',
      default: '687c574f2fee44ff01919f93'
    },
    {
      type: 'input',
      name: 'accessKey',
      message: 'API Key:',
      default: '6c3f465b53514c32add34efa35d7f430'
    },
    {
      type: 'list',
      name: 'output',
      message: 'Output format:',
      choices: ['react-tailwind', 'react-css', 'vue-tailwind', 'angular-css'],
      default: 'react-tailwind'
    }
  ]);

  // Create configuration object
  const config = {
    platform: answers.platform,
    projectId: answers.projectId,
    accessKey: answers.accessKey,
    output: answers.output
  };

  // Write configuration file
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green('✅ Configuration saved to .vibecode.json'));
    console.log(chalk.gray('You can now use "vibe pull <component-name>" to download components.'));
  } catch (error) {
    throw new Error(`Failed to write configuration file: ${error.message}`);
  }
};
