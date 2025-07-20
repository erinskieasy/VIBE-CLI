const chalk = require('chalk');

/**
 * Mock API function to simulate fetching component data from the platform
 * In a real implementation, this would make HTTP requests to the actual API
 */
module.exports.getComponent = async (name) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(chalk.gray(`Requesting component: ${name}`));
  
  const mockData = {
    Button: {
      name: 'Button',
      version: '1.0.0',
      code: `export const Button = () => <button className="bg-blue-500 text-white py-2 px-4 rounded">Click Me</button>;`
    },
    Card: {
      name: 'Card',
      version: '1.0.0',
      code: `export const Card = ({ title, children }) => (
  <div className="border rounded p-4 shadow">
    <h3 className="font-bold text-lg">{title}</h3>
    <div>{children}</div>
  </div>
);`
    },
    Modal: {
      name: 'Modal',
      version: '1.0.0',
      code: `export const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <button 
          onClick={onClose}
          className="float-right text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};`
    },
    Input: {
      name: 'Input',
      version: '1.0.0',
      code: `export const Input = ({ label, type = "text", placeholder, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    />
  </div>
);`
    }
  };

  return mockData[name] || null;
};

/**
 * Mock function to list available components
 * This would be used for future features like "vibe list"
 */
module.exports.listComponents = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    { name: 'Button', description: 'Interactive button component' },
    { name: 'Card', description: 'Content container with shadow' },
    { name: 'Modal', description: 'Overlay dialog component' },
    { name: 'Input', description: 'Form input field with label' }
  ];
};
