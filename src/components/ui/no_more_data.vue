<template>
	<p class="no-more-data" v-if="noMoreData">已经到底了，别扯了</p>
</template>

<script>
	export default {
		props: ["noMoreData"]
	}
</script>