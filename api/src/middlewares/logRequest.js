
export async  function logRequest(req, res, next) {
    console.debug(`Request: ${req.method} ${req.url}`)
    console.trace(`Request Body: ${JSON.stringify(req.body)}`)
    next()
}
