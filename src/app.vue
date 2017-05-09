<template>
	<!-- <keep-alive :exclude="/keep$/i"> -->

		<router-view></router-view>
	<!-- </keep-alive> -->
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		created() {
			let value = document.documentElement.clientWidth
			const ua = navigator.userAgent

			if (ua.match(/MI 5/) && ua.match(/QQBrowser/) && ! ua.match(/MicroMessenger/)) {
				//value = (3 * value) / window.devicePixelRatio
				value = (3 * value) / 2.6 // 小米虽然 dpr 是3 但表现的依然是 2.6
			}

			const deviceWidth = Math.min(640, value)

			document.documentElement.style.fontSize = `${deviceWidth / 7.5}px`

			this.webp()

			// if (navigator.serviceWorker) {
			// 	navigator.serviceWorker.register("/sw.js", {
			// 		scope: "/"
			// 	}).then((registration) => {
			// 		console.log("sw 注册成功")
			// 	}).catch((e) => {
			// 		console.log("sw 注册失败")
			// 	})
			// }
		},
		methods: {
			webp() {
				const webpImg = new Image()

				webpImg.onload = () => {
					if (webpImg.width === 1) {
						this.$store.commit("webp", true)

						document.documentElement.classList.add("webp")
					}
				}

				webpImg.src = "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAgA0JaQAA3AA/vv9UAA="
			}
		}
	}
</script>