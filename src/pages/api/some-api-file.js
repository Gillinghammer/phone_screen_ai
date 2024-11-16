const company = await prisma.company.create({
  data: {
    name: "whitelabelco",
    domain: "whitelabel.co",
    parentCompany: {
      connect: {
        id: 12
      }
    },
    // ... other fields ...
  }
}); 