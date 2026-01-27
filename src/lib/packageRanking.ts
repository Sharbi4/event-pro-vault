import { BrowsePackage } from '@/hooks/useBrowsePackages';

export type SortOption = 'recommended' | 'price_low' | 'price_high' | 'top_rated' | 'nearest';

// Weights for the ranking algorithm
const RANKING_WEIGHTS = {
  FEATURED: 100,        // Featured packages get significant boost
  TOP_RATED: 30,        // Top rated (4.8+ with 10+ reviews)
  HIGH_RATING: 20,      // Good rating weight (4.0+)
  REVIEW_COUNT: 0.5,    // Per review (capped)
  INSTANT_BOOK: 15,     // Instant book preference
  VERIFIED: 10,         // Verified vendor
  DISTANCE_PENALTY: -2, // Per mile (when location search)
};

// Thresholds
const TOP_RATED_THRESHOLD = 4.8;
const TOP_RATED_MIN_REVIEWS = 10;
const HIGH_RATING_THRESHOLD = 4.0;
const MAX_REVIEW_COUNT_BOOST = 50; // Cap review count contribution

interface RankedPackage extends BrowsePackage {
  ranking_score?: number;
  is_featured?: boolean;
}

/**
 * Calculate a ranking score for a package
 */
export function calculateRankingScore(
  pkg: RankedPackage,
  hasLocationSearch: boolean
): number {
  let score = 0;

  // Featured boost
  if (pkg.is_featured) {
    score += RANKING_WEIGHTS.FEATURED;
  }

  // Rating boost
  if (pkg.avg_rating >= TOP_RATED_THRESHOLD && pkg.review_count >= TOP_RATED_MIN_REVIEWS) {
    score += RANKING_WEIGHTS.TOP_RATED;
  } else if (pkg.avg_rating >= HIGH_RATING_THRESHOLD) {
    score += RANKING_WEIGHTS.HIGH_RATING * (pkg.avg_rating / 5);
  }

  // Review count (capped)
  const reviewBoost = Math.min(pkg.review_count, MAX_REVIEW_COUNT_BOOST);
  score += reviewBoost * RANKING_WEIGHTS.REVIEW_COUNT;

  // Instant book boost
  if (pkg.instant_book) {
    score += RANKING_WEIGHTS.INSTANT_BOOK;
  }

  // Verified boost
  if (pkg.is_verified) {
    score += RANKING_WEIGHTS.VERIFIED;
  }

  // Distance penalty (if location search)
  if (hasLocationSearch && pkg.distance_miles !== null) {
    score += pkg.distance_miles * RANKING_WEIGHTS.DISTANCE_PENALTY;
  }

  return score;
}

/**
 * Sort packages by the specified sort option
 */
export function sortPackages(
  packages: RankedPackage[],
  sortBy: SortOption,
  hasLocationSearch: boolean
): RankedPackage[] {
  const sorted = [...packages];

  switch (sortBy) {
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);

    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);

    case 'top_rated':
      return sorted.sort((a, b) => {
        // Primary: rating (descending)
        if (b.avg_rating !== a.avg_rating) {
          return b.avg_rating - a.avg_rating;
        }
        // Secondary: review count (descending)
        return b.review_count - a.review_count;
      });

    case 'nearest':
      if (!hasLocationSearch) {
        // Fall back to recommended if no location
        return sortByRecommended(sorted, hasLocationSearch);
      }
      return sorted.sort((a, b) => {
        const aDist = a.distance_miles ?? Infinity;
        const bDist = b.distance_miles ?? Infinity;
        return aDist - bDist;
      });

    case 'recommended':
    default:
      return sortByRecommended(sorted, hasLocationSearch);
  }
}

/**
 * Sort by recommended (ranking algorithm)
 */
function sortByRecommended(
  packages: RankedPackage[],
  hasLocationSearch: boolean
): RankedPackage[] {
  return packages
    .map(pkg => ({
      ...pkg,
      ranking_score: calculateRankingScore(pkg, hasLocationSearch),
    }))
    .sort((a, b) => (b.ranking_score || 0) - (a.ranking_score || 0));
}

/**
 * Get sort option label
 */
export function getSortLabel(sortBy: SortOption): string {
  switch (sortBy) {
    case 'price_low':
      return 'Price: Low to High';
    case 'price_high':
      return 'Price: High to Low';
    case 'top_rated':
      return 'Top Rated';
    case 'nearest':
      return 'Nearest';
    case 'recommended':
    default:
      return 'Recommended';
  }
}

/**
 * Get all sort options
 */
export function getSortOptions(hasLocationSearch: boolean): { value: SortOption; label: string }[] {
  const options: { value: SortOption; label: string }[] = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'top_rated', label: 'Top Rated' },
  ];

  // Only show "Nearest" option if location search is active
  if (hasLocationSearch) {
    options.push({ value: 'nearest', label: 'Nearest' });
  }

  return options;
}
