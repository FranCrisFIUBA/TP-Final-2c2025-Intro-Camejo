
export default function noCache(req, res, next) {
    // HTTP/1.1
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

    // HTTP/1.0
    res.setHeader('Pragma', 'no-cache');

    // Proxies
    res.setHeader('Expires', '0');

    // Algunos CDNs (ej. Cloudflare)
    res.setHeader('Surrogate-Control', 'no-store');

    next();
}
