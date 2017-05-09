<style src="../css/profile"></style>

<template>
	<div id="app" class="profile">
		<div class="profile-header-wrapper">
			<div class="header" v-if="mid">
				<router-link :to="'/profile/' + mid">
					<template v-if="avatar">
						<div class="avatar-wrapper" :style="{backgroundImage: 'url(' + prefix + avatar + postfix + ')'}"></div>
					</template>
					<template v-else>
						<div class="no-avatar">
							<svg>
								<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#avatar-default"></use>
							</svg>
						</div>
					</template>
				</router-link>
				<div class="info">
					<span class="name" v-text="nickname"></span>
					<span>关注1217</span>
					<span class="follower">粉丝1217</span>
				</div>
			</div>
			<router-link class="header more" to="/login" v-else>
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#avatar-default"></use>
				</svg>
				<div class="info">
					<span class="name">登录/注册</span>
					<span>登录后享受更多特权</span>
				</div>
			</router-link>
			<router-link class="setting" to="/profile/setting" v-if="mid">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#setting"></use>
				</svg>
			</router-link>
		</div>
		<div class="profile-column">
			<router-link v-for="item of profileColumn" :key="item.path" :to="item.path">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'#profile-' + item.svg"></use>
				</svg>
				{{item.text}}
			</router-link>
		</div>
		<ul class="profile-list">
			<li class="more">
				<router-link to="/order">
					我的订单
				</router-link>
			</li>
			<li class="more">
				<a href="https://m.120xinmao.com/invite" target="_blank">咨询师入驻</a>
			</li>
		</ul>
		<ul class="profile-list">
			<li class="more">
				<router-link to="/profile/feedback">
					我的反馈
				</router-link>
			</li>
			<li class="more" v-if="isShare" @click="share">分享给好友</li>
			<li class="more" v-if="isShareUC" @click="toShareByUC">分享给好友</li>
			<li class="more">
				<a href="http://a.app.qq.com/o/simple.jsp?pkgname=com.xinmao.depressive" target="_blank">下载心猫 App</a>
			</li>
		</ul>
		<page-nav></page-nav>

		<share :statusProps="shareStatusUC"></share>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import {getResponses} from "../api"
	import {serialize, lazy} from "../utils"
	import tips from "../components/tips"
	import pageNav from "../components/page_nav"
	import avatar from "../components/ui/avatar"
	import share from "../components/ui/share"

	export default {
		name: "profileKeep",
		data() {
			return {
				avatar: "",
				nickname: "",


				shareStatusUC: false,

				message: "",

				profileColumn: [
					{
						path: "/profile/quiz",
						text: "提问",
						svg: "quiz"
					},
					{
						path: "/profile/circle",
						text: "心友圈",
						svg: "circle"
					},
					{
						path: "/profile/test",
						text: "测试",
						svg: "test"
					},
					{
						path: "/profile/collection",
						text: "收藏",
						svg: "collect"
					}
				]
			}
		},
		computed: {
			isShare() {
				return navigator.share
			},
			isShareUC() {
				return window.ucweb || window.ucbrowser
			},
			mid() {
				return this.$store.state.mid
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			notice() {
				return this.$store.state.notice
			},
			// avatar() {
			// 	return this.$store.state.avatar
			// },
			prefix() {
				return this.$store.state.prefix
			},
			postfix() {
				return this.webp ? "?imageView2/1/format/webp" : ""
			},
			webp() {
				return this.$store.state.webp
			}
		},
		components: {
			tips,
			share,
			avatar,
			pageNav
		},
		created() {
			document.title = "我的"

			this.mid && this.getProfile()

			setTimeout(() => {
				if (this.notice) {
					this.message = this.notice

					this.$store.commit("notice", "")
				}
			}, 0)
		},
		methods: {
			share() {
				navigator.share({
				    title: "心猫",
				    text: "Hello World",
				    url: "https://m.120xinmao.com"
				})
			},
			toShareByUC() {
				this.shareStatusUC = true
			},
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
			async getProfile() {
				const params = {
					mid: this.mid
				}
				const data = await getResponses(`${this.urlPrefix}depression/api/obtainUserHomepage.json`, serialize(params))

				if (data.code === 0) {
					this.avatar = data.userHomepageDTO.avatarThumbnailAbs
					this.nickname = data.userHomepageDTO.nickname

					const user = JSON.parse(localStorage.getItem("profile"))

					user.avatar = this.avatar
					user.nickname = this.nickname

					localStorage.setItem("profile", JSON.stringify(user))

					this.$nextTick(lazy)

					return
				}

				this.message = data.msg
			}
		}
	}
</script>