<template>
	<transition name="modal">
		<div class="modal" v-if="statusProps" @click="hiddenShare">
			<div class="modal-content share-container" @click.stop>
				<div class="share-item" v-for="(item, index) of shares" v-text="item" @click="shareUC(index)"></div>
				<div class="share-item-last"></div>
			</div>
		</div>
	</transition>
</template>

<script>
	export default {
		props: ["statusProps"],
		data() {
			return {
				shares: ["QQ", "QQ空间", "微信", "朋友圈", "微博", "其他"]
			}
		},
		methods: {
			shareUC(value) {
				const shareList = ["QQ", "QZone", "WechatFriends", "WechatTimeline", "SinaWeibo", ""]
				const url = "https://m.120xinmao.com"
				const title = "心猫，您的心理健康守护者"
				const desc = "国内领先的在线心理健康管理与诊疗平台"
				const img = `${this.prefix}14918123981909506-64x64.png${this.postfix}`

				const ua = navigator.userAgent
				const isIOS = ua.match(/iPhone/)
				const isUC = !! ua.match(/UCBrowser/)
				const isQQ = !! window.qb

				if (value === 1) {
					const params = {
						url,
						title,
						desc,
						summary: desc,
						pics: img
					}
					window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?" + serialize(params))

					return
				}

				if (isUC) {
					if (isIOS) {

						shareList[value] = "k" + shareList[value]

						if (value === 2) {
							shareList[value] = "kWeixin"
						}

						if (value === 3) {
							shareList[value] = "kWeixinFriend"
						}

						ucbrowser.web_share(title, img, url, shareList[value], "", "@心猫", "")

						return
					}

					ucweb.startRequest("shell.page_share", [title, desc, url, shareList[value], "", "@心猫", ""])

					return
				}

				if (isQQ) {
					window.browser.app.share({
						url,
						title,
						description: desc,
						img_url: img,
						cus_txt: "111111111111"
					})
				}
			},
			hiddenShare() {
				this.$emit("hiddenShare")
			}
		}
	}
</script>