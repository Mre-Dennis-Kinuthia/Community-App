const http = require("http")
const { URL } = require("url")

const serviceName = "community-backend"
const port = Number.parseInt(process.env.PORT || "4000", 10)
const host = process.env.HOST || "0.0.0.0"

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" })
  res.end(JSON.stringify(payload))
}

function route(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`)

  if (req.method === "GET" && url.pathname === "/health") {
    return json(res, 200, { ok: true, service: serviceName })
  }

  if (req.method === "GET" && url.pathname === "/version") {
    return json(res, 200, {
      service: serviceName,
      env: process.env.NODE_ENV || "development",
    })
  }

  return json(res, 404, { error: "Not found" })
}

const server = http.createServer(route)

server.listen(port, host, () => {
  console.log(`Backend listening on http://${host}:${port}`)
})

function shutdown(signal) {
  console.log(`Received ${signal}, shutting down...`)
  server.close(() => {
    console.log("HTTP server closed")
    process.exit(0)
  })
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))

