<template>
	<section class="lazy-img-wrapper" :data-url="item.filePath">
		<div v-if="! item.lazyStatus"></div>
		<img :src="item.filePath" >
	</section>
</template>

<script>
	export default {
		props: ["item"],
		data() {
			return {
				status: false
			}
		}
	}
</script>