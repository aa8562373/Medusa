<template>
	<div id="app" class="profile-quiz" :class="{overflow: showImgStatus}">
		<headers :title="'我的提问'" :placeholder="true"></headers>

		<transition name="fade">
			<list :url="url" :params="params" :count="count" v-on:requestComplete="requestComplete">
				<ul v-if="list.length">
					<quiz-panel :quiz="item" :key="item.advisoryId" :index="index" v-for="(item, index) of list" @deleteQuiz="deleteQuiz" @showImg="showImg"></quiz-panel>
				</ul>
			</list>
		</transition>

		<tips :message="message" @cancelMessage="message = ''"></tips>

		<transition name="scale">
			<slide :imgs="imgs" :currentIndex="imgIndex" v-if="showImgStatus" @hiddenImg="hiddenImg"></slide>
		</transition>
	</div>
</template>

<script>
	import headers from "../components/headers"
	import tips from "../components/tips"
	import slide from "../components/ui/slide"
	import list from "../components/list"
	import quizPanel from "../components/ui/quiz_panel"
	import {getResponses} from "../api"
	import {serialize, timeFormat, lazy} from "../utils"

	export default {
		name: "quizKeep",
		data() {
			return {
				list: [],
				message: "",

				imgs: [],
				imgIndex: 0,
				showImgStatus: false,

				count: 0,
				url: "Advisory/V1/obtainMyAdvisoryList.json"
			}
		},
		created() {
			document.title = "我的提问"
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
			params() {
				const params = {
					mid: this.mid,
					pageSize: 10
				}

				return serialize(params)
			}
		},
		components: {
			headers,
			list,
			tips,
			slide,
			quizPanel
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (! vm.mid) {
					next("/login")
				}

				next()
			})
		},
		methods: {
			requestComplete(data) {
				this.list = this.list.concat(data.advisoryDTOs)

				this.count = this.list.length

				this.$nextTick(lazy)
			},
			showImg(value, index) {
				this.showImgStatus = true

				//this.imgs = this.list[value].imgs.map((img) => "http://wx2.sinaimg.cn/mw690/bd039205gy1fetmy823huj21945l7e85.jpg")
				this.imgs = this.list[value].imgs.map((img) => this.prefix + img.imgPath + this.postfix)

				this.imgs.push("http://wx2.sinaimg.cn/mw690/bd039205gy1fetmy823huj21945l7e85.jpg")

				this.imgIndex = index
			},
			hiddenImg() {
				this.showImgStatus = false
			},
			deleteQuiz(message, index) {
				this.message = message

				this.list.splice(index, 1)
			}
		}
	}
</script>