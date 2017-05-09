<style src="../css/rate"></style>

<template>
	<div id="app" class="rate">
		<headers :title="'评价'" :placeholder="true"></headers>
		<div class="rate-container">
			<div class="expert-info">
				<avatar :avatar="avatar"></avatar>
				<span v-text="nickname"></span>
			</div>
			<div class="score">
				<span class="icon-wrapper">
					<svg v-for="item of 5" @click="changeScore(item)">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'#star' + (item - 1 < score ? '-selected' : '')"></use>
					</svg>
				</span>
				<p :class="{'no-score' : score === 0}">{{score | format}}</p>
			</div>
			<div class="rate-tags">
				<div class="title">请选择标签</div>
				<ul>
					<li :class="{selected: item.selected}" v-for="item of tags" v-text="item.name" @click="selectTag(item)"></li>
				</ul>
			</div>
			<textarea placeholder="其他意见和建议(内容匿名，可放心填写)" maxlength="500" v-model="content"></textarea>
			<span class="btn" :class="{actived: score}" @click="send">提交</span>
		</div>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import Vue from "vue"
	import headers from "../components/headers"
	import loading from "../components/loading"
	import avatar from "../components/ui/avatar"
	import {getResponse, getResponses} from "../api"
	import {serialize} from "../utils"
	import tips from "../components/tips"

	export default {
		data() {
			return {
				message: "",

				avatar: "FgvGIOvft8OSRsIajDGrt6eDbM3f",
				nickname: "水电费多少",
				score: 0,
				content: "",
				tags: [],
				label: []
			}
		},
		components: {
			headers,
			tips,
			avatar
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		created() {
			this.getTags()
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (! vm.mid) {
					next("/login")
				}

				next()
			})
		},
		filters: {
			format(value) {
				return ["匿名评价，放心填写", "没能解决问题，咨询不妥当", "咨询一般，有待改进", "咨询还行， 有点启发", "比较满意，可以改善", "非常满意，无可挑剔"][value]
			}
		},
		methods: {
			changeScore(index) {
				this.score = index
			},
			selectTag(item) {
				if (item.selected) {
					item.selected = false

					this.label.forEach((label, index, array) => {
						label === item.elId && array.splice(index, 1)
					})

					return
				}

				this.label.push(item.elId)

				Vue.set(item, "selected", true)
			},
			async getTags() {
				const data = await getResponse(`${this.urlPrefix}serviceOrder/getAllEvalLabel.json`)

				if (data.code === 0) {
					this.tags = data.list

					return
				}

				this.message = data.msg
			},
			async send() {
				if (! this.score) {
					return
				}

				const params = {
					soid: this.$route.params.id,
					score: this.score
				}

				this.content && (params.comment = this.content)

				const data = await getResponses(`${this.urlPrefix}serviceOrder/addOrderEvaluation.json`, serialize(params))

				if (data.code === 0) {
					this.$store.commit("notice", "评价成功")

					this.$router.push("/order")

					return
				}

				this.message = data.msg
			}
		}
	}
</script>