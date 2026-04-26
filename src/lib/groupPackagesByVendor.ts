import { BrowsePackage } from '@/hooks/useBrowsePackages';

export interface VendorGroup {
  vendor_user_id: string;
  vendor_name: string;
  vendor_avatar: string | null;
  vendor_city: string | null;
  vendor_state: string | null;
  is_verified: boolean;
  avg_rating: number;
  review_count: number;
  distance_miles: number | null;
  starting_price: number;
  category: string | null;
  has_instant_book: boolean;
  packages: BrowsePackage[]; // top 3 sorted
}

/**
 * Group an already-filtered list of packages by vendor.
 * Each Vendor card surfaces up to `maxPerVendor` packages, ranked by:
 *   1) instant_book first  2) lower price first
 */
export function groupPackagesByVendor(
  packages: BrowsePackage[],
  maxPerVendor = 3,
): VendorGroup[] {
  const map = new Map<string, BrowsePackage[]>();
  for (const pkg of packages) {
    if (!pkg.vendor_user_id) continue;
    const arr = map.get(pkg.vendor_user_id) ?? [];
    arr.push(pkg);
    map.set(pkg.vendor_user_id, arr);
  }

  const groups: VendorGroup[] = [];
  for (const [vendor_user_id, pkgs] of map) {
    const sorted = [...pkgs].sort((a, b) => {
      if (a.instant_book !== b.instant_book) return a.instant_book ? -1 : 1;
      return (a.price ?? 0) - (b.price ?? 0);
    });
    const top = sorted.slice(0, maxPerVendor);
    const first = sorted[0];
    groups.push({
      vendor_user_id,
      vendor_name: first.vendor_name,
      vendor_avatar: first.vendor_avatar,
      vendor_city: first.vendor_city,
      vendor_state: first.vendor_state,
      is_verified: first.is_verified,
      avg_rating: first.avg_rating,
      review_count: first.review_count,
      distance_miles: first.distance_miles,
      starting_price: sorted.reduce((min, p) => Math.min(min, p.price ?? Infinity), Infinity),
      category: first.category,
      has_instant_book: sorted.some((p) => p.instant_book),
      packages: top,
    });
  }

  // Vendors with the most matching packages bubble up first, then by rating
  return groups.sort((a, b) => {
    if (b.packages.length !== a.packages.length) return b.packages.length - a.packages.length;
    return (b.avg_rating ?? 0) - (a.avg_rating ?? 0);
  });
}
