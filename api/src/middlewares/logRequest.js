
export async  function logRequest(req, res, next) {
    console.debug(`Request: ${req.method} ${req.url}`)
    console.trace(`Request Body: ${req.body}`)
    next()
}
