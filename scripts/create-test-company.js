async function createTestCompany() {
  console.log("🏢 Creating test company...\n");

  try {
    // Create a test company
    const companyData = {
      name: "TechStart Bolivia",
      description:
        "Empresa líder en soluciones tecnológicas y desarrollo de software en Bolivia",
      businessSector: "Tecnología",
      companySize: "MEDIUM",
      foundedYear: 2020,
      website: "www.techstart.com",
      email: "rrhh@techstart.com",
      phone: "+591 4 1234567",
      address: "Av. Tecnológica 123, Cochabamba",
      taxId: "NIT123456789",
      legalRepresentative: "Juan Pérez",
      municipalityId: "municipality_1",
      username: "techstart",
      password: "password123",
    };

    console.log("📝 Company data:", companyData);

    const response = await fetch("http://localhost:3000/api/company", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(companyData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Company created successfully:", result);

      console.log("\n🔑 Login credentials:");
      console.log("Username:", companyData.username);
      console.log("Password:", companyData.password);
      console.log("Email:", companyData.email);
    } else {
      const errorData = await response.json();
      console.error("❌ Failed to create company:", errorData);
    }
  } catch (error) {
    console.error("❌ Error creating company:", error.message);
  }

  console.log("\n🏢 Test company creation completed");
}

// Run the script
createTestCompany();
