export function sanitizeName(value: string): string {
  return value.replace(/[^a-zA-Z\s]/g, "");
}

export function sanitizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

export interface StructuredAddress {
  unit: string;
  street: string;
  subdivision: string;
  barangay: string;
  city: string;
  zipCode: string;
  province: string;
}

export function parseAddress(address: string | undefined | null): StructuredAddress {
  const fallback = {
    unit: "",
    street: "",
    subdivision: "",
    barangay: "",
    city: "",
    zipCode: "",
    province: "",
  };

  if (!address) return fallback;

  try {
    if (address.startsWith("{") && address.endsWith("}")) {
      const parsed = JSON.parse(address);
      return {
        unit: parsed.unit ?? "",
        street: parsed.street ?? "",
        subdivision: parsed.subdivision ?? "",
        barangay: parsed.barangay ?? "",
        city: parsed.city ?? "",
        zipCode: parsed.zipCode ?? "",
        province: parsed.province ?? "",
      };
    }
  } catch (e) {
    // Ignore and fall back
  }

  // Fallback to legacy string format
  return {
    ...fallback,
    unit: address,
  };
}

export function normalizeAddress(addr: StructuredAddress): StructuredAddress {
  const normalizeField = (val: string) => {
    const trimmed = val.trim();
    return trimmed.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
  };

  return {
    unit: addr.unit.trim(),
    street: normalizeField(addr.street),
    subdivision: normalizeField(addr.subdivision),
    barangay: normalizeField(addr.barangay),
    city: normalizeField(addr.city),
    zipCode: addr.zipCode.trim(),
    province: normalizeField(addr.province),
  };
}

export function formatAddress(addr: StructuredAddress): string {
  return JSON.stringify(normalizeAddress(addr));
}

export function renderAddress(addr: StructuredAddress | string | undefined | null): string {
  if (!addr) return "";
  if (typeof addr === "string") {
    if (addr.startsWith("{") && addr.endsWith("}")) {
      return renderAddress(parseAddress(addr));
    }
    return addr;
  }
  
  const parts: string[] = [];
  const unitStreet = [addr.unit, addr.street].filter(Boolean).join(" ");
  if (unitStreet) parts.push(unitStreet);
  
  if (addr.subdivision) parts.push(addr.subdivision);
  if (addr.barangay) parts.push(addr.barangay);
  if (addr.city) parts.push(addr.city);
  
  const zipProvince = [addr.zipCode, addr.province].filter(Boolean).join(" ");
  if (zipProvince) parts.push(zipProvince);
  
  return parts.join(", ");
}
