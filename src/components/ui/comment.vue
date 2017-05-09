<template>
	<div class="to-reply-input-wrapper">
		<input class="to-reply-input" type="text" :placeholder="commentText" v-model="commentContent" @keyup.enter="comment" ref="comment">
	</div>
</template>

<script>
	import {serialize} from "../../utils"
	import {getResponses} from "../../api"

	export default {
		props: ["url", "params", "id", "commentText", "isFocus"],
		data() {
			return {
				commentContent: "",
				message: ""
			}
		},
		computed: {
			urls() {
				return this.urlPrefix + this.url
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		mounted() {
			this.isFocus && this.$refs.comment.focus()
		},
		methods: {
			async comment() {
				if (this.id) {
					this.params.ancestorId = this.id
					this.params.parentId = this.id
				}

				this.params.commentContent = this.commentContent

				const data = await getResponses(this.urls, serialize(this.params))

				if (data.code === 0) {
					this.$emit("commentComplete", this.commentContent)

					this.commentContent = ""

					return
				}

				//this.message = data.msg
				this.$emit("commentComplete", data.msg, 1)
			}
		}
	}
</script>