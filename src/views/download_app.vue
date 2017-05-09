<style src="../css/download_app"></style>

<template>
	<div id="app" class="download-app">
		<span class="btn" @click="invoke">立即打开</span>
		<a href="/">访问触屏版</a>
	</div>
</template>

<script>
	import {invoke} from "../utils"

	export default {
		created() {
			//this.invoke()
		},
		methods: {
			invoke() {
				invoke({
					protocal: "app",
					path: `xinmaoApp/wakeapp`,
					universalLinks: `https://release.120xinmao.com/invoke`,
					fail: () => {
						location.href = "http://a.app.qq.com/o/simple.jsp?pkgname=com.xinmao.depressive"
					}
				})
			}
		}
	}
</script>