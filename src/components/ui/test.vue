<template>
	<li class="test-item">
		<img :src="prefix + detail.filePathMobile + postfix">
		<h1 class="title" v-text="detail.title"></h1>
		<p class="intro" v-text="detail.contentExplain"></p>
		<div class="info">
			<span>共{{detail.questionAmount}}题</span>
			<span>{{detail.testingPeopleNum}}人测过</span>
			<span class="comment">{{detail.questionAmount}}条评论</span>
		</div>
		<div class="btn-wrapper">
			<span class="btn">重新测试</span>
			<span class="btn view-result">查看结果</span>
		</div>
	</li>
</template>

<script>
	export default {
		props: ["detail"],
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