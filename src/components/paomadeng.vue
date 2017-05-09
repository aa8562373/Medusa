<template>
	<div class="notice-container" :class="{'no-transition': lastIndex}" :style="{transform: 'translateY(-' + ~~ (index * rem * .8) + 'px)'}" ref="noticeContainer">
		<slot></slot>
	</div>
</template>

<script>
	export default {
		props: ["length"],
		data() {
			return {
				index: 0,
				rem: process.env.VUE_ENV !== "server" && parseFloat(document.documentElement.style.fontSize)
			}
		},
		computed: {
			lastIndex() {
				return this.index === 0 ? true : false
			}
		},
		methods: {
			animate() {
				const that = this
				const target = this.$refs.noticeContainer

				const check = () => {
					this.index === this.length - 1 && (this.index = 0)
				}

				target.addEventListener("transitionend", check, false)
				target.addEventListener("webkitTransitionEnd", check, false)

				setTimeout(function animation() {
					if (document.hidden || document.webkitHidden) {
						setTimeout(animation, 2000)

						return
					}

					that.index++

					setTimeout(animation, 2000)
				}, 2000)
			}
		},
		mounted() {
			this.animate()
		}
	}
</script>