/**
 * Utility to check if a server is running at a specific URL
 * @param {string} url - The URL to check
 * @returns {Promise<boolean>} - True if server is accessible, false otherwise
 */
export async function checkServerAvailability(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for quick check
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    }).catch(() => null);
    
    clearTimeout(timeoutId);
    return response !== null;
  } catch (error) {
    console.error(`Server check failed: ${error}`);
    return false;
  }
}

/**
 * Check if the Python backend is running
 * @returns {Promise<boolean>} - True if Python server is accessible
 */
export async function isPythonServerRunning(): Promise<boolean> {
  return await checkServerAvailability('http://127.0.0.1:5000');
}

/**
 * Check if the Node.js backend is running
 * @returns {Promise<boolean>} - True if Node.js server is accessible
 */
export async function isNodeServerRunning(): Promise<boolean> {
  return await checkServerAvailability('http://localhost:3000');
}