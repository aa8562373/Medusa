<template>
	<div class="avatar lazy-wrapper" :data-url="prefix + avatar + postfix">
		<div class="lazy-img"></div>
	</div>
</template>

<script>
	export default {
		props: ["avatar"],
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