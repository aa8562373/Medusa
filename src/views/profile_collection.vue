<template>
	<div id="app">
		<headers :title="'我的收藏'" :placeholder="true"></headers>

		<transition name="fade">
			<list :url="url" :params="params" :currentCount="currentCount" v-on:requestComplete="requestComplete">
				<section v-if="list.length">
					<articles v-for="(item, index) of list" :key="item.articleId" :article="item" :index="index"></articles>
				</section>
			</list>
		</transition>
	</div>
</template>

<script>
	import headers from "../components/headers"
	import list from "../components/list"
	import articles from "../components/ui/articles"
	import {serialize, lazy} from "../utils"

	export default {
		name: "collectionKeep",
		data() {
			return {
				list: [],

				currentCount: 0,
				url: "ArticleCollection/getArticleListAndCollection.json"
			}
		},
		created() {
			document.title = "我的收藏"
		},
		computed: {
			mid() {
				return this.$store.state.mid
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
			articles,
			list
		},
		methods: {
			requestComplete(data) {
				this.list = this.list.concat(data.articleList)

				this.currentCount = this.list.length

				this.$nextTick(lazy)
			}
		}
	}
</script>