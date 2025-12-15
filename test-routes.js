// Test script to verify routes are working
const testRoutes = async () => {
  const baseUrl = 'https://bukatabungan-production.up.railway.app';
  
  console.log('🧪 Testing routes...');
  
  // Test 1: Check if server is running
  try {
    const healthCheck = await fetch(`${baseUrl}/api/pengajuan`);
    console.log('✅ Server is running:', healthCheck.status);
  } catch (err) {
    console.log('❌ Server not reachable:', err.message);
    return;
  }
  
  // Test 2: Check specific submission exists
  try {
    const submissionCheck = await fetch(`${baseUrl}/api/pengajuan/351`);
    console.log('✅ Submission 351 exists:', submissionCheck.status);
  } catch (err) {
    console.log('❌ Submission 351 not found:', err.message);
  }
  
  // Test 3: Check edit route (should return 405 Method Not Allowed for GET)
  try {
    const editRouteCheck = await fetch(`${baseUrl}/api/pengajuan/351/edit`);
    console.log('🔍 Edit route GET response:', editRouteCheck.status);
    const response = await editRouteCheck.text();
    console.log('🔍 Response:', response);
  } catch (err) {
    console.log('❌ Edit route error:', err.message);
  }
  
  // Test 4: Check history route
  try {
    const historyCheck = await fetch(`${baseUrl}/api/pengajuan/351/history`);
    console.log('✅ History route:', historyCheck.status);
  } catch (err) {
    console.log('❌ History route error:', err.message);
  }
};

testRoutes();