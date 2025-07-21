
const chalk = require('chalk');
const https = require('https');
const http = require('http');

/**
 * Fetch all components from Base44 Component entities
 */
module.exports.listComponents = async (config) => {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.projectId}/entities/Component`;
    const options = {
      headers: {
        'api_key': config.accessKey,
        'Content-Type': 'application/json'
      }
    };

    console.log(chalk.gray(`Fetching components from: ${url}`));

    const request = (url.startsWith('https') ? https : http).get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            // Base44 returns components in a data array
            const components = response.data || response;
            console.log(chalk.green(`Found ${components.length} components`));
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

    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

/**
 * Fetch components linked to a specific project from Base44 ProjectComponentLink entities
 */
module.exports.listProjectComponents = async (projectId, config) => {
  // First, get the internal Base44 ID for this project
  const internalProjectId = await getProjectInternalId(projectId, config);
  if (!internalProjectId) {
    throw new Error(`Project "${projectId}" not found`);
  }

  console.log(chalk.gray(`Mapped project "${projectId}" to internal ID: ${internalProjectId}`));

  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.projectId}/entities/ProjectComponentLink?project_id=${internalProjectId}`;
    const options = {
      headers: {
        'api_key': config.accessKey,
        'Content-Type': 'application/json'
      }
    };

    console.log(chalk.gray(`Fetching project components from: ${url}`));

    const request = (url.startsWith('https') ? https : http).get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            const componentLinks = response.data || response;
            console.log(chalk.green(`Found ${componentLinks.length} project components`));
            resolve(componentLinks);
          } else {
            console.log(chalk.red(`API Error - Status: ${res.statusCode}`));
            console.log(chalk.red(`Response body:`), data);
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

    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};

/**
 * Get the internal Base44 ID for a project given its human-readable project_id
 */
async function getProjectInternalId(projectId, config) {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.projectId}/entities/Project`;
    const options = {
      headers: {
        'api_key': config.accessKey,
        'Content-Type': 'application/json'
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
            const response = JSON.parse(data);
            const projects = response.data || response;
            
            // Find project by project_id
            const project = projects.find(p => p.project_id === projectId);
            if (project) {
              resolve(project.id); // Return internal Base44 ID
            } else {
              resolve(null); // Project not found
            }
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

    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}



/**
 * Get a specific component by ID from Base44
 */
module.exports.getComponent = async (componentId, config) => {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.projectId}/entities/Component/${componentId}`;
    const options = {
      headers: {
        'api_key': config.accessKey,
        'Content-Type': 'application/json'
      }
    };

    console.log(chalk.gray(`Fetching component: ${componentId}`));

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

    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
};
