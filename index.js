
#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');
const ora = require('ora');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Configuration file path
const CONFIG_FILE = '.componenthub.json';

// Component Hub API base URL
const API_BASE_URL = 'http://localhost:3001';

// Utility function to load configuration
function loadConfig() {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(chalk.red('❌ Configuration file not found. Run "ch init" first.'));
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    return config;
  } catch (error) {
    console.log(chalk.red('❌ Failed to load configuration:', error.message));
    process.exit(1);
  }
}

// Utility function to make authenticated API requests
async function makeRequest(endpoint, config) {
  try {
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${config.accessKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error('Missing or invalid access key. Run "ch init" to configure authentication.');
        case 403:
          throw new Error('Invalid credentials. Please verify your project ID and access key.');
        case 404:
          throw new Error('Project not found. Please check your project ID.');
        default:
          throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
      }
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to Component Hub. Make sure the server is running on localhost:3001');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Request timeout. Please try again.');
    } else {
      throw new Error(`Network error: ${error.message}`);
    }
  }
}

// INIT Command
program
  .command('init')
  .description('Initialize Component Hub CLI configuration')
  .action(async () => {
    console.log(chalk.blue('🚀 Component Hub CLI Setup\n'));

    try {
      // Check if config already exists
      if (fs.existsSync(CONFIG_FILE)) {
        const { overwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'overwrite',
            message: 'Configuration file already exists. Overwrite?',
            default: false
          }
        ]);

        if (!overwrite) {
          console.log(chalk.yellow('Setup cancelled.'));
          return;
        }
      }

      // Gather configuration
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectId',
          message: 'Enter your Project ID:',
          validate: (input) => {
            if (!input.trim()) return 'Project ID is required';
            if (!/^.+-\d+$/.test(input)) return 'Project ID should be in format: project-name-timestamp';
            return true;
          }
        },
        {
          type: 'input',
          name: 'accessKey',
          message: 'Enter your Access Key:',
          validate: (input) => {
            if (!input.trim()) return 'Access Key is required';
            if (!input.startsWith('ch_')) return 'Access Key should start with "ch_"';
            if (input.length !== 35) return 'Access Key should be 35 characters long';
            return true;
          }
        }
      ]);

      const config = {
        projectId: answers.projectId.trim(),
        accessKey: answers.accessKey.trim(),
        apiUrl: API_BASE_URL
      };

      // Test connection
      const spinner = ora('Testing connection to Component Hub...').start();
      
      try {
        await makeRequest(`/api/projects/${config.projectId}`, config);
        spinner.succeed('Connection successful!');
        
        // Save configuration
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log(chalk.green('✅ Configuration saved to .componenthub.json'));
        console.log(chalk.gray('\nNext steps:'));
        console.log(chalk.gray('  ch list    - View available components'));
        console.log(chalk.gray('  ch pull    - Download all components'));
        
        // Add to .gitignore if it exists
        const gitignorePath = '.gitignore';
        if (fs.existsSync(gitignorePath)) {
          const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
          if (!gitignoreContent.includes('.componenthub.json')) {
            fs.appendFileSync(gitignorePath, '\n.componenthub.json\n');
            console.log(chalk.gray('Added .componenthub.json to .gitignore'));
          }
        }

      } catch (error) {
        spinner.fail('Connection failed');
        console.log(chalk.red('❌ Error:', error.message));
        process.exit(1);
      }

    } catch (error) {
      console.log(chalk.red('❌ Setup failed:', error.message));
      process.exit(1);
    }
  });

