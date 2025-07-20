
const chalk = require('chalk');
const https = require('https');
const http = require('http');

/**
 * Real API function to fetch component data from Base44 platform
 */
module.exports.getComponent = async (name, config) => {
  console.log(chalk.gray(`Requesting component: ${name}`));
  
  return new Promise((resolve, reject) => {
    // Base44 API endpoint structure - try different possible endpoints
    const url = `${config.platform}/api/v1/entities/Component`;
    const options = {
      headers: {
        'X-Access-Key': config.accessKey,
        'Content-Type': 'application/json',
        'User-Agent': 'vibe-cli/0.1.0'
      },
      rejectUnauthorized: false // Allow self-signed certificates for development
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
            console.log(chalk.gray(`API Response:`, JSON.stringify(response, null, 2)));
            
            // Base44 returns arrays, filter by name on client side
            const components = Array.isArray(response) ? response : [response];
            const component = components.find(c => 
              c.name === name || 
              c.component_name === name || 
              c.title === name
            );
            
            if (component) {
              // Transform Base44 component format to CLI expected format
              resolve({
                name: component.name || component.component_name || component.title,
                code: component.tsx_code || component.code || component.content,
                version: component.version || '1.0.0',
                description: component.description || component.desc
              });
            } else {
              resolve(null); // Component not found
            }
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
 * Real function to list available components from Base44
 */
module.exports.listComponents = async (config) => {
  return new Promise((resolve, reject) => {
    // Base44 API endpoint for all components
    const url = `${config.platform}/api/v1/entities/Component`;
    const options = {
      headers: {
        'X-Access-Key': config.accessKey,
        'Content-Type': 'application/json',
        'User-Agent': 'vibe-cli/0.1.0'
      },
      rejectUnauthorized: false // Allow self-signed certificates for development
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
            // Transform Base44 format to CLI expected format
            const transformedComponents = (Array.isArray(components) ? components : [components])
              .map(c => ({
                name: c.name,
                description: c.description,
                version: c.version || '1.0.0'
              }));
            resolve(transformedComponents);
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
 * Verify project connection with Base44 platform
 */
module.exports.verifyProject = async (config) => {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/v1/entities/Project`;
    const options = {
      headers: {
        'X-Access-Key': config.accessKey,
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
      reject(new Error(`Network request failed: ${error.message}`));
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};
