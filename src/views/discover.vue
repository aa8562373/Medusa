<style src="../css/discover"></style>

<template>
	<div id="app" class="discover">
		<header class="common-header">
			<router-link to="/search">
				<svg class="search">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#search"></use>
				</svg>
			</router-link>
			<div class="title" :class="{'arrow-up': status}" @click="status = true">
				{{filterText}}
				<svg class="arrow-down">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow-down"></use>
				</svg>
			</div>
			<router-link to="/download_app">
				<svg class="message">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#message"></use>
				</svg>
			</router-link>
		</header>

		<list :url="url" :params="params" :currentCount="currentCount" v-on:requestComplete="requestComplete">
			<transition name="fade">
				<ul v-if="list.length">
					<quan v-for="(item, index) of list" :detail="item" :index="index" :key="item.mid" v-on:showImg="showImg" v-on:deleteMood="deleteMood">
						<div class="reply" v-if="item.reply">
							<span>{{item.reply.nickname}}:</span>
							<p class="reply-text" v-text="item.reply.content"></p>
						</div>
					</quan>
				</ul>
			</transition>
		</list>

		<span to="/discover/post" class="add-btn" @click="toPost"></span>

		<page-nav></page-nav>

		<transition name="scale">
			<slide :imgs="imgs" :currentIndex="imgIndex" v-if="showImgStatus" v-on:hiddenImg="hiddenImg"></slide>
		</transition>

		<transition name="pull-down">
			<div class="pull-down consult-type" v-if="status" @click="status = false">
				<ul class="content" @click.stop>
					<li :class="{selected: item.text === filterText}" v-text="item.text" v-for="item of filterList" @click="selectType(item)"></li>
				</ul>
			</div>
		</transition>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import {getResponses} from "../api"
	import {serialize, lazy} from "../utils"
	import pageNav from "../components/page_nav"
	import list from "../components/list"
	import tips from "../components/tips"
	import quan from "../components/ui/quan"
	import slide from "../components/ui/slide"

	export default {
		//name: "discoverKeep",
		data() {
			return {
				status: false,
				showImgStatus: false,
				message: "",

				url: "Heartmate/V1/searchUpdateList.json",
				currentCount: 0,

				type: 1,
				list: [],
				imgs: [],
				imgIndex: 0,

				filterText: "心友圈",
				filterList: [
					{
						text: "心友圈",
						type: 1
					},
					{
						text: "我关注的",
						type: 2
					},
					{
						text: "匿名动态",
						type: 3
					}
				]
			}
		},
		components: {
			tips,
			pageNav,
			quan,
			slide,
			list
		},
		created() {
			document.title = "发现"
		},
		watch: {
			type() {
				this.currentCount = -1
				this.list = []
			}
		},
		computed: {
			params() {
				const params = {
					pageSize: 10,
					type: this.type
				}

				this.mid && (params.vid = this.mid)

				return serialize(params)
			},
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
			}
		},
		methods: {
			selectType(item) {
				this.filterText = item.text
				this.type = item.type

				this.status = false
			},
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
			toPost() {
				if (! this.mid) {
					this.message = "请先登录"

					return
				}

				this.$router.push("/discover/post")
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
			}
		}
	}
</script>