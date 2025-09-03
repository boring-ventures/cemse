const fetch = require("node-fetch");

async function testCompanyAPI() {
  console.log("🧪 Testing Company API...\n");

  try {
    // Test 1: Check if the API endpoint is accessible
    console.log("1️⃣ Testing API endpoint accessibility...");

    // First, let's try to get a list of companies or check if the endpoint exists
    const response = await fetch("http://localhost:3000/api/company/test");

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API endpoint accessible:", data);
    } else {
      console.log("⚠️ API endpoint returned status:", response.status);
    }
  } catch (error) {
    console.error("❌ Error testing company API:", error.message);
  }

  console.log("\n🧪 Company API test completed");
}

// Run the test
testCompanyAPI();
