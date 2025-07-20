const chalk = require('chalk');
const https = require('https');
const http = require('http');

/**
 * Fetch component data from Component Hub
 */
module.exports.getComponent = async (name, config) => {
  console.log(chalk.gray(`Requesting component: ${name}`));

  // First, get all project components
  const allComponents = await module.exports.listComponents(config);
  const component = allComponents.find(c => 
    c.name === name || 
    c.name?.toLowerCase() === name.toLowerCase()
  );

  if (!component) {
    return null;
  }

  return component;
};

/**
 * List available components from Component Hub
 */
module.exports.listComponents = async (config) => {
  console.log(chalk.gray(`Fetching components from: ${config.platform}/api/projects/${config.projectId}/components`));

  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/projects/${config.projectId}/components`;
    const options = {
      headers: {
        'Authorization': `Bearer ${config.accessKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'vibe-cli/0.1.0'
      },
      rejectUnauthorized: false
    };

    const request = (url.startsWith('https') ? https : http).get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log(chalk.green(`✅ Found components`));
            console.log(chalk.gray(`Response:`, JSON.stringify(response, null, 2)));

            // Handle different response formats
            const components = response.components || response || [];
            const transformedComponents = (Array.isArray(components) ? components : [components])
              .map(c => ({
                id: c.id || c._id,
                name: c.name || c.component_name || c.title,
                description: c.description || c.desc,
                version: c.version || '1.0.0',
                code: c.code || c.tsx_code || c.content
              }));
            resolve(transformedComponents);
          } else if (res.statusCode === 404) {
            throw new Error('Components endpoint not found. Check your platform URL.');
          } else if (res.statusCode === 401) {
            throw new Error('Invalid access key. Check your authentication.');
          } else if (res.statusCode === 403) {
            throw new Error('Access denied. Verify your project ID and access key.');
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    request.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('Cannot connect to Component Hub server. Make sure it is running on localhost:3001'));
      } else {
        reject(new Error(`Network request failed: ${error.message}`));
      }
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

/**
 * Verify project connection with Component Hub
 */
module.exports.verifyProject = async (config) => {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/projects/${config.projectId}`;
    const options = {
      headers: {
        'Authorization': `Bearer ${config.accessKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'vibe-cli/0.1.0'
      },
      rejectUnauthorized: false
    };

    const request = (url.startsWith('https') ? https : http).get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const project = JSON.parse(data);
            resolve(project);
          } else if (res.statusCode === 401) {
            reject(new Error('Invalid access key'));
          } else if (res.statusCode === 404) {
            reject(new Error('Project not found'));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    request.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        reject(new Error('Cannot connect to Component Hub server. Make sure it is running on localhost:3001'));
      } else {
        reject(new Error(`Network request failed: ${error.message}`));
      }
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};