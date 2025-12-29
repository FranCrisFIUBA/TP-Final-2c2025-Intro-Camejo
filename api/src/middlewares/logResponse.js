export function logResponse(req, res, next) {
    const start = Date.now();

    const originalSend = res.send;

    res.send = function (body) {
        res._body = body;
        return originalSend.call(this, body);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        console.debug(
            `Response: ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
        );

        if (res._body !== undefined) {
            try {
                console.trace("Response Body:", res._body);
            } catch {
                console.trace("Response Body: [unserializable]");
            }
        }
    });

    next();
}
