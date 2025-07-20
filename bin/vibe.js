#!/usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const init = require('../lib/init');
const pull = require('../lib/pull');

program
  .name('vibe')
  .description('CLI tool to connect local projects to Component Hub platform')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize vibe configuration in current directory')
  .action(async () => {
    try {
      await init();
    } catch (error) {
      console.error(chalk.red('Error during initialization:'), error.message);
      process.exit(1);
    }
  });

program
  .command('pull <component-name>')
  .description('Download a component from the platform')
  .action(async (componentName) => {
    try {
      await pull(componentName);
    } catch (error) {
      console.error(chalk.red('Error pulling component:'), error.message);
      process.exit(1);
    }
  });

program.parse();
