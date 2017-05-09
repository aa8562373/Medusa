<style src="../../css/article"></style>

<template>
	<router-link :to="'/article/' + article.articleId" class="article-item" :class="{order: (~~ (index / 10)) % 2}">
		<div class="content">
			<h4 v-text="article.title"></h4>
			<p>
				<span>
					{{article.hits}}阅读
				</span>
				<span>
					{{article.createTime | format}}
				</span>
			</p>
		</div>
		<div class="lazy-wrapper" :data-url="prefix + article.filePath + postfix">
			<div class="lazy-img"></div>
		</div>
	</router-link>
</template>

<script>
	import {timeFormat} from "../../utils"

	export default {
		props: {
			article: {
				type: Object,
				required: true
			},
			index: {
				type: Number,
				required: true
			}
		},
		filters: {
			format(value) {
				return timeFormat(value)
			}
		},
		computed: {
			prefix() {
				return this.$store.state.prefix
			},
			postfix() {
				return this.webp ? "?imageView2/1/format/webp" : ""
			},
			webp() {
				return this.$store.state.webp
			}
		}
	}
</script>