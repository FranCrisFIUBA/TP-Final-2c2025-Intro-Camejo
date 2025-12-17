
export async function logResponse(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.debug(`Response: ${req.method} ${req.url} -> ${res.statusCode} (estimate: ${duration}ms)`);
        console.trace(`Response Body: ${JSON.stringify(res.body)}`);
    })
    next()
}
