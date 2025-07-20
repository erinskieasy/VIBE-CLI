#!/usr/bin/env node

const { program } = require("commander");
const chalk = require("chalk");
const init = require("../lib/init");
const pull = require("../lib/pull");

program
  .name("vibe")
  .description("CLI tool to connect local projects to Component Hub platform")
  .version("0.1.0");

program
  .command("init")
  .description("Initialize vibe configuration in current directory")
  .action(async () => {
    try {
      await init();
    } catch (error) {
      console.error(chalk.red("Error during initialization:"), error.message);
      process.exit(1);
    }
  });

program
  .command("pull <component-name>")
  .description("Download a component from the platform")
  .action(async (componentName) => {
    try {
      await pull(componentName);
    } catch (error) {
      console.error(chalk.red("Error pulling component:"), error.message);
      process.exit(1);
    }
  });

program
  .command("pull-all")
  .description("Download all available components from the platform")
  .action(async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Read configuration
      const configPath = path.join(process.cwd(), '.vibecode.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('No .vibecode.json found. Run "vibe init" first.');
      }
      
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);
      
      const { listComponents } = require("../utils/api");
      const components = await listComponents(config);
      
      console.log(chalk.blue(`🔄 Pulling ${components.length} components...`));
      
      for (const component of components) {
        await pull(component.name);
      }
      
      console.log(chalk.green(`✅ Successfully downloaded ${components.length} components!`));
    } catch (error) {
      console.error(chalk.red("Error pulling all components:"), error.message);
      process.exit(1);
    }
  });

program.parse();
