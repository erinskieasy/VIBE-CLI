const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { getComponent } = require('../utils/api');

module.exports = async function pull(componentName) {
  console.log(chalk.blue(`🔄 Pulling component: ${componentName}`));
  
  // Check if .vibecode.json exists
  const configPath = path.join(process.cwd(), '.vibecode.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('No .vibecode.json found. Run "vibe init" first.');
  }

  // Read configuration
  let config;
  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
  } catch (error) {
    throw new Error(`Failed to read configuration: ${error.message}`);
  }

  // Validate required config fields
  if (!config.platformUrl || !config.projectId || !config.token) {
    throw new Error('Invalid configuration. Please run "vibe init" again.');
  }

  // Fetch component from API
  console.log(chalk.gray('Fetching component data...'));
  const component = await getComponent(componentName, config);
  
  if (!component) {
    throw new Error(`Component "${componentName}" not found. Available components: Button, Card`);
  }

  // Ensure src/components directory exists
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
    console.log(chalk.gray('Created src/components directory'));
  }

  // Generate component file content with metadata
  const fileContent = `// vibe-source: ${config.platformUrl}/components/${component.name}
// version: ${component.version}

${component.code}`;

  // Write component file
  const fileName = `${component.name}.tsx`;
  const filePath = path.join(componentsDir, fileName);
  
  try {
    fs.writeFileSync(filePath, fileContent);
    console.log(chalk.green(`✅ Component saved to src/components/${fileName}`));
    console.log(chalk.gray(`   Source: ${config.platformUrl}/components/${component.name}`));
    console.log(chalk.gray(`   Version: ${component.version}`));
  } catch (error) {
    throw new Error(`Failed to write component file: ${error.message}`);
  }
};
