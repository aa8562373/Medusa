<style src="../css/feedback"></style>

<template>
	<div id="app" class="feedback">
		<headers :title="'反馈'">
			<span class="send" :class="{success: content.length}" @click="sendFeedback">发送</span>
		</headers>
		<div class="feedback-container">
			<div></div>
			<p>hi，我是产品经理老于</p>
			<p>给点建议吧，有机会获得咨询抵用券哦！</p>
			<textarea placeholder="吐槽、表扬、好点子，说点什么吧" v-model="content" ref="textarea"></textarea>
		</div>
	</div>
</template>

<script>
	import headers from "../components/headers"
	import {getResponses} from "../api"
	import {serialize} from "../utils"

	export default {
		name: "feedbackKeep",
		data() {
			return {
				content: "",
				message: ""
			}
		},
		components: {
			headers
		},
		computed: {
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		mounted() {
			this.$refs.textarea.focus()
		},
		methods: {
			back() {
				this.$router.back()
			},
			async sendFeedback() {
				const params = {
					content: this.content
				}
				const data = await getResponses(`${this.urlPrefix}feedback/save.json`, serialize(params))

				if (data.code === 0) {
					this.$store.commit("notice", "你的反馈我已收到，谢谢亲！")

					this.back()

					return
				}


				this.message = data.error
			}
		}
	}
</script>