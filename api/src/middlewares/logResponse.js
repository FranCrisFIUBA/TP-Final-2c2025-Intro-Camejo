export async function logResponse(req, res, next) {
    const start = Date.now();

    // envolver res.json ANTES de que sea llamado
    const originalJson = res.json.bind(res);

    res.json = (data) => {
        res.locals.body = data;   // guardo respuesta
        return originalJson(data);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;

        console.debug(
            `Response: ${req.method} ${req.url} -> ${res.statusCode} (estimate: ${duration}ms)`
        );

        console.trace(
            `Response Body: ${JSON.stringify(res.locals.body)}`
        );
    });

    next();
}
