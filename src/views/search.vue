<style src="../css/search"></style>

<template>
	<div id="app" class="search">
		<header class="header">
			<div class="search-input">
				<svg class="search">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#search"></use>
				</svg>
				<input type="text" placeholder="有心事，搜一下" v-model="searchText" @keyup.enter="takeNotes" ref="search">
			</div>
			<span class="cancel-search" @click="back">取消</span>
		</header>
		<ul class="search-record" v-if="record.length && stage === 0">
			<li v-for="(item, index) of record" @click="search(item)">
				<svg class="search">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#search"></use>
				</svg>
				<span class="search-text" v-text="item"></span>
				<span class="delete-record" @click.stop="deleteRecord(index)"></span>
			</li>
			<li @click="deleteRecord">清除历史记录</li>
		</ul>
		<search-panel :type="0" :url="'Lucene/searchPyschos.json'" :title="'心理专家'" :text="searchText" :moreText="'更多专家'" v-if="stage === 2 && expertList.length">
			<ul class="expert-list">
				<li v-for="item of expertList">
					<router-link :to="'/expert/detail/' + item.mid" class="item">
						<avatar :avatar="item.avatar"></avatar>
						<div class="info">
							<p class="nickname-wrapper">
								<span class="nickname" v-text="item.nickname"></span>
								<span class="linense-name" v-text="item.title"></span>
							</p>
							<span class="tag" v-text="item.title"></span>
							<span class="tag" v-for="item of item.tags" v-text="item.phrase"></span>
						</div>
					</router-link>
				</li>
			</ul>
		</search-panel>
		<search-panel :type="1" :url="'Lucene/searchArticles.json'" :title="'文章'" :text="searchText" :moreText="'更多文章'" v-if="stage === 2 && articleList.length">
			<ul class="article-list">
				<li v-for="item of articleList">
					<router-link :to="'/article/' + item.articleId" class="item">
						<avatar :avatar="item.filePath"></avatar>
						<div class="info">
							<p v-text="item.title"></p>
						</div>
					</router-link>
				</li>
			</ul>
		</search-panel>
		<search-panel :type="2" :url="'Lucene/searchTestings.json'" :title="'测试'" :text="searchText" :moreText="'更多测试'" v-if="stage === 2 && testList.length">
			<ul class="test-list">
				<li class="item" v-for="item of testList">
					<avatar :avatar="item.filePath"></avatar>
					<div class="info">
						<p v-text="item.title"></p>
					</div>
				</li>
			</ul>
		</search-panel>
		<search-panel :type="3" :url="'Lucene/searchAdvisories.json'" :title="'提问'" :text="searchText" :moreText="'更多提问'" v-if="stage === 2 && askList.length">
			<ul class="ask-list">
				<li v-for="item of askList">
					<router-link :to="'/consult/detail/' + item.advisoryId" class="item">
						<p>
							<span class="nickname" v-text="item.nickname"></span>
							<span class="tag" v-for="item of item.tags" v-text="item.phrase"></span>
						</p>
						<p class="ask-text" v-if="item.content.length > 44">
							{{item.content.slice(0, 44)}}...
						</p>
						<p class="ask-text" v-text="item.content" v-else></p>
					</router-link>
				</li>
			</ul>
		</search-panel>

		<loading :loading="loading"></loading>

		<p class="no-data" v-if="noData">什么都没有搜到~~</p>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import loading from "../components/loading"
	import avatar from "../components/ui/avatar"
	import searchPanel from "../components/ui/search_panel"
	import {getResponses} from "../api"
	import {serialize} from "../utils"
	import tips from "../components/tips"

	export default {
		data() {
			return {
				stage: 0,
				loading: false,
				message: "",
				searchText: "",
				noData: false,

				record: [],
				expertList: [],
				articleList: [],
				testList: [],
				askList: []
			}
		},
		components: {
			loading,
			tips,
			avatar,
			searchPanel
		},
		computed: {
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		mounted() {
			document.title = "搜索"

			try {
				const record = JSON.parse(localStorage.getItem("searchRecord"))

				record && (this.record = record.slice(0, 6))
			} catch (e) {

			}

			this.$nextTick(() => {
				this.$refs.search.focus()
			})
		},
		methods: {
			back() {
				this.$router.back()
			},
			takeNotes() {
				const record = JSON.parse(localStorage.getItem("searchRecord")) || []

				record.indexOf(this.searchText) === -1 && record.unshift(this.searchText)

				localStorage.setItem("searchRecord", JSON.stringify(record))

				this.search(this.searchText)
			},
			deleteRecord(index) {
				let record = JSON.parse(localStorage.getItem("searchRecord"))

				if (typeof index !== "number") {
					this.record = []

					record = []

					localStorage.setItem("searchRecord", JSON.stringify(record))

					return
				}

				this.record.splice(index, 1)

				record.splice(index, 1)

				localStorage.setItem("searchRecord", JSON.stringify(record))
			},
			async search(value) {
				this.searchText = value

				const params = {
					words: value
				}

				this.stage = 1
				this.noData = false
				this.loading = true

				const data = await getResponses(`${this.urlPrefix}Lucene/searchAll.json`, serialize(params))

				this.loading = false
				this.stage = 2

				if (data.code === 0) {
					this.expertList = data.psychoDTOs.slice(0, 5)
					this.articleList = data.articleDTOs.slice(0, 5)
					this.testList = data.testingDTOs.slice(0, 5)
					this.askList = data.advisoryDTOs.slice(0, 5)

					if (! data.advisoryCount && ! data.articleCount && ! data.psychoCount && ! data.testingCount) {
						this.noData = true
					}

					return
				}

				this.message = data.msg
			}
		}
	}
</script>