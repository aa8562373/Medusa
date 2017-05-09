<template>
	<div id="app">
		<headers :title="'我的心友圈'" :placeholder="true"></headers>

		<transition name="fade">
			<list :url="url" :params="params" :currentCount="currentCount" v-on:requestComplete="requestComplete">
				<ul v-if="list.length">
					<quan v-for="(item, index) of list" :key="item.updateId" :detail="item" :index="index" v-on:showImg="showImg" v-on:deleteMood="deleteMood" v-on:like="like"></quan>
				</ul>
			</list>
		</transition>

		<transition name="scale">
			<slide :imgs="imgs" :currentIndex="imgIndex" v-if="showImgStatus" v-on:hiddenImg="hiddenImg"></slide>
		</transition>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import headers from "../components/headers"
	import list from "../components/list"
	import quan from "../components/ui/quan"
	import {serialize, lazy} from "../utils"
	import tips from "../components/tips"
	import slide from "../components/ui/slide"
	import {getResponses} from "../api"

	export default {
		name: "circleKeep",
		data() {
			return {
				list: [],
				message: "",

				currentCount: 0,
				url: "Heartmate/V1/obtainUpdateListForUser.json",

				imgs: [],
				imgIndex: 0,
				showImgStatus: false
			}
		},
		created() {
			document.title = "我的心友圈"
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
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
			params() {
				const params = {
					mid: this.mid,
					pageSize: 10
				}

				return serialize(params)
			}
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (! vm.mid) {
					next("/login")
				}

				next()
			})
		},
		components: {
			headers,
			list,
			tips,
			quan,
			slide
		},
		methods: {
			requestComplete(data) {
				this.list = this.list.concat(data.updateDTOs)

				this.currentCount = this.list.length

				this.$nextTick(lazy)
			},
			showImg(value, index) {
				this.showImgStatus = true

				this.imgs = this.list[value].imgs.map((img) => this.prefix + img.imgPath + this.postfix)

				this.imgIndex = index
			},
			hiddenImg() {
				this.showImgStatus = false
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
			like(message) {
				this.message = message
			}
		}
	}
</script>