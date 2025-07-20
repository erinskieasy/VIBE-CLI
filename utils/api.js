
const chalk = require('chalk');
const https = require('https');
const http = require('http');

/**
 * Real API function to fetch component data from Base44 platform
 */
module.exports.getComponent = async (name, config) => {
  console.log(chalk.gray(`Requesting component: ${name}`));
  
  // Try multiple possible endpoint patterns
  const endpoints = [
    `/api/v1/entities/Component`,
    `/api/entities/Component`,
    `/entities/Component`,
    `/api/v1/Component`,
    `/api/Component`,
    `/Component`
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(chalk.gray(`Trying endpoint: ${config.platform}${endpoint}`));
      const result = await tryComponentEndpoint(config, endpoint, name);
      if (result !== null) {
        return result;
      }
    } catch (error) {
      console.log(chalk.gray(`Failed: ${error.message}`));
      continue;
    }
  }
  
  throw new Error('No valid API endpoint found. Please check your platform URL and access key.');
};

async function tryComponentEndpoint(config, endpoint, name) {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}${endpoint}`;
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
  // Try multiple possible endpoint patterns
  const endpoints = [
    `/api/v1/entities/Component`,
    `/api/entities/Component`,
    `/entities/Component`,
    `/api/v1/Component`,
    `/api/Component`,
    `/Component`
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(chalk.gray(`Trying endpoint: ${config.platform}${endpoint}`));
      const result = await tryEndpoint(config, endpoint);
      if (result) {
        return result;
      }
    } catch (error) {
      console.log(chalk.gray(`Failed: ${error.message}`));
      continue;
    }
  }
  
  throw new Error('No valid API endpoint found. Please check your platform URL and access key.');
};

async function tryEndpoint(config, endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}${endpoint}`;
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
            console.log(chalk.green(`✅ Found working endpoint: ${url}`));
            console.log(chalk.gray(`Response:`, JSON.stringify(components, null, 2)));
            
            // Transform Base44 format to CLI expected format
            const transformedComponents = (Array.isArray(components) ? components : [components])
              .map(c => ({
                name: c.name || c.component_name || c.title,
                description: c.description || c.desc,
                version: c.version || '1.0.0'
              }));
            resolve(transformedComponents);
          } else if (res.statusCode === 404) {
            resolve(null); // Endpoint not found, try next one
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
}

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
