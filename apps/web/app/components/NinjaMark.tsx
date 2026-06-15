import Image from 'next/image';

const PACK = '/nmb_transparent_logo_pack';

// Symbol-only mark — silver on transparent. Use on any dark surface.
export default function NinjaMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src={`${PACK}/ninja_mountain_logo_symbol_transparent.png`}
      alt="Ninja Mountain symbol"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}

// Symbol-only mark — dark ink on transparent. Use on light surfaces (email, print).
export function NinjaMarkDark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src={`${PACK}/ninja_mountain_logo_symbol_transparent_dark.png`}
      alt="Ninja Mountain symbol"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}

// Full lockup — symbol + wordmark + domain, silver on transparent. Use on dark surfaces.
export function NinjaMarkFull({ size = 200 }: { size?: number }) {
  return (
    <Image
      src={`${PACK}/ninja_mountain_logo_full_transparent.png`}
      alt="Ninja Mountain"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}

// Full lockup — dark ink on transparent. Use on light surfaces (email, print).
export function NinjaMarkFullDark({ size = 200 }: { size?: number }) {
  return (
    <Image
      src={`${PACK}/ninja_mountain_logo_full_transparent_dark.png`}
      alt="Ninja Mountain"
      width={size}
      height={size}
      className="object-contain"
    />
  );
}
