<style src="../css/homepage"></style>

<template>
	<div id="app" class="homepage">
		<headers :title="nickname" :placeholder="true" v-if="headersStatus"></headers>
		<header class="header">
			<span class="back" @click="back"></span>
			<avatar :avatar="avatar"></avatar>
			<p v-text="nickname"></p>
			<p>关注 12 | 粉丝 30</p>
			<p class="signature" v-text="signature.slice(0, 20)"></p>
		</header>
		<bbb :tabs="tabs">
			<list class="homepage-list" :style="{width: width, height: sectionHeight}" :url="url" :params="params" :count="count" :hiddenLoading="true" v-on:requestComplete="requestComplete">
				<ul v-if="list.length">
					<quan v-for="(item, index) of list" :key="item.updateId" :detail="item" :index="index" v-on:showImg="showImg" v-on:deleteMood="deleteMood"></quan>
				</ul>
			</list>
			<list class="homepage-list" :style="{width: width, height: sectionHeight}" :url="followerURL" :params="followerParams" :count="followerCurrentCount" :hiddenLoading="true" v-on:requestComplete="followerRequestComplete">
				<ul v-if="followerList.length">
					<followerPanel class="follower-panel" v-for="(item, index) of followerList" :item="item" :key="item.mid" v-on:popup="showPopup" v-on:message="showMessage"></followerPanel>
				</ul>
			</list>
			<list class="homepage-list" :style="{width: width, height: sectionHeight}" :url="fansURL" :params="fansParams" :count="fansCurrentCount" :hiddenLoading="true" v-on:requestComplete="fansRequestComplete">
				<ul v-if="fansList.length">
					<followerPanel class="follower-panel" v-for="(item, index) of fansList" :item="item" :key="item.mid" v-on:popup="showPopup" v-on:message="showMessage"></followerPanel>
				</ul>
			</list>
		</bbb>

		<transition name="scale">
			<slide :imgs="imgs" :currentIndex="imgIndex" v-if="showImgStatus" v-on:hiddenImg="hiddenImg"></slide>
		</transition>

		<popup :text="'确定不在关注此人？'" :cancelPopup="cancelFollowPopup" v-on:cancelPopup="cancelPopup">
			<span class="btn ok" @click="sureCancelFollow">确定</span>
		</popup>

		<loading :loading="loading"></loading>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	const width = window.innerWidth

	import {getResponses} from "../api"
	import headers from "../components/headers"
	import list from "../components/list"
	import quan from "../components/ui/quan"
	import followerPanel from "../components/ui/follower_panel"
	import slide from "../components/ui/slide"
	import bbb from "../components/ui/bbb"
	import avatar from "../components/ui/avatar"
	import popup from "../components/popup"
	import tips from "../components/tips"
	import loading from "../components/loading"
	import {serialize, lazy} from "../utils"

	export default {
		data() {
			return {
				dd: 0,
				avatar: "",
				nickname: "",
				signature: "",

				stage: 0,
				message: "",
				headersStatus: false,

				tabs: ["心友圈", "关注", "粉丝"],

				imgs: [],
				imgIndex: 0,
				showImgStatus: false,

				width: width + "px",
				sectionHeight: `${window.innerHeight - (1.68 * 55.2)}px`,
				lineWidth: width * 140 / 750,
				lineTranslate: 32.75 * width / 414,
				//listTranslate: 0,

				count: 0,
				url: "Heartmate/V1/obtainUpdateListForUser.json",

				followerCurrentCount: 0,
				followerCount: "",
				followerURL: "MemberConcern/obtainConcernFromViewList.json",
				followerList: [],
				cancelFollowPopup: false,

				fansCurrentCount: 0,
				fansCount: "",
				fansURL: "MemberConcern/obtainFansFromViewList.json",
				fansList: [],

				list: []
			}
		},
		components: {
			quan,
			slide,
			list,
			tips,
			bbb,
			avatar,
			popup,
			loading,
			headers,
			followerPanel
		},
		computed: {
			loading() {
				return this.dd !== 2
			},
			mid() {
				return this.$store.state.mid
			},
			// avatar() {
			// 	return this.$store.state.avatar
			// },
			// nickname() {
			// 	return this.$store.state.nickname
			// },
			prefix() {
				return this.$store.state.prefix
			},
			postfix() {
				return this.webp ? "?imageView2/1/format/webp" : ""
			},
			webp() {
				return this.$store.state.webp
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			listTranslate() {
				return this.stage * width
			},
			params() {
				const params = {
					mid: this.$route.params.id,
					pageSize: 10
				}

				return serialize(params)
			},
			followerParams() {
				const params = {
					fromMid: this.mid,
					toMid: this.$route.params.id,
					pageSize: 10
				}

				return serialize(params)
			},
			fansParams() {
				const params = {
					fromMid: this.mid,
					toMid: this.$route.params.id,
					pageSize: 10
				}

				return serialize(params)
			}
		},
		// beforeRouteEnter(to, from, next) {
		// 	next((vm) => {
		// 		if (! vm.mid) {
		// 			next("/login")
		// 		}

		// 		next()
		// 	})
		// },
		created() {
			this.getProfile()

			document.title = "我的主页"

			window.addEventListener("scroll", this.scroll, false)
		},
		destroyed() {
			window.removeEventListener("scroll", this.scroll, false)
		},
		beforeRouteUpdate() {
			this.getProfile()
		},
		methods: {
			back() {
				this.$router.back()
			},
			async getProfile() {
				const params = {
					mid: this.$route.params.id
				}
				const data = await getResponses(`${this.urlPrefix}depression/api/obtainUserHomepage.json`, serialize(params))

				if (data.code === 0) {
					this.dd++

					this.avatar = data.userHomepageDTO.avatarAbs
					this.nickname = data.userHomepageDTO.nickname
					this.signature = data.userHomepageDTO.signature

					this.$nextTick(lazy)

					return
				}

				this.message = data.msg
			},
			showImg(value, index) {
				this.showImgStatus = true

				this.imgs = this.list[value].imgs.map((img) => this.prefix + img.imgPath + this.postfix)

				this.imgIndex = index
			},
			hiddenImg() {
				this.showImgStatus = false
			},
			scroll() {
				// 193 是页面滚动到这个位置 导航条正好固定不动
				if (window.pageYOffset > 193 * width / 414) {
					this.headersStatus = true

					//this.sectionHeight = "11.7rem"
				} else {
					this.headersStatus = false

					//this.sectionHeight = "auto"
				}
			},
			requestComplete(data) {
				this.dd++

				this.list = this.list.concat(data.updateDTOs)

				this.count = this.list.length

				this.$nextTick(lazy)
			},
			followerRequestComplete(data) {
				this.followerList = this.followerList.concat(data.concernDTOs)

				this.followerCurrentCount = this.followerList.length

				this.$nextTick(lazy)
			},
			fansRequestComplete(data) {
				this.fansList = this.fansList.concat(data.fansDTOs)

				this.fansCurrentCount = this.fansList.length

				this.$nextTick(lazy)
			},
			async deleteMood(id, index) {
				this.list.splice(index, 1)

				const params = {
					updateId: id
				}
				const data = await getResponses(`${this.urlPrefix}Heartmate/V1/deleteUpdate.json`, serialize(params))

				if (data.code === 0) {
					this.message = "删除成功"

					return
				}

				this.message = data.msg
			},
			showMessage(message) {
				this.message = message
			},
			showPopup() {
				this.cancelFollowPopup = true
			},
			cancelPopup() {
				this.cancelFollowPopup = false
			},
			async sureCancelFollow() {
				this.cancelFollowPopup = false

				const params = {
					concernFrom: this.mid,
					concernTo: window.item.mid
				}

				const data = await getResponses(`${this.urlPrefix}MemberConcern/cancelMemberConcern.json`, serialize(params))

				if (data.code === 0) {
					window.item.isConcern = 1

					this.message = "取消关注成功"

					return
				}

				this.message = data.msg
			}
		}
	}
</script>