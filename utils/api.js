
const chalk = require('chalk');
const https = require('https');
const http = require('http');

/**
 * Fetch all components from Base44 Component entities
 */
module.exports.listComponents = async (config) => {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.appId}/entities/Component`;
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
  // Try multiple query approaches
  const queryAttempts = [
    `project_id=${projectId}`,
    `projectId=${projectId}`,
    `project=${projectId}`,
    `id=${projectId}`
  ];

  for (let i = 0; i < queryAttempts.length; i++) {
    const query = queryAttempts[i];
    console.log(chalk.yellow(`Attempt ${i + 1}: Trying query parameter: ${query}`));
    
    try {
      const result = await tryProjectComponentQuery(query, config);
      if (result.length > 0) {
        console.log(chalk.green(`✅ Success with query: ${query}`));
        return result;
      }
    } catch (error) {
      console.log(chalk.red(`❌ Failed with query: ${query} - ${error.message}`));
    }
  }

  // If no query worked, let's try getting ALL ProjectComponentLinks to see structure
  console.log(chalk.blue(`🔍 No results found. Fetching ALL ProjectComponentLinks to analyze structure...`));
  return await getAllProjectComponentLinks(config);
};

async function tryProjectComponentQuery(query, config) {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.appId}/entities/ProjectComponentLink?${query}`;
    const options = {
      headers: {
        'api_key': config.accessKey,
        'Content-Type': 'application/json'
      }
    };

    console.log(chalk.gray(`Fetching from: ${url}`));

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
            console.log(chalk.gray(`Found ${componentLinks.length} results`));
            resolve(componentLinks);
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

async function getAllProjectComponentLinks(config) {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.appId}/entities/ProjectComponentLink`;
    const options = {
      headers: {
        'api_key': config.accessKey,
        'Content-Type': 'application/json'
      }
    };

    console.log(chalk.gray(`Fetching ALL ProjectComponentLinks from: ${url}`));

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
            console.log(chalk.yellow(`All ProjectComponentLinks structure:`), JSON.stringify(componentLinks, null, 2));
            console.log(chalk.green(`Found ${componentLinks.length} total project component links`));
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
 * Get a specific component by ID from Base44
 */
module.exports.getComponent = async (componentId, config) => {
  return new Promise((resolve, reject) => {
    const url = `${config.platform}/api/apps/${config.appId}/entities/Component/${componentId}`;
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
