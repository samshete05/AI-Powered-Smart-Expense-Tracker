export const navigationSections = [
  {
    label: "Track",
    items: [
      { id: "Overview", label: "Overview", icon: "home" },
      { id: "Transactions", label: "Transactions", icon: "transactions" },
      { id: "Recurring", label: "Recurring", icon: "repeat" },
      { id: "Analytics", label: "Analytics", icon: "analytics" },
      { id: "Categories", label: "Categories", icon: "categories" },
      { id: "Budgets", label: "Budgets", icon: "target" },
      { id: "Goals", label: "Goals", icon: "goal" }
    ]
  },
  {
    label: "Manage",
    items: [
      { id: "Wallets", label: "Wallets", icon: "wallet" },
      { id: "Investments", label: "Investments", icon: "trend" },
      { id: "Automation", label: "Automation", icon: "automation" },
      { id: "Contacts", label: "Contacts", icon: "users" },
      { id: "Settings", label: "Settings", icon: "settings" }
    ]
  }
];

export const navigationItems = navigationSections.flatMap((section) => section.items.map((item) => item.id));
