/**
 * Internal Registry of all available App Icons
 * 
 * id: Unique code name used for logic/localStorage
 * label: Human-readable name for tooltips/About page
 * author: Attribution name
 * link: Attribution link
 * variants: Optional list of sub-variants (e.g. Wired/Wireless)
 * path: Path to SVG for UI display
 */

export const ICON_REGISTRY = [
  {
    id: "default",
    label: "Classic Gamepad",
    author: "Nikita Golubev (Flaticon)",
    link: "https://www.flaticon.com/free-icon/gamepad_361984",
    path: "/app-icon.svg",
    glow: "rgba(237, 85, 100, 0.4)"
  },
  {
    id: "eren-yeagar",
    label: "Eren Yeagar",
    author: "Sunbzy",
    link: "https://www.svgrepo.com/svg/426185/gamepad-controller",
    glow: "rgba(255, 197, 47, 0.5)",
    variants: [
      { id: "wired", label: "Wired", path: "/alt-icons/eren-yeagar.svg" },
      { id: "wireless", label: "Wireless", path: "/alt-icons/eren-yeagar-wireless.svg" }
    ]
  },
  {
    id: "mikasa-ackerman",
    label: "Mikasa Ackerman",
    author: "(unknown)",
    link: "https://www.svgrepo.com/svg/246314/gamepad",
    path: "/alt-icons/mikasa-ackerman.svg",
    glow: "rgba(255, 100, 100, 0.4)"
  },
  {
    id: "sasha-braus",
    label: "Sasha Braus",
    author: "(unknown)",
    link: "https://www.svgrepo.com/svg/315930/gamepad-controller",
    glow: "rgba(255, 150, 50, 0.4)",
    variants: [
      { id: "wired", label: "Wired", path: "/alt-icons/sasha-braus.svg" },
      { id: "wireless", label: "Wireless", path: "/alt-icons/sasha-braus-wireless.svg" }
    ]
  },
  {
    id: "face-in-clouds",
    label: "Face in Clouds",
    author: "mono_font",
    link: "https://www.svgrepo.com/svg/521354/face-in-clouds",
    path: "/alt-icons/face-in-clouds.svg",
    glow: "rgba(255, 197, 47, 0.5)"
  },
];

export const getIconById = (id) => {
  // Handles both "modern" and "modern_wired" formats
  const [baseId] = id.split("_");
  return ICON_REGISTRY.find(icon => icon.id === baseId) || ICON_REGISTRY[0];
};

export const getActiveVariant = (icon, activeId) => {
  if (!icon.variants) return null;
  const parts = activeId.split("_");
  const variantId = parts.length > 1 ? parts[1] : icon.variants[0].id;
  return icon.variants.find(v => v.id === variantId) || icon.variants[0];
};
