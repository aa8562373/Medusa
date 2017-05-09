<template>
	<div>
		<slot></slot>

		<loading :loading="loading" v-if="! hiddenLoading"></loading>

		<div class="loading-scroll" v-if="scrollLoading">努力加载中...</div>

		<no-more-data :noMoreData="noMoreData"></no-more-data>

		<p class="no-data" v-if="noData">{{noDataTips ? noDataTips : "啊哦，空空如也~~"}}</p>

		<scroll-load @scrollLoad="loadList" v-if="isObserve"></scroll-load>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import {getResponses} from "../api"
	import loading from "../components/loading"
	import tips from "../components/tips"
	import scrollLoad from "../components/scroll_load"
	import noMoreData from "../components/ui/no_more_data"

	export default {
		props: ["index", "url", "params", "pages", "currentCount", "hiddenNoData", "isAbortRequest", "hiddenLoading", "noDataTips"],
		data() {
			return {
				page: 1,
				message: "",

				noData: false,
				locked: false,
				loading: true,
				scrollLoading: false,
				noMoreData: false,
				isObserve: false
			}
		},
		components: {
			tips,
			loading,
			scrollLoad,
			noMoreData
		},
		computed: {
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		created() {
			this.pages && (this.page = this.pages)

			! this.isAbortRequest && this.getData()
		},
		watch: {
			index(value) {
				// value === -1 说明 筛选条件改变 需要重置状态 不用 0 是因为 list.length 也可能是0
				this.page = 1
				this.loading = true
				this.scrollLoading = false
				this.noData = false
				this.noMoreData = false
				this.isObserve = false

				this.getData()

				return

				//this.noData = false
			},
			hiddenNoData() {
				this.noData = false
			},
			isAbortRequest(value) {
				! value && this.getData()
			}
		},
		methods: {
			async getData() {
				const data = await getResponses(this.urlPrefix + this.url, `pageIndex=${this.page++}&` + this.params)
				const count = data.count

				this.locked = false
				this.loading = false
				this.scrollLoading = false

				if (data.code === 0) {
					this.$emit("requestComplete", data)

					if (count === 0) {
						// 赋值无效
						//this.noData = true

						setTimeout(() => {
							this.noData = true
						})

						return
					}

					if (count > 10) {
						this.isObserve = true

						if (this.currentCount === data.count) {
							! this.noData && (this.noMoreData = true)

							this.isObserve = false
						}
					}

					return
				}

				this.message = data.msg
			},
			loadList(value) {
				if (value) {
					this.loadListScroll()

					return
				}

				this.loadListIO()
			},
			loadListIO() {
				this.scrollLoading = true

				this.getData()
			},
			loadListScroll() {
				if (! this.locked) {
					this.locked = true

					this.loadListIO()
				}
			},
		}
	}
</script>