<template>
	<div class="search-panel">
		<h4 class="title" v-text="title"></h4>
		<slot></slot>
		<div class="more" v-text="moreText" @click="more"></div>
	</div>
</template>

<script>
	export default {
		props: ["type", "url", "text", "title", "moreText"],
		methods: {
			more() {
				const search = {
					searchType: this.type,
					searchTitle: this.title,
					searchText: this.text,
					searchURL: this.url
				}

				this.$store.commit("search", search)

				localStorage.setItem("search", JSON.stringify(search))

				this.$router.push("/search/more")
			}
		}
	}
</script>