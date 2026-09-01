const COLOR_KEY = "lightbar_color";
const BRIGHTNESS_KEY = "lightbar_brightness";

export const DEFAULT_COLOR = { r: 0, g: 55, b: 255 };
export const DEFAULT_BRIGHTNESS = 100;
export const NO_RUMBLE = { weak: 0, strong: 0 };

// Settings used to be stored for a single controller, under unsuffixed keys.
// Those are still read as a fallback so an existing color survives the upgrade.
function read(key, id) {
  return localStorage.getItem(`${key}:${id}`) ?? localStorage.getItem(key);
}

export function loadSettings(id) {
  let rgb = DEFAULT_COLOR;
  try {
    const stored = read(COLOR_KEY, id);
    if (stored) rgb = JSON.parse(stored);
  } catch {
    rgb = DEFAULT_COLOR;
  }

  const brightness = Number.parseInt(read(BRIGHTNESS_KEY, id), 10);

  return {
    rgb,
    brightness: Number.isNaN(brightness) ? DEFAULT_BRIGHTNESS : brightness,
  };
}

export function saveSettings(id, { rgb, brightness }) {
  localStorage.setItem(`${COLOR_KEY}:${id}`, JSON.stringify(rgb));
  localStorage.setItem(`${BRIGHTNESS_KEY}:${id}`, String(brightness));
}

// Brightness is a multiplier on the chosen color rather than a separate
// setting the controller knows about, so it has to be folded in here.
export function toOutput(id, { rgb, brightness }, rumble = NO_RUMBLE) {
  const scale = brightness / 100;

  return {
    id,
    r: Math.round(rgb.r * scale),
    g: Math.round(rgb.g * scale),
    b: Math.round(rgb.b * scale),
    smallRumble: rumble.weak,
    largeRumble: rumble.strong,
  };
}
