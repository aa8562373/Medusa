<template>
	<header class="header-two" :class="{placeholder: placeholder}">
		<span class="back" v-if="left" @click="back"></span>
		<slot name="left"></slot>
		<h1 class="title" v-text="title"></h1>
		<slot></slot>
	</header>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				required: true
			},
			left: {
				type: Boolean,
				default: true
			},
			placeholder: {
				type: Boolean,
				default: false
			}
		},
		methods: {
			back() {
				this.$router.back()
			}
		}
	}
</script>