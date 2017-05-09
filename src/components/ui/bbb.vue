<template>
	<div class="homepage-container">
		<div class="tab">
			<span class="tab-item" :class="{selected: index === indexs}" v-for="(item, indexs) of tabs" :ref="'tab' + indexs" v-text="item" @click="switchTab(indexs, $event)"></span>
			<div class="line" :class="{'line-transition': lineStatus}" :style="{width: lineWidth + 'px', transform: 'translateX(' + lineTranslate + 'px)'}" ref="line"></div>
		</div>
		<div class="homepage-content">
			<slide-base :length="tabs.length" :currentIndex="index" @start="start" @move="move" @end="end" @changeIndex="changeIndex">
				<slot></slot>
			</slide-base>
		</div>
	</div>
</template>

<script>
	const width = window.innerWidth

	import slideBase from "./slide_base"

	export default {
		props: ["tabs"],
		data() {
			return {
				stage: 0,
				index: 0,
				sectionHeight: "auto",

				lineWidth: 0,
				lineStatus: false,
				lineTranslate: 0,
				listTransition: 0,

				width: window.innerWidth
			}
		},
		components: {
			slideBase
		},
		watch: {
			stage(n, old) {
				this.listTransition = (Math.abs(n - old) + 1) / 10
			}
		},
		computed: {
			offset() {
				return this.width * this.stage
			},
			listTranslate() {
				return this.stage * width
			},
			lineTranslateValues() {
				const result = []

				this.tabs.forEach((item, index) => {
					const target = this.$refs['tab' + index][0]
					const value = target.offsetLeft - ((this.lineWidth - target.offsetWidth) / 2)

					result.push(value)
				})

				return result
			}
		},
		mounted() {
			const tabItem = document.querySelector(".tab-item")
			const width = tabItem.offsetWidth

			this.lineWidth = width
			this.lineTranslate = tabItem.offsetLeft - ((this.lineWidth - width) / 2)

			this.$lineTranslate = this.lineTranslate

			setTimeout(() => {
				this.listTransition = .2
			})
		},
		methods: {
			switchTab(value, e) {
				this.index = value

				this.lineStatus = true
				this.lineTranslate = this.lineTranslateValues[value]

				this.$emit("switchTab", value)
			},
			changeIndex(value) {
				this.index = value
				this.lineTranslate = this.lineTranslateValues[value]

				this.$emit("switchTab", value)
			},
			start() {
				this.lineStatus = false
			},
			move(value) {
				this.lineTranslate = Math.abs(value) * 138 / 414 + this.$lineTranslate
			},
			end(value) {
				this.lineStatus = true
				this.lineTranslate = this.lineTranslateValues[value]
			}
		}
	}
</script>