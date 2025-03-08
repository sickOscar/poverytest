// Using Node.js built-in fetch API
// No external dependencies required

/**
 * =====================================================
 * IMPORTANT: Before running this test script, make sure
 * the server is running with:
 * 
 * npm start
 * 
 * in a separate terminal window.
 * =====================================================
 */

// Base URL for the API
const BASE_URL = 'http://localhost:3000/dev';

// Helper function to log test results
const logTest = (name, success, data, error) => {
  if (success) {
    console.log(`✓ ${name}: Success`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  } else {
    console.log(`✗ ${name}: Failed`);
    if (error) {
      console.log(error.message || JSON.stringify(error));
    }
  }
  console.log('-----------------------------------');
};

// Helper function to make API requests
async function makeRequest(path, method = 'GET', body) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      const error = new Error(`Request failed with status ${response.status}`);
      error.response = { status: response.status, data: errorData };
      throw error;
    }
    
    return response.json();
  } catch (error) {
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      console.error('\n\n⚠️  SERVER NOT RUNNING! Please start the server with "npm start" in another terminal.\n\n');
      process.exit(1);
    }
    throw error;
  }
}

// Run all tests
const runTests = async () => {
  console.log('\n\n');
  console.log('=======================================================');
  console.log('|                POVERY API TEST SUITE                |');
  console.log('=======================================================');
  console.log('\n');

  try {
    // Test 1: Basic route
    try {
      const data = await makeRequest('/test');
      logTest('Basic Route', true, data);
    } catch (error) {
      // This might fail due to ACL restrictions
      logTest('Basic Route', false, null, error);
      console.log('Note: This route has ACL restrictions, so failure might be expected');
    }

    // Test 2: Route with path parameter
    try {
      const data = await makeRequest('/test/123');
      logTest('Path Parameter Route', true, data);
    } catch (error) {
      logTest('Path Parameter Route', false, null, error);
    }

    // Test 3: Route with validated path parameter
    try {
      const data = await makeRequest('/test/validation/abc123');
      logTest('Validated Path Parameter', true, data);
    } catch (error) {
      logTest('Validated Path Parameter', false, null, error);
    }

    // Test 4: POST route
    try {
      const data = await makeRequest('/test', 'POST', { test: 'data' });
      logTest('POST Route', true, data);
    } catch (error) {
      logTest('POST Route', false, null, error);
    }

    // Test 5: Error route
    try {
      const data = await makeRequest('/error');
      logTest('Error Route', true, data);
    } catch (error) {
      logTest('Error Route', true, error.response?.data || error);
    }

    // Test 6: Custom error route
    try {
      const data = await makeRequest('/error', 'PUT');
      logTest('Custom Error Route', true, data);
    } catch (error) {
      logTest('Custom Error Route', true, error.response?.data || error);
    }

    // Test 7: Query parameters
    try {
      const data = await makeRequest('/test-query?name=John&age=30');
      logTest('Query Parameters', true, data);
    } catch (error) {
      logTest('Query Parameters', false, null, error);
    }

    // Test 8: All query parameters
    try {
      const data = await makeRequest('/test-all-query?limit=10&offset=20&sort=desc');
      logTest('All Query Parameters', true, data);
    } catch (error) {
      logTest('All Query Parameters', false, null, error);
    }

    // Test 9: Body validation
    try {
      const data = await makeRequest('/test-body', 'POST', {
        name: 'Jane Doe',
        age: 25,
        email: 'jane@example.com'
      });
      logTest('Body Validation', true, data);
    } catch (error) {
      logTest('Body Validation', false, null, error);
    }

    // Test 10: Body validation failure
    try {
      const data = await makeRequest('/test-body', 'POST', {
        name: 'Jane Doe',
        age: 'twenty-five', // Invalid type
        email: 'jane@example.com'
      });
      logTest('Body Validation Failure', false, data);
    } catch (error) {
      logTest('Body Validation Failure', true, error.response?.data || error);
    }

    // Test 11: Middleware
    try {
      const data = await makeRequest('/test-middleware');
      logTest('Middleware', true, data);
    } catch (error) {
      logTest('Middleware', false, null, error);
    }

    // Test 12: PUT method
    try {
      const data = await makeRequest('/test-methods', 'PUT');
      logTest('PUT Method', true, data);
    } catch (error) {
      logTest('PUT Method', false, null, error);
    }

    // Test 13: DELETE method
    try {
      const data = await makeRequest('/test-methods/123', 'DELETE');
      logTest('DELETE Method', true, data);
    } catch (error) {
      logTest('DELETE Method', false, null, error);
    }

    // Test 14: PATCH method
    try {
      const data = await makeRequest('/test-methods/123', 'PATCH', { update: 'data' });
      logTest('PATCH Method', true, data);
    } catch (error) {
      logTest('PATCH Method', false, null, error);
    }

    // Test 15: Nested routes
    try {
      const data = await makeRequest('/nested/routes/test');
      logTest('Nested Routes', true, data);
    } catch (error) {
      logTest('Nested Routes', false, null, error);
    }

    // Test 16: Error codes
    try {
      const data = await makeRequest('/test-errors/404');
      logTest('Error Codes', true, data);
    } catch (error) {
      logTest('Error Codes', true, error.response?.data || error);
    }

    // Test 17: Non-error code
    try {
      const data = await makeRequest('/test-errors/200');
      logTest('Non-Error Code', true, data);
    } catch (error) {
      logTest('Non-Error Code', false, null, error);
    }

  } catch (error) {
    console.log('Test suite failed:');
    console.error(error);
  }

  console.log('\n');
  console.log('=======================================================');
  console.log('|                 ALL TESTS COMPLETED                 |');
  console.log('=======================================================');
  console.log('\n');
};

// Make sure the server is running before executing tests
console.log('\n');
console.log('=======================================================');
console.log('|                   IMPORTANT NOTE                    |');
console.log('=======================================================');
console.log('| Make sure the server is running on:                 |');
console.log('| http://localhost:3000                              |');
console.log('|                                                     |');
console.log('| Run "npm start" in another terminal if it\'s not     |');
console.log('| running yet.                                        |');
console.log('=======================================================');
console.log('\n');

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
}); 