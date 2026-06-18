const P = 'https://images.pexels.com/photos';

const minioEndpoint = String(import.meta.env.VITE_MINIO_URL).replace(/\/$/, '');
const minioBucket = String(import.meta.env.VITE_MINIO_BUCKET).trim();

// Main category hero images
export const CATEGORY_IMAGES: Record<string, string> = {
  microcontroller: `${P}/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600`,
  sbc:             `${P}/1476321/pexels-photo-1476321.jpeg?auto=compress&cs=tinysrgb&w=600`,
  transistor:      `${P}/943096/pexels-photo-943096.jpeg?auto=compress&cs=tinysrgb&w=600`,
  sensor:          `${P}/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=600`,
  'op-amp':        `${P}/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600`,
  'power-regulator': `${P}/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=600`,
  communication:   `${P}/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=600`,
  display:         `${P}/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600`,
  default:         `${P}/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=600`,
};

// Technical/pinout/schematic images per category
export const CATEGORY_TECH_IMAGES: Record<string, string[]> = {
  microcontroller: [
    `${P}/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  sbc: [
    `${P}/1476321/pexels-photo-1476321.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  transistor: [
    `${P}/943096/pexels-photo-943096.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  sensor: [
    `${P}/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  'op-amp': [
    `${P}/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  'power-regulator': [
    `${P}/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  communication: [
    `${P}/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/1476321/pexels-photo-1476321.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  display: [
    `${P}/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/2582928/pexels-photo-2582928.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
  default: [
    `${P}/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=600`,
    `${P}/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600`,
  ],
};

export interface ComponentImages {
  main: string;
  gallery: Array<{ src: string; label: string }>;
}

function toMinioPublicUrl(imagePath: string): string {
  const cleanPath = imagePath.trim().replace(/^\/+/, '');
  if (!cleanPath) return '';

  if (cleanPath.startsWith(`${minioBucket}/`)) {
    return `${minioEndpoint}/${cleanPath}`;
  }

  return `${minioEndpoint}/${minioBucket}/${cleanPath}`;
}

export function resolveImageUrl(imageValue: string): string {
  const value = imageValue.trim();
  if (!value) return '';

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  // Allow values like s3://eletronic-component/path/to/file.jpg
  if (value.startsWith('s3://')) {
    const withoutScheme = value.slice(5);
    return toMinioPublicUrl(withoutScheme);
  }

  return toMinioPublicUrl(value);
}

export function getComponentImage(component: {
  image_url: string;
  categories?: { slug: string } | null;
}): string {
  const resolved = resolveImageUrl(component.image_url ?? '');
  if (resolved) return resolved;

  const slug = component.categories?.slug ?? 'default';
  return CATEGORY_IMAGES[slug] ?? CATEGORY_IMAGES.default;
}

export function getComponentGallery(component: {
  image_url: string;
  specs?: Record<string, unknown>;
  categories?: { slug: string } | null;
}): Array<{ src: string; label: string }> {
  // Read saved gallery from specs._gallery
  const saved = component.specs?._gallery;
  if (Array.isArray(saved) && saved.length > 0) {
    const entries = (saved as { label: string; src: string }[])
      .filter((g) => g.src)
      .map((g) => ({ src: resolveImageUrl(g.src), label: g.label }));
    if (entries.length > 0) return entries;
  }

  // Fallback: just main image
  const main = getComponentImage(component);
  return [{ src: main, label: 'Component Image' }];
}