// LIST Command
program
  .command('list')
  .description('List all available components in your project')
  .action(async () => {
    const config = loadConfig();
    const spinner = ora('Fetching available components...').start();

    try {
      const data = await makeRequest(`/api/projects/${config.projectId}/components`, config);
      spinner.stop();

      if (!data.components || data.components.length === 0) {
        console.log(chalk.yellow('📦 No components found in this project.'));
        return;
      }

      console.log(chalk.blue('📦 Available Components:\n'));
      data.components.forEach((component, index) => {
        console.log(`${chalk.green(index + 1)}. ${chalk.bold(component.name)}`);
        if (component.description) {
          console.log(`   ${chalk.gray(component.description)}`);
        }
        console.log(`   ${chalk.gray('Version:')} ${component.version || '1.0.0'}`);
        console.log('');
      });

      console.log(chalk.gray(`Total: ${data.components.length} component(s)`));
      console.log(chalk.gray('Use "ch pull" to download all components'));

    } catch (error) {
      spinner.fail('Failed to fetch components');
      console.log(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

// PULL Command
program
  .command('pull')
  .description('Download all components to ./components directory')
  .option('-c, --component <name>', 'Download specific component by name')
  .action(async (options) => {
    const config = loadConfig();
    
    try {
      // Fetch available components
      let spinner = ora('Fetching component list...').start();
      const data = await makeRequest(`/api/projects/${config.projectId}/components`, config);
      
      if (!data.components || data.components.length === 0) {
        spinner.fail('No components found');
        console.log(chalk.yellow('📦 No components found in this project.'));
        return;
      }

      let componentsToDownload = data.components;

      // Filter for specific component if requested
      if (options.component) {
        componentsToDownload = data.components.filter(c => 
          c.name.toLowerCase() === options.component.toLowerCase()
        );
        
        if (componentsToDownload.length === 0) {
          spinner.fail('Component not found');
          console.log(chalk.red(`❌ Component "${options.component}" not found.`));
          console.log(chalk.gray('Available components:'), data.components.map(c => c.name).join(', '));
          return;
        }
      }

      spinner.succeed(`Found ${componentsToDownload.length} component(s) to download`);

      // Create components directory
      const componentsDir = './components';
      if (!fs.existsSync(componentsDir)) {
        fs.mkdirSync(componentsDir, { recursive: true });
        console.log(chalk.gray('Created ./components directory'));
      }

      // Download each component
      const downloadedFiles = [];
      
      for (const component of componentsToDownload) {
        spinner = ora(`Downloading ${component.name}...`).start();
        
        try {
          const componentData = await makeRequest(`/api/components/${component.id}`, config);
          
          // Generate component file content
          const fileContent = `/**
 * Component: ${component.name}
 * Description: ${component.description || 'No description available'}
 * Version: ${component.version || '1.0.0'}
 * Generated by: Component Hub CLI
 * Project: ${config.projectId}
 */

${componentData.code}`;

          // Save component file
          const fileName = `${component.name}.jsx`;
          const filePath = path.join(componentsDir, fileName);
          
          // Check if file exists and confirm overwrite
          if (fs.existsSync(filePath)) {
            const { overwrite } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'overwrite',
                message: `${fileName} already exists. Overwrite?`,
                default: false
              }
            ]);
            
            if (!overwrite) {
              spinner.warn(`Skipped ${component.name}`);
              continue;
            }
          }

          fs.writeFileSync(filePath, fileContent);
          downloadedFiles.push(fileName);
          spinner.succeed(`Downloaded ${component.name}`);
          
        } catch (error) {
          spinner.fail(`Failed to download ${component.name}`);
          console.log(chalk.red(`   Error: ${error.message}`));
        }
      }

      // Summary
      if (downloadedFiles.length > 0) {
        console.log(chalk.green('\n✅ Download Summary:'));
        downloadedFiles.forEach(file => {
          console.log(`   ${chalk.green('✓')} ${file}`);
        });
        console.log(chalk.gray(`\nComponents saved to: ${path.resolve(componentsDir)}`));
      } else {
        console.log(chalk.yellow('\n⚠️  No components were downloaded.'));
      }

    } catch (error) {
      console.log(chalk.red('❌ Error:', error.message));
      process.exit(1);
    }
  });

// CLI setup
program
  .name('ch')
  .description('Component Hub CLI - Download React components from your projects')
  .version('1.0.0');

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse();
