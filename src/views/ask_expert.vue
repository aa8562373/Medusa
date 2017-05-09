<style src="../css/ask_expert"></style>

<template>
	<div id="app" class="consult">
		<header class="common-header">
			<router-link to="/search">
				<svg class="search">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#search"></use>
				</svg>
			</router-link>
			<div class="switch-expert-type">
				<router-link to="/consult" exact>找专家</router-link>
				<router-link to="/consult/ask" exact>问专家</router-link>
			</div>
			<router-link to="/download_app">
				<svg class="message">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#message"></use>
				</svg>
			</router-link>
		</header>
		<div class="ask-expert list-container">
			<header class="header">
				<div>
					<ul :style="{width: tags.length * (width * 142 / 750) + 'px', transform: 'translateX(-' + translateWrapper + 'px)'}">
						<li v-for="item of tags" v-text="item.phrase" @click="selectTag(item, $event)"></li>
					</ul>
					<span class="line" :style="{width: ss + 'px', transform: 'translateX(' + translate + 'px)'}" v-if="! tagLoading"></span>
				</div>
				<span class="filter-btn">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#filter-btn"></use>
					</svg>
				</span>
			</header>

			<list :index="tagId" :url="url" :params="params" :currentCount="currentCount" :hiddenLoading="hiddenLoading" v-on:requestComplete="requestComplete">
				<transition name="fade">
					<ul v-if="list.length">
						<quiz-panel :quiz="item" :key="item.advisoryId" :index="index" v-for="(item, index) of list" v-on:deleteQuiz="deleteQuiz" v-on:showImg="showImg"></quiz-panel>
					</ul>
				</transition>
			</list>

			<router-link to="/consult/post" class="quiz-btn">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#quiz"></use>
				</svg>
			</router-link>

			<transition name="scale">
				<slide :imgs="imgs" :currentIndex="imgIndex" v-if="showImgStatus" v-on:hiddenImg="hiddenImg"></slide>
			</transition>

			<tips :message="message" @cancelMessage="message = ''"></tips>
		</div>

		<page-nav :actived="actived"></page-nav>
	</div>
</template>

<script>
	const width = window.innerWidth

	import {getResponses} from "../api"
	import {serialize, timeFormat, lazy} from "../utils"
	import list from "../components/list"
	import tips from "../components/tips"
	import quizPanel from "../components/ui/quiz_panel"
	import slide from "../components/ui/slide"
	import pageNav from "../components/page_nav"

	export default {
		//name: "askExpertKeep",
		data() {
			return {
				actived: true,
				currentCount: 0,
				url: "Advisory/V1/searchAdvisoryList.json",
				hiddenLoading: false,

				imgs: [],
				imgIndex: 0,
				showImgStatus: false,

				tags: [
					{
						phrase: "全部",
						tagId: 1001
					},
					{
						phrase: "推荐",
						tagId: 1000
					}
				],

				message: "",
				tagId: 1001,

				//prefix: "https://oml9ntix5.qnssl.com/",

				ss: width * 88 / 750,
				width: window.innerWidth,
				translateWrapper: 0,
				translate: (window.innerWidth / 7.5 * .28) - 8,

				list: [],
				tagLoading: true,
			}
		},
		components: {
			tips,
			list,
			slide,
			pageNav,
			quizPanel
		},
		created() {
			this.getAskExpertData()
		},
		watch: {
			tagId() {
				this.currentCount = -1
				this.list = []
			}
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
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
					pageSize: 10,
					tagId: this.tagId
				}

				return serialize(params)
			}
		},
		filters: {
			format(value) {
				return timeFormat(value)
			}
		},
		methods: {
			async getAskExpertData() {
				await this.getAskExpertTags()
				//await this.getAskExpertList()
			},
			async getAskExpertTags() {
				const params = {
					pageIndex: 1,
					pageSize: 10
				}
				const data = await getResponses(`${this.urlPrefix}MemberAdvisory/obtainAdvisoryTagList.json`, serialize(params))

				this.tagLoading = false
				this.tags = this.tags.concat(data.advisoryTags)

				sessionStorage.setItem("askExpertTags", JSON.stringify(this.tags))
			},
			requestComplete(data) {
				this.list = this.list.concat(data.advisoryDTOs)

				this.count = this.list.length

				this.$nextTick(lazy)
			},
			// async deleteAsk(item, index) {
			// 	this.list.splice(index, 1)

			// 	const params = {
			// 		advisoryId: item.advisoryId
			// 	}
			// 	const data = await getResponses("/depression-api/Advisory/V1/deleteAdvisory.json", serialize(params))

			// 	if (data.code === 0) {
			// 		this.message = "删除成功"

			// 		return
			// 	}

			// 	this.message = data.msg
			// },
			showImg(value, index) {
				this.showImgStatus = true

				this.imgs = this.list[value].imgs.map((img) => this.prefix + img.imgPath + this.postfix)

				this.imgIndex = index
			},
			hiddenImg() {
				this.showImgStatus = false
			},
			selectTag(item, e) {
				this.tagId = item.tagId

				const x = e.clientX
				const middle = (width - 100) / 2
				const rect = e.target.getBoundingClientRect()

				const btnWidth = width * 50 / 375
				const divWidth = width - btnWidth
				const maxTranslate = this.tags.length * (width * 142 / 750) - divWidth
				const step = width * 70 / 414

				if (rect.left < 0) {

					if (this.translateWrapper + rect.left - step < 0) {
						this.translateWrapper = 0
					} else {
						this.translateWrapper = this.translateWrapper + rect.left - step
					}
				}

				if (rect.right > width - btnWidth) {
					console.log(1111)

					if (this.translateWrapper + rect.right - divWidth + step > maxTranslate) {
						this.translateWrapper = maxTranslate
					} else {
						this.translateWrapper += rect.right - divWidth + step
					}
				}
				this.ss = e.target.offsetWidth + 15

				this.translate = e.target.offsetLeft - 8 - Math.abs(this.translateWrapper)
			},
			deleteQuiz(message, index) {
				this.message = message

				this.list.splice(index, 1)
			}
		}
	}
</script>