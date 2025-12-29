export function logRequest(req, res, next) {
    console.debug(`Request: ${req.method} ${req.originalUrl}`);

    if (req.method !== "GET") {
        console.trace("Request Body:", req.body);
    }

    next();
}
