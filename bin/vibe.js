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
        await pull(component.id);
      }
      
      console.log(chalk.green(`✅ Successfully downloaded ${components.length} components!`));
    } catch (error) {
      console.error(chalk.red("Error pulling all components:"), error.message);
      process.exit(1);
    }
  });

program
  .command("pull-project <project-id>")
  .description("Download all components linked to a specific project")
  .action(async (projectId) => {
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
      
      const { listProjectComponents } = require("../utils/api");
      const components = await listProjectComponents(projectId, config);
      
      console.log(chalk.blue(`🔄 Pulling ${components.length} components for project ${projectId}...`));
      
      for (const componentLink of components) {
        // Extract component ID from the link
        const componentId = componentLink.component_id;
        await pull(componentId);
      }
      
      console.log(chalk.green(`✅ Successfully downloaded ${components.length} project components!`));
    } catch (error) {
      console.error(chalk.red("Error pulling project components:"), error.message);
      process.exit(1);
    }
  });

program
  .command("connect")
  .description("Quick connect using access key")
  .option("--key <accessKey>", "Access key for authentication")
  .action(async (options) => {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (!options.key) {
        console.error(chalk.red("Error: --key option is required"));
        process.exit(1);
      }
      
      // Create configuration with provided key and defaults
      const config = {
        platform: "https://app--component-hub-01919f93.base44.app",
        projectId: "mytestproject-6k8p05",
        accessKey: options.key,
        output: "react-tailwind"
      };
      
      const configPath = path.join(process.cwd(), '.vibecode.json');
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      console.log(chalk.green('✅ Connected successfully!'));
      console.log(chalk.gray('Configuration saved to .vibecode.json'));
      console.log(chalk.gray('You can now use "vibe pull <component-name>" to download components.'));
    } catch (error) {
      console.error(chalk.red("Error connecting:"), error.message);
      process.exit(1);
    }
  });

program.parse();
