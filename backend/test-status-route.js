async function testStatusRoute() {
  try {
    const response = await fetch('http://localhost:8080/api/pengajuan/status/TEST-1765941932776-984');
    const result = await response.json();
    
    console.log('🧪 Testing status route...');
    console.log('📊 Response status:', response.status);
    console.log('📄 Response body:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Status route working correctly!');
      console.log('🔗 Frontend URL: http://localhost:5175/status/TEST-1765941932776-984');
    } else {
      console.log('❌ Status route failed:', result.message);
    }
    
  } catch (err) {
    console.error('❌ Error testing status route:', err.message);
  }
}

testStatusRoute();