<style src="../css/home"></style>

<template>
	<div id="app" class="home" ref="app">
		<header class="home-header" :class="{'home-header-gradient': homeHeaderGradient}" :style="{backgroundColor: homeHeaderBgColor}">
			<a class="logo" href="/"></a>
			<router-link to="/search" class="search">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#search"></use>
				</svg>
				有心事，搜一下
			</router-link>
			<router-link to="/download_app" class="message">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#message"></use>
				</svg>
			</router-link>
		</header>
		<!-- <div class="slide-wrapper">
			<div class="slide swiper-container banner swiper-container-horizontal">
				<div class="swiper-wrapper">
					<a href="javascript:;" class="swiper-slide" v-for="item of banner" @click="intoDetail(item)">
						<img :src="prefix + item.filePath + postfix">
					</a>
				</div>
				<div class="swiper-pagination swiper-pagination-bullets"></div>
			</div>
		</div> -->
		<homeSlide :imgs="banner"></homeSlide>

		<div class="notice-wrapper">
			<paomadeng :length="noticeLength">
				<p v-for="item of notice" v-text="item"></p>
			</paomadeng>
		</div>
		<div class="consult-category">
			<span v-for="item of consultCategory" v-text="item.phrase" @click="goConsult(item.tagId)"></span>
		</div>
		<nav class="quick-entry">
			<router-link v-for="(item, index) of quickEntry" :key="item.path" :to="item.path">
				<h4 class="title" v-text="item.title"></h4>
				<p v-text="item.text"></p>
			</router-link>
		</nav>
		<div class="radio-station">
			<span>睡不着？来听听这个</span>
			<router-link to="/radio_station" class="btn">立即体验</router-link>
		</div>
		<list :url="url" :params="params" :currentCount="currentCount" :pages="2" :hiddenLoading="hiddenLoading" v-on:requestComplete="requestComplete">
			<section class="article-list">
				<articles :article="item" :index="index" :key="item.articleId" v-for="(item, index) of articles"></articles>
			</section>
		</list>

		<page-nav></page-nav>
	</div>
</template>

<script>
	import homeSlide from "../components/home_slide"
	import {getResponse, getResponses} from "../api"
	import {serialize, lazy, timeFormat} from "../utils"
	import paomadeng from "../components/paomadeng"
	import pageNav from "../components/page_nav"
	import list from "../components/list"
	import articles from "../components/ui/articles"

	export default {
		//name: "homeKeep",
		data() {
			return {
				banner: [],
				articles: [],
				page: 1,
				scrollTop: 0,

				url: "Article/V1/obtainArticlesNew.json",
				currentCount: 0,
				isAbortRequest: true,
				hiddenLoading: true,

				notice: [],
				noticeLength: 0,

				//articles: [],

				quickEntry: [
					{
						path: "/consult",
						title: "我要咨询",
						text: "与专家语音沟通"
					},
					{
						path: "/consult/1",
						title: "我要倾诉",
						text: "你的世界我懂得"
					},
					{
						path: "/consult/post",
						title: "我要提问",
						text: "有困惑，问专家"
					},
					{
						path: "/download_app",
						title: "心理测试",
						text: "专业心理测试"
					}
				]
			}
		},
		created() {
			this.getBanner()

			this.getNotice()

			this.getExpertTag()

			//isBrowser && window.addEventListener("scroll", this.scrollToChangeColor, false)

			//this.articles = [... this.articlesStore]
			document.title = "心猫，您的心理健康守护者"
		},
		// preFetch(store, webp) {
		// 	return store.dispatch("fetch_home_data", webp)
		// },
		// destroyed() {
		// 	window.removeEventListener("scroll", this.scrollToChangeColor, false)
		// },
		components: {
			paomadeng,
			pageNav,
			list,
			homeSlide,
			articles
		},
		computed: {
			// banner() {
			// 	return this.$store.state.home.banner
			// },
			// notice() {
			// 	return this.$store.state.home.notice
			// },
			// noticeLength() {
			// 	return this.$store.state.home.notice.length
			// },
			// articlesStore() {
			// 	return this.$store.state.home.articles
			// },
			homeHeaderBgColor() {
				return `rgba(255, 255, 255, ${this.scrollTop / 400})`
			},
			homeHeaderGradient() {
				return this.scrollTop < 200
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
			consultCategory() {
				return this.$store.state.consultCategory.slice(0, 6)
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			params() {
				const params = {
					pageSize: 10
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
			async getBanner() {
				const data = await getResponse(`${this.urlPrefix}adBanner/list.json`)

				this.banner = data.list.map((item) => {
					return this.prefix + item.filePath + this.postfix
				})

				// this.$nextTick(() => {
				// 	new Swiper(".swiper-container.banner", {
				// 		//autoplay: 3000,
				// 		speed: 500,
				// 		autoplayDisableOnInteraction: false,
				// 		pagination: ".swiper-pagination"
				// 	})
				// })
			},
			async getNotice() {
				const data = await getResponse(`${this.urlPrefix}serviceOrder/V1/obtainServiceOrderBroadcast.json`)

				if (data.code === 0) {
					this.notice = data.broadcasts

					this.notice = this.notice.concat(this.notice.slice(0, 1))

					this.noticeLength = this.notice.length

					return
				}

				this.message = data.msg
			},
			async getExpertTag() {
				const params = {
					pageIndex: 1,
					pageSize: 6
				}
				const data = await getResponses(`${this.urlPrefix}Psychor/V1/obtainPsychoTagListAndLicenseList.json`, serialize(params))

				if (data.code === 0) {
					this.$store.commit("consultCategory", data.psychoTags)
					this.$store.commit("licenseType", data.licenseTypes)

					return
				}

				this.message = data.msg
			},
			goConsult(id) {
				this.$store.commit("shan", id)

				this.$router.push("/consult")
			},
			scrollToChangeColor() {
				this.scrollTop = window.pageYOffset
			},
			requestComplete(data) {
				this.articles = [... this.articles, ... data.articleDTOs]

				this.currentCount = this.articles.length

				this.$nextTick(lazy)
			}
		}
	}
</script>