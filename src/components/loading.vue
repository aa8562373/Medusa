<template>
	<div class="loading-list" v-if="loading">
		<div class="loading-animation">
			<span></span>
			<span></span>
			<span></span>
			<span></span>
		</div>
		努力加载中...
	</div>
</template>

<script>
	export default {
		props: ["loading"]
	}
</script>