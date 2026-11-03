/**
 * Global Site Visibility Mode
 *
 * "UNREACHABLE" : Returns a native HTTP 503 "This site can't be reached (ERR_CONNECTION_REFUSED)" screen.
 * "MAINTENANCE" : Returns the luxury Marga Jewelry "Website Temporarily Inactive" maintenance screen.
 * "LIVE"        : Full public boutique is live with all 9 products, cart, & checkout.
 *
 * (In all modes, the Admin Portal at /admin remains accessible to the store owner)
 */
export const SITE_MODE: "LIVE" | "MAINTENANCE" | "UNREACHABLE" = "LIVE";
