
const chalk = require('chalk');
const https = require('https');
const http = require('http');

/**
 * Real API function to fetch component data from the platform
 */
module.exports.getComponent = async (name, config) => {
  console.log(chalk.gray(`Requesting component: ${name}`));
  
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/components/${name}`;
    const options = {
      headers: {
        'Authorization': `Bearer ${config.accessKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'vibe-cli/0.1.0'
      }
    };

    const request = (url.startsWith('https') ? https : http).get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const component = JSON.parse(data);
            resolve(component);
          } else if (res.statusCode === 404) {
            resolve(null); // Component not found
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Network request failed: ${error.message}`));
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

/**
 * Real function to list available components
 */
module.exports.listComponents = async (config) => {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/components`;
    const options = {
      headers: {
        'Authorization': `Bearer ${config.accessKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'vibe-cli/0.1.0'
      }
    };

    const request = (url.startsWith('https') ? https : http).get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const components = JSON.parse(data);
            resolve(components);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    request.on('error', (error) => {
      reject(new Error(`Network request failed: ${error.message}`));
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};
