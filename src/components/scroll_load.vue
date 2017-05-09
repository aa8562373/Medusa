<template>
	<div class="io" ref="io"></div>
</template>

<script>
	export default {
		mounted() {
			if (! window.IntersectionObserver) {
				window.addEventListener("scroll", this.scrollLoad, false)

				return
			}

			this.addScrollLoad()
		},
		beforeDsetroy() {
			if (! window.IntersectionObserver) {
				window.removeEventListener("scroll", this.scrollLoad, false)
			} else {
				this.io.unobserve(this.$refs.io)
			}
		},
		methods: {
			scrollLoad() {
				if (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight) >= 0.7) {
					this.$emit("scrollLoad", 1)
				}
			},
			addScrollLoad() {
				this.io = new IntersectionObserver((entries) => {
					entries.forEach((item) => {
						if (item.intersectionRatio) {
							// 说明本次是向上滚动，IO 元素即将进入视口
							this.$emit("scrollLoad", 0)
						}
					})
				}, {
					rootMargin: "200px 0px"
				})

				this.io.observe(this.$refs.io)
			}
		}
	}
</script>