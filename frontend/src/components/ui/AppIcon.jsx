const commonProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

function Svg({ className, children }) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function AppIcon({ name, className = "h-4 w-4" }) {
  switch (name) {
    case "home":
      return <Svg className={className}><path d="M4 11.5 12 5l8 6.5" /><path d="M6.5 10.5V19h11v-8.5" /></Svg>;
    case "transactions":
      return <Svg className={className}><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h10" /><path d="m4 7 1 1 2-2" /><path d="m4 17 1 1 2-2" /></Svg>;
    case "shopping":
      return <Svg className={className}><path d="M6 7h13l-1.4 8.2a2 2 0 0 1-2 1.8H9.1a2 2 0 0 1-2-1.6L5 4H3" /><circle cx="10" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></Svg>;
    case "car":
      return <Svg className={className}><path d="M4 14l1.5-4.3A2 2 0 0 1 7.4 8h9.2a2 2 0 0 1 1.9 1.7L20 14" /><path d="M4 14h16v4a1 1 0 0 1-1 1h-1" /><path d="M4 14v4a1 1 0 0 0 1 1h1" /><circle cx="7.5" cy="18.5" r="1.2" /><circle cx="16.5" cy="18.5" r="1.2" /></Svg>;
    case "plane":
      return <Svg className={className}><path d="m3 13 8.5-1 6.5-7a1.4 1.4 0 0 1 2 2l-7 6.5-1 8.5-2.8-3.4-4.2.8 1.2-3.5L3 13Z" /></Svg>;
    case "food":
      return <Svg className={className}><path d="M7 3v8" /><path d="M5 3v4" /><path d="M9 3v4" /><path d="M16 3v10" /><path d="M16 13c0 4-2 8-2 8" /><path d="M7 11c0 4 2 10 2 10" /></Svg>;
    case "coffee":
      return <Svg className={className}><path d="M6 8h9v5a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V8Z" /><path d="M15 10h1a2 2 0 1 1 0 4h-1" /><path d="M8 3c1 1 1 2 0 3" /><path d="M11 3c1 1 1 2 0 3" /></Svg>;
    case "gift":
      return <Svg className={className}><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8v12" /><path d="M4 12h16" /><path d="M9 8c-1.7 0-3-1.3-3-3 0-1 1-2 2-2 2.2 0 4 5 4 5H9Z" /><path d="M15 8c1.7 0 3-1.3 3-3 0-1-1-2-2-2-2.2 0-4 5-4 5h3Z" /></Svg>;
    case "heart":
      return <Svg className={className}><path d="m12 20-1.4-1.2C5.4 14.2 3 12 3 8.8 3 6.4 4.9 4.5 7.3 4.5c1.4 0 2.8.7 3.7 1.8.9-1.1 2.3-1.8 3.7-1.8 2.4 0 4.3 1.9 4.3 4.3 0 3.2-2.4 5.4-7.6 10L12 20Z" /></Svg>;
    case "phone":
      return <Svg className={className}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 17h2" /></Svg>;
    case "repeat":
      return <Svg className={className}><path d="M17 2v4h-4" /><path d="M7 22v-4h4" /><path d="M20 8a8 8 0 0 0-14.5-2" /><path d="M4 16a8 8 0 0 0 14.5 2" /></Svg>;
    case "analytics":
      return <Svg className={className}><path d="M5 19V9" /><path d="M12 19V5" /><path d="M19 19v-7" /></Svg>;
    case "categories":
      return <Svg className={className}><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></Svg>;
    case "target":
      return <Svg className={className}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /></Svg>;
    case "goal":
      return <Svg className={className}><path d="M6 20V6" /><path d="M6 6c3-3 6 3 9 0s6 3 3 6-6-3-9 0-6-3-3-6Z" /></Svg>;
    case "wallet":
      return <Svg className={className}><rect x="3" y="6.5" width="18" height="11" rx="2.5" /><path d="M16 12h.01" /><path d="M17.5 9.5V7A1.5 1.5 0 0 0 16 5.5H6" /></Svg>;
    case "trend":
      return <Svg className={className}><path d="M4 16 9 11l3 3 8-8" /><path d="M15 6h5v5" /></Svg>;
    case "automation":
      return <Svg className={className}><circle cx="12" cy="12" r="2.5" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" /></Svg>;
    case "users":
      return <Svg className={className}><path d="M16 21v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="8" r="3" /><path d="M20 21v-1a4 4 0 0 0-3-3.9" /><path d="M16.5 5.1a3 3 0 0 1 0 5.8" /></Svg>;
    case "settings":
      return <Svg className={className}><path d="M12 3v2.2" /><path d="M12 18.8V21" /><path d="m4.9 4.9 1.6 1.6" /><path d="m17.5 17.5 1.6 1.6" /><path d="M3 12h2.2" /><path d="M18.8 12H21" /><path d="m4.9 19.1 1.6-1.6" /><path d="m17.5 6.5 1.6-1.6" /><circle cx="12" cy="12" r="3.2" /></Svg>;
    case "menu":
      return <Svg className={className}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></Svg>;
    case "close":
      return <Svg className={className}><path d="m6 6 12 12" /><path d="M18 6 6 18" /></Svg>;
    case "plus":
      return <Svg className={className}><path d="M12 5v14" /><path d="M5 12h14" /></Svg>;
    case "import":
      return <Svg className={className}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></Svg>;
    case "export":
      return <Svg className={className}><path d="M12 21V9" /><path d="m17 14-5-5-5 5" /><path d="M5 3h14" /></Svg>;
    case "refresh":
      return <Svg className={className}><path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" /></Svg>;
    case "search":
      return <Svg className={className}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Svg>;
    case "edit":
      return <Svg className={className}><path d="m4 20 4.5-1 9-9a1.8 1.8 0 0 0-2.5-2.5l-9 9L4 20Z" /><path d="m13.5 6.5 4 4" /></Svg>;
    case "delete":
      return <Svg className={className}><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M6 7l1 12a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7" /><path d="M9 7V4.8A1.8 1.8 0 0 1 10.8 3h2.4A1.8 1.8 0 0 1 15 4.8V7" /></Svg>;
    case "transfer":
      return <Svg className={className}><path d="M17 3h4v4" /><path d="M21 3l-7 7" /><path d="M7 21H3v-4" /><path d="m3 21 7-7" /></Svg>;
    case "mail":
      return <Svg className={className}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></Svg>;
    case "camera":
      return <Svg className={className}><path d="M4 8h3l2-2h6l2 2h3" /><rect x="3" y="8" width="18" height="11" rx="2" /><circle cx="12" cy="13.5" r="3.5" /></Svg>;
    case "message":
      return <Svg className={className}><path d="M4 5h16v10H8l-4 4V5Z" /></Svg>;
    case "bell":
      return <Svg className={className}><path d="M6 9a6 6 0 1 1 12 0v4l2 2H4l2-2V9" /><path d="M10 19a2 2 0 0 0 4 0" /></Svg>;
    case "profile":
      return <Svg className={className}><circle cx="12" cy="8" r="3.2" /><path d="M5 20a7 7 0 0 1 14 0" /></Svg>;
    case "sliders":
      return <Svg className={className}><path d="M4 6h16" /><path d="M4 18h16" /><path d="M9 6v12" /><path d="M15 6v12" /><circle cx="9" cy="10" r="1.8" /><circle cx="15" cy="14" r="1.8" /></Svg>;
    case "sparkles":
      return <Svg className={className}><path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4L12 3Z" /><path d="m18.5 14 0.7 1.8 1.8 0.7-1.8 0.7-0.7 1.8-0.7-1.8-1.8-0.7 1.8-0.7 0.7-1.8Z" /><path d="m5.5 13 0.9 2.2 2.2 0.9-2.2 0.9-0.9 2.2-0.9-2.2-2.2-0.9 2.2-0.9 0.9-2.2Z" /></Svg>;
    default:
      return <Svg className={className}><circle cx="12" cy="12" r="8" /></Svg>;
  }
}

export const categoryIconNames = [
  "shopping",
  "home",
  "car",
  "plane",
  "food",
  "coffee",
  "cart",
  "gift",
  "heart",
  "phone",
  "goal",
  "wallet",
  "analytics",
  "settings",
  "repeat",
  "automation",
  "message",
  "camera",
  "target",
  "users"
];

export function getCategoryIconName(name) {
  const map = {
    shopping: "cart",
    home: "home",
    car: "car",
    plane: "plane",
    food: "food",
    coffee: "coffee",
    cart: "cart",
    gift: "gift",
    heart: "heart",
    phone: "phone",
    study: "goal",
    briefcase: "wallet",
    fitness: "target",
    music: "analytics",
    game: "goal",
    wifi: "automation",
    bolt: "automation",
    drop: "target",
    pill: "target",
    stethoscope: "target",
    bus: "car",
    train: "car",
    cash: "wallet",
    card: "wallet",
    utensils: "food",
    bag: "shopping",
    receipt: "transactions",
    chart: "analytics",
    wallet: "wallet",
    circle: "target"
  };

  return map[name] || "categories";
}

export function WalletTypeIcon({ type, className = "h-4 w-4" }) {
  const iconByType = {
    cash: "wallet",
    upi: "message",
    bank: "analytics",
    card: "wallet",
    savings: "target",
    investment: "trend"
  };

  return <AppIcon name={iconByType[type] || "wallet"} className={className} />;
}
