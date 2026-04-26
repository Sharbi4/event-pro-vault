import { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

/**
 * Non-destructive redirect for legacy URLs.
 * Preserves query string + hash, supports :param substitution in `to`.
 * Uses replace so the old URL doesn't pollute browser history.
 */
interface LegacyRedirectProps {
  to: string;
}

export const LegacyRedirect = ({ to }: LegacyRedirectProps) => {
  const params = useParams();
  const location = useLocation();

  // Substitute :param tokens in `to` with current route params
  let target = to;
  for (const [key, value] of Object.entries(params)) {
    if (value) target = target.replace(`:${key}`, value);
  }

  const finalTo = `${target}${location.search}${location.hash}`;

  useEffect(() => {
    // Optional: lightweight log for analytics/debug
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.info(`[LegacyRedirect] ${location.pathname} → ${target}`);
    }
  }, [location.pathname, target]);

  return <Navigate to={finalTo} replace />;
};

export default LegacyRedirect;
