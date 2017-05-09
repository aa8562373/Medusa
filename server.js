const http = require("http")
const path = require("path")
const fs = require("fs")
const querystring = require("querystring")

const express = require("express")
const bodyParser = require("body-parser")
//const restc = require("restc")

const app = express()

// app.use(restc.express())

app.use(bodyParser.urlencoded({
	extended: true
}))
app.use("/dist", express.static(path.join(__dirname, "dist")))

app.get("*", (req, res) => {
	res.sendFile(path.resolve(__dirname, "dist/index.html"))
})

app.post("/depression-api-liaoyuan/*", (req, res) => {
	const postData = querystring.stringify(req.body)
	const proxyRequest = http.request({
		host: process.argv[2] || "api.120xinmao.com",
		port: process.argv[3] || 80,
		path: req.path,
		method: req.method,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": Buffer.byteLength(postData)
		}
	}, (proxyResponse) => {
		res.writeHead(proxyResponse.statusCode, proxyResponse.headers)

		proxyResponse.pipe(res)
	})

	proxyRequest.write(postData)
	proxyRequest.end()
})

app.post("/depression-api/*", (req, res) => {
	const postData = querystring.stringify(req.body)
	const proxyRequest = http.request({
		host: process.argv[2] || "api.120xinmao.com",
		port: process.argv[3] || 80,
		path: req.path,
		method: req.method,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Content-Length": Buffer.byteLength(postData)
		}
	}, (proxyResponse) => {
		res.writeHead(proxyResponse.statusCode, proxyResponse.headers)

		proxyResponse.pipe(res)
	})

	proxyRequest.write(postData)
	proxyRequest.end()
})

app.listen(8800)