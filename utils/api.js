const chalk = require('chalk');
const https = require('https');
const http = require('http');

/**
 * Real API function to fetch component data from Base44 platform
 */
module.exports.getComponent = async (name, config) => {
  console.log(chalk.gray(`Requesting component: ${name}`));

  // First, get all project component links to find the one with matching name
  const allComponents = await module.exports.listComponents(config);
  const component = allComponents.find(c => 
    c.name === name || 
    c.component_name === name || 
    c.title === name ||
    c.name?.toLowerCase() === name.toLowerCase()
  );

  if (!component || !component.id) {
    return null;
  }

  // Now fetch the specific component using its ID from ProjectComponentLink
  return await fetchComponentById(config, component.id);
};

async function fetchComponentById(config, componentId) {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/v1/entities/ProjectComponentLink?id=${componentId}`;
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
            const component = JSON.parse(data);
            console.log(chalk.gray(`Component details:`, JSON.stringify(component, null, 2)));

            // Transform Base44 component format to CLI expected format
            resolve({
              name: component.name || component.component_name || component.title,
              code: component.tsx_code || component.code || component.content,
              version: component.version || '1.0.0',
              description: component.description || component.desc
            });
          } else if (res.statusCode === 404) {
            resolve(null);
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
 * Real function to list available components from Base44 ProjectComponentLink
 */
module.exports.listComponents = async (config) => {
  console.log(chalk.gray(`Fetching components from: ${config.platform}/api/v1/entities/ProjectComponentLink`));

  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/v1/entities/ProjectComponentLink`;
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
            const components = JSON.parse(data);
            console.log(chalk.green(`✅ Found components from ProjectComponentLink`));
            console.log(chalk.gray(`Response:`, JSON.stringify(components, null, 2)));

            // Transform Base44 format to CLI expected format
            const transformedComponents = (Array.isArray(components) ? components : [components])
              .filter(c => c.project_id === config.projectId) // Filter by project ID
              .map(c => ({
                id: c.id || c._id || c.component_id,
                name: c.name || c.component_name || c.title,
                description: c.description || c.desc,
                version: c.version || '1.0.0'
              }));
            resolve(transformedComponents);
          } else if (res.statusCode === 404) {
            throw new Error('ProjectComponentLink endpoint not found. Check your platform URL.');
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
    const url = `${config.platform}/api/v1/entities/Project?id=${config.projectId}`;
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