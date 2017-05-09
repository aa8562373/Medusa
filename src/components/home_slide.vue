<style src="../css/home_slide"></style>

<template>
	<div class="home-slide-container">
		<slide-base class="home-slide-wrapper" :length="imgs.length" :currentIndex="index" @changeIndex="changeIndex">
			<img class="home-slide-item" v-for="(img, index) of imgs" :src="img" @touchstart="stopAnimation" @touchend="startAnimation">
		</slide-base>
		<p class="home-slide-progress">
			<span class="point" :class="{current: index === n - 1}" v-for="n of imgs.length"></span>
		</p>
	</div>
</template>

<script>
	import slideBase from "./ui/slide_base"

	export default {
		props: {
			imgs: {
				type: Array,
				required: true
			}
		},
		data() {
			return {
				height: window.innerHeight,
				index: 0
			}
		},
		components: {
			slideBase
		},
		created() {
			this.play()
		},
		methods: {
			hiddenImg(index) {
				this.$emit("hiddenImg")

			},
			changeIndex(value) {
				this.index = value
			},
			play() {
				const that = this

				this.timer = setTimeout(function animation() {
					if (that.index === 2) {
						that.index = 0

						that.timer = setTimeout(animation, 2000)

						return
					}

					that.index++

					that.timer = setTimeout(animation, 2000)
				}, 2000)
			},
			startAnimation() {
				this.play()
			},
			stopAnimation() {
				clearTimeout(this.timer)
			}
		}
	}
</script>