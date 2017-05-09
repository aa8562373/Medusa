export const serialize = (obj) => {
	let str = ""

	for (let key in obj) {
		str += `${key}=${encodeURIComponent(obj[key])}&`
	}

	str = str.slice(0, -1)

	return str
}

export const getURLParams = () => {
	let a = location.search.slice(1),
		b = a.split("&"),
		c = {}

	b.forEach(function (item, index) {
		let name = item.split("=")[0],
			value = item.split("=")[1]

		c[name] = value
	})

	return c
}

export const lazy = (offset = 20) => {
	const check = () => {
		let items = Array.from(document.querySelectorAll("[data-url]"), (el) => {
			return {
				el: el,
				img: el.lastElementChild,
				url: el.dataset.url
			}
		})

		items = items.filter((item) => {
			let top = item.el.getBoundingClientRect().top

			if (top >= -offset && top <= window.innerHeight + offset) {
				let img = new Image()

				img.src = item.url

				img.onload = () => {
					item.el.style.backgroundColor = "transparent"
					item.el.removeAttribute("data-url")

					item.img.style.opacity = 1
					item.img.style.backgroundImage = `url(${item.url})`

					img.onload = null
					img = null
				}

				return false
			}

			return true
		})

		if (! items.length) {
			window.removeEventListener("scroll", setTimeout(check), false)
		}
	}

	check()

	window.addEventListener("scroll", check, false)
}

export const timeFormat = (timestamp) => {
	// if (timestamp.indexOf(" ") !== -1) {
	// 	timestamp = + new Date(timestamp)
	// }

	const now = Date.now()
	const nowDate = new Date(now)
	const agoDate = new Date(timestamp)

	timestamp = + agoDate

	let str = ""

	// 1小时内
	if (now - timestamp <= 60 * 60 * 1000) {
		str =  ~~ ((now - timestamp) / (60 * 1000))

		return str === 0 ? "刚刚" : `${str}分钟前`
	}

	// 24小时内
	if (now - timestamp <= 24 * 60 * 60 * 1000) {
		str =  ~~ ((now - timestamp) / (60 * 60 * 1000))

		return `${str}小时前`
	}

	// 2天内
	if (now - timestamp > 24 * 60 * 60 * 1000 && now - timestamp <= 2 * 24 * 60 * 60 * 1000) {
		//str =  ~~ ((now - timestamp) / (60 * 60 * 1000))

		return "昨天"
	}

	// 显示星期
	if (now - timestamp > 2 * 24 * 60 * 60 * 1000 && now - timestamp <= 3 * 24 * 60 * 60 * 1000) {
		//str =  ~~ ((now - timestamp) / (60 * 60 * 1000))

		str = ["日", "一", "二", "三", "四", "五", "六"][new Date(timestamp).getDay()]

		return `星期${str}`
	}

	// 大于一年
	if (nowDate.getFullYear() - agoDate.getFullYear()) {
		//str =  ~~ ((now - timestamp) / (60 * 60 * 1000))

		return `${agoDate.getFullYear()}-${agoDate.getMonth() + 1}-${agoDate.getDate()}`.replace(/\b(\w)\b/g, "0$1")
	}

	// 一年之内
	return `${agoDate.getMonth() + 1}-${agoDate.getDate()}`.replace(/\b(\w)\b/g, "0$1")
}

export const invoke = function (config) {
    const ua = navigator.userAgent
    const browser = {
        isAndroid: !! ua.match(/Android/),
        isIOS: !! ua.match(/iPhone|iPad|iPod/),
        isWX: !! ua.match(/MicroMessenger/),
        isChrome: !! window.chrome
    }

    const invokeStart = (config) => {
        if (typeof config.timeout === "undefined") {
            config.timeout = 3000
        } else {
            if (typeof config.timeout !== "number") {
                throw new TypeError("config.timeout 必须是 Number 类型")
            }
        }

        let schema = config.protocal + "://" + config.path

        if (browser.isIOS) {
            schema = config.universalLinks
        }

        const iframe = document.createElement("iframe"),
            aLink = document.createElement("a"),
            body = document.body

        aLink.style.cssText = iframe.style.cssText = "display:none;width:0px;height:0px;"

        if (browser.isWX && browser.isAndroid) {
            config.fail()
        } else if (browser.isIOS || browser.isChrome) {
            aLink.href = schema
            body.appendChild(aLink)

            aLink.click()
        } else {
            body.appendChild(iframe)

            iframe.src = schema
        }

        let timer = setTimeout(() => {
            config.fail()
        }, config.timeout)

        const change = () => {
            clearTimeout(timer)

            config.success && config.success()
        }

        document.addEventListener("visibilitychange", change, false)
        document.addEventListener("webkitvisibilitychange", change, false)

        window.addEventListener("pagehide", change, false)
    }

    invokeStart(config)
}