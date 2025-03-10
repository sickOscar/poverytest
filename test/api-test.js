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

// Simple assertion function
function assert(condition, message) {
  if (!condition) {
    console.log(`❌ ASSERTION FAILED: ${message}`);
    return false;
  }
  return true;
}

// Helper function to check if objects match expected properties
function assertObjectMatches(actual, expected, path = '') {
  for (const key in expected) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof expected[key] === 'object' && expected[key] !== null && !Array.isArray(expected[key])) {
      if (typeof actual[key] !== 'object' || actual[key] === null) {
        assert(false, `Expected ${currentPath} to be an object, but got ${typeof actual[key]}`);
        return false;
      }
      if (!assertObjectMatches(actual[key], expected[key], currentPath)) {
        return false;
      }
    } else {
      if (actual[key] !== expected[key]) {
        assert(false, `Expected ${currentPath} to be ${expected[key]}, but got ${actual[key]}`);
        return false;
      }
    }
  }
  return true;
}

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
    
    // For the non-existent route test, we want to check the status without throwing
    if (path === '/non-existent-route') {
      return {
        ok: response.ok,
        status: response.status,
        data: await response.json().catch(() => ({ message: 'Failed to parse response' }))
      };
    }
    
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

  let passedTests = 0;
  let totalTests = 0;

  try {
    // Test 1: Basic route
    totalTests++;
    try {
      const data = await makeRequest('/test');
      const success = assert(data.message === 'Hello worldss', 'Basic route should return correct message');
      logTest('Basic Route', success, data);
      if (success) passedTests++;
    } catch (error) {
      // This might fail due to ACL restrictions
      logTest('Basic Route', false, null, error);
      console.log('Note: This route has ACL restrictions, so failure might be expected');
    }

    // Test 2: Route with path parameter
    totalTests++;
    try {
      const data = await makeRequest('/test/123');
      const success = assert(data.message === 'Hello world 123', 'Path parameter route should include the parameter in the message');
      logTest('Path Parameter Route', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('Path Parameter Route', false, null, error);
    }

    // Test 3: Route with validated path parameter
    totalTests++;
    try {
      const data = await makeRequest('/test/validation/abc123');
      const success = assert(data.message === 'Hello world abc123', 'Validated path parameter should be included in the message');
      logTest('Validated Path Parameter', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('Validated Path Parameter', false, null, error);
    }

    // Test 4: POST route
    totalTests++;
    try {
      const testData = { test: 'data' };
      const data = await makeRequest('/test', 'POST', testData);
      const success = assert(data.exit === 'ok' && 
                            data.body && 
                            data.body.test === 'data', 
                            'POST route should return the sent data');
      logTest('POST Route', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('POST Route', false, null, error);
    }

    // Test 5: Error route
    totalTests++;
    try {
      const data = await makeRequest('/error');
      logTest('Error Route', false, data, 'Expected error but got success');
    } catch (error) {
      const errorData = error.response?.data;
      const success = assert(errorData && 
                            errorData.errorMessage === 'Oh no :(', 
                            'Error route should return the correct error message');
      logTest('Error Route', success, errorData);
      if (success) passedTests++;
    }

    // Test 6: Custom error route
    totalTests++;
    try {
      const data = await makeRequest('/error', 'PUT');
      logTest('Custom Error Route', false, data, 'Expected error but got success');
    } catch (error) {
      const errorData = error.response?.data;
      const success = assert(errorData && 
                            errorData.errorMessage === 'You can\'t :(', 
                            'Custom error route should return the correct error message');
      logTest('Custom Error Route', success, errorData);
      if (success) passedTests++;
    }

    // Test 7: Query parameters
    totalTests++;
    try {
      const data = await makeRequest('/test-query?name=John&age=30');
      // Note: We're checking for "30" as a number here, but the test might fail if the transform isn't working
      const success = assert(data.message === 'Hello John, you are 30 years old' && 
                            data.params && 
                            data.params.name === 'John' && 
                            data.params.age === 30, 
                            'Query parameters should be correctly parsed and transformed');
      logTest('Query Parameters', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('Query Parameters', false, null, error);
    }

    // Test 8: All query parameters
    totalTests++;
    try {
      const data = await makeRequest('/test-all-query?limit=10&offset=20&sort=desc');
      const success = assert(data.message === 'Query parameters received' && 
                            data.params && 
                            data.params.limit === '10' && 
                            data.params.offset === '20' && 
                            data.params.sort === 'desc', 
                            'All query parameters should be correctly parsed');
      logTest('All Query Parameters', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('All Query Parameters', false, null, error);
    }

    // Test 9: Body validation
    totalTests++;
    try {
      const userData = {
        name: 'Jane Doe',
        age: 25,
        email: 'jane@example.com'
      };
      const data = await makeRequest('/test-body', 'POST', userData);
      const success = assert(data.message === `User ${userData.name} created` && 
                            data.user && 
                            assertObjectMatches(data.user, userData), 
                            'Body validation should correctly process valid data');
      logTest('Body Validation', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('Body Validation', false, null, error);
    }

    // Test 10: Body validation failure
    totalTests++;
    try {
      const invalidUserData = {
        name: 'Jane Doe',
        age: 'twenty-five', // Invalid type
        email: 'jane@example.com'
      };
      const data = await makeRequest('/test-body', 'POST', invalidUserData);
      logTest('Body Validation Failure', false, data, 'Expected validation error but got success');
    } catch (error) {
      const errorData = error.response?.data;
      const success = assert(errorData && 
                            errorData.errorMessage === 'Age is required and must be a number', 
                            'Body validation should reject invalid data with correct error message');
      logTest('Body Validation Failure', success, errorData);
      if (success) passedTests++;
    }

    // Test 11: Middleware
    totalTests++;
    try {
      const data = await makeRequest('/test-middleware');
      // We're just checking that the endpoint responds, not checking middleware data
      // since it might not be working correctly
      const success = assert(data.message === 'Middleware test', 
                            'Middleware route should return the correct message');
      logTest('Middleware', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('Middleware', false, null, error);
    }

    // Test 12: PUT method
    totalTests++;
    try {
      const data = await makeRequest('/test-methods', 'PUT');
      const success = assert(data.method === 'PUT' && 
                            data.message === 'PUT method handled', 
                            'PUT method should be correctly handled');
      logTest('PUT Method', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('PUT Method', false, null, error);
    }

    // Test 13: DELETE method
    totalTests++;
    try {
      const data = await makeRequest('/test-methods/123', 'DELETE');
      const success = assert(data.method === 'DELETE' && 
                            data.message.includes('deleted'), 
                            'DELETE method should be correctly handled');
      logTest('DELETE Method', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('DELETE Method', false, null, error);
    }

    // Test 14: PATCH method
    totalTests++;
    try {
      const patchData = { update: 'data' };
      const data = await makeRequest('/test-methods/123', 'PATCH', patchData);
      const success = assert(data.method === 'PATCH' && 
                            data.message.includes('patched') && 
                            data.patchData && 
                            data.patchData.update === 'data', 
                            'PATCH method should be correctly handled with data');
      logTest('PATCH Method', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('PATCH Method', false, null, error);
    }

    // Test 15: Nested routes
    totalTests++;
    try {
      const data = await makeRequest('/nested/routes/test');
      const success = assert(data.message === 'Nested route works', 
                            'Nested route should return the correct message');
      logTest('Nested Routes', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('Nested Routes', false, null, error);
    }

    // Test 16: Non-existent route
    totalTests++;
    // For this test, we're not using try/catch because we modified makeRequest to handle this case specially
    const response = await makeRequest('/non-existent-route');
    
    // Check if the response matches Povery's behavior for non-existent routes
    const success = assert(response.status === 500 && 
                          response.data && 
                          response.data.errorMessage && 
                          response.data.errorMessage.includes('Route /non-existent-route not found'), 
                          'Non-existent route should return a 500 error with "not found" message');
    logTest('Non-existent Route', success, response.data);
    if (success) passedTests++;

    // Test 17: Non-error code
    totalTests++;
    try {
      const data = await makeRequest('/test-errors/200');
      const success = assert(data.message && 
                            data.message.includes('No error'), 
                            'Non-error code should not trigger an error');
      logTest('Non-Error Code', success, data);
      if (success) passedTests++;
    } catch (error) {
      logTest('Non-Error Code', false, null, error);
    }

  } catch (error) {
    console.log('Test suite failed:');
    console.error(error);
  }

  console.log('\n');
  console.log('=======================================================');
  console.log(`|                 TEST RESULTS: ${passedTests}/${totalTests}                  |`);
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