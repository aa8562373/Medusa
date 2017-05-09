<template>
	<div id="app" class="search-more">
		<headers :title="title" :placeholder="true"></headers>

		<list class="search-panel" v-if="searchType === 0" :url="url" :params="params" :count="count" v-on:requestComplete="requestComplete">
			<ul class="expert-list">
				<li v-for="item of list">
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
		</list>

		<list class="search-panel" v-if="searchType === 1" :url="url" :params="params" :count="count" v-on:requestComplete="requestComplete">
			<ul class="article-list">
				<li v-for="item of list">
					<router-link :to="'/article/' + item.articleId" class="item">
						<avatar :avatar="item.filePath"></avatar>
						<div class="info">
							<p v-text="item.title"></p>
						</div>
					</router-link>
				</li>
			</ul>
		</list>

		<list class="search-panel" v-if="searchType === 2" :url="url" :params="params" :count="count" v-on:requestComplete="requestComplete">
			<ul class="test-list">
				<li class="item" v-for="item of list">
					<avatar :avatar="item.filePath"></avatar>
					<div class="info">
						<p v-text="item.title"></p>
					</div>
				</li>
			</ul>
		</list>

		<list class="search-panel" v-if="searchType === 3" :url="url" :params="params" :count="count" v-on:requestComplete="requestComplete">
			<ul class="ask-list">
				<li v-for="item of list">
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
		</list>
	</div>
</template>

<script>
	import avatar from "../components/ui/avatar"
	import headers from "../components/headers"
	import {getResponses} from "../api"
	import {serialize} from "../utils"
	import list from "../components/list"
	import tips from "../components/tips"

	export default {
		data() {
			return {
				stage: 0,

				count: 0,
				list: []
			}
		},
		computed: {
			title() {
				return this.$store.state.searchTitle || $search.searchTitle
			},
			searchType() {
				return this.$store.state.searchType === -1 ? + $search.searchType : this.$store.state.searchType
			},
			searchText() {
				return this.$store.state.searchText || $search.searchText
			},
			url() {
				return this.$store.state.searchURL || $search.searchURL
			},
			params() {
				const params = {
					pageSize: 10,
					words: this.searchText
				}

				return serialize(params)
			}
		},
		components: {
			headers,
			list,
			avatar
		},
		beforeRouteEnter(to, from, next) {
			const search = JSON.parse(localStorage.getItem("search"))

			if (! search) {
				next("/search")
			}

			window.$search = search

			next()
		},
		methods: {
			requestComplete(data) {
				const array = ["psychoDTOs", "articleDTOs", "testingDTOs", "advisoryDTOs"]
				const keys = Object.keys(data)

				array.forEach((item, index) => {
					if (keys.indexOf(item) !== -1) {
						//this.stage = index

						this.list = this.list.concat(data[array[index]])
						this.count = this.list.length
					}
				})
			}
		}
	}
</script>