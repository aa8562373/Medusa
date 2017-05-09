<style src="../../css/slide"></style>

<template>
	<div class="slides-container">
		<slide-base class="slides-wrapper" :length="imgs.length" :currentIndex="currentIndex" @changeIndex="changeIndex">
			<div v-for="(img, index) of imgs" @touchmove="move">
				<img :src="img" @click="hiddenImg(index)" @load.once="load">
			</div>
		</slide-base>
		<p>{{index + 1}}/{{imgs.length}}</p>
	</div>
</template>

<script>
	import slideBase from "./slide_base"

	export default {
		props: {
			imgs: {
				type: Array,
				required: true
			},
			currentIndex: {
				type: Number,
				default: 0,
			}
		},
		data() {
			return {
				index: this.currentIndex
			}
		},
		components: {
			slideBase
		},
		methods: {
			load(e) {
				if (e.target.height > 736) {
					e.target.parentNode.classList.add("no-flex")
				}
			},
			hiddenImg(index) {
				this.$emit("hiddenImg")

				//this.index = index

				//this.offset = - index * this.width
			},
			changeIndex(value) {
				this.index = value
			},
			move(e) {
				//e.stopPropagation()
				//console.log(11111)
			}
		}
	}
</script>