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
      name: 'platformUrl',
      message: 'Platform URL:',
      default: 'https://mock.vibeplatform.dev'
    },
    {
      type: 'input',
      name: 'projectId',
      message: 'Project ID:',
      default: 'demo-project'
    },
    {
      type: 'input',
      name: 'token',
      message: 'Authentication token:',
      default: 'vibe_sk_1234'
    },
    {
      type: 'list',
      name: 'outputFormat',
      message: 'Output format:',
      choices: ['react-tailwind', 'react-css', 'vue-tailwind', 'angular-css'],
      default: 'react-tailwind'
    }
  ]);

  // Create configuration object
  const config = {
    platformUrl: answers.platformUrl,
    projectId: answers.projectId,
    token: answers.token,
    outputFormat: answers.outputFormat
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
