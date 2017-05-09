import promise from "es6-promise"
import "whatwg-fetch"

export const getResponse = async (url) => {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	}).catch((error) => {
		console.log(error)
	})

	return await response.json().catch((error) => {
		console.log(error)
	})
}

export const getResponses = async (url, params) => {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: params
	}).catch((error) => {
		console.log(error)
	})

	return await response.json().catch((error) => {
		console.log(error)
	})
}

export const getResponsesFile = async (url, params) => {
	const response = await fetch(url, {
		method: "POST",
		body: params
	}).catch((error) => {
		console.log(error)
	})

	return await response.json().catch((error) => {
		console.log(error)
	})
}