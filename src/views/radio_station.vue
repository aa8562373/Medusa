<template>
	<div id="app" class="rs-app">
		<span class="rs-btn" @click="status = true" v-if="stage === 2">
			<span></span>
		</span>
		<ul class="rs-wrapper" :style="{width: rsList.length * width + 'px'}" @touchstart="touchstart($event)" @touchmove="touchmove($event)" @touchend="touchend($event)">
			<!-- <li v-for="item of rsList" :style="{backgroundImage: 'url(' + item.bg + ')'}"> -->
			<li v-for="item of rsList" :style="{height: height + 'px'}">
				<div class="rs-song" :class="{'rs-song-animation': stage === 2}" @click="showIntro(item)" v-if="stage === 0 || stage === 2">
					<template v-if="cardStatus">
						<transition name="fade">
							<p class="rs-type-name" v-text="item.name" v-if="! item.clicked"></p>
						</transition>
						<transition name="fade">
							<p class="rs-intro" v-text="item.description" v-if="item.clicked" @click.stop="hiddenIntro(item)"></p>
						</transition>
					</template>
					<template v-else>
						<p class="rs-type-name" v-text="item.name"></p>
					</template>
					<span class="rs-name" v-text="name" v-if="stage === 2"></span>
					<span class="a line-1"></span>
					<span class="a line-2"></span>
					<span class="a line-3"></span>
				</div>
			</li>
		</ul>
		<div class="select-time-wrapper" v-if="stage === 1">
			<ul class="select-time" :class="{s1: selectTimeOffset === 0, s2: selectTimeOffset === selectTimeHeight, s3: selectTimeOffset === selectTimeHeight * 2, s4: selectTimeOffset === - selectTimeHeight, s5: selectTimeOffset === - selectTimeHeight * 2}" @touchstart="selectTimeStart($event)" @touchmove="selectTimeMove($event)" @touchend="selectTimeEnd($event)">
				<li v-for="(item, index) of times">
					{{item}}min
				</li>
			</ul>
		</div>
		<div class="rs-progress" v-if="stage === 0">
			<span class="point" :class="{selected: i === index}" v-for="(p, i) of rsList.length"></span>
		</div>
		<div class="surplus-time" v-text="surplusTime" v-if="stage === 2"></div>
		<span class="btn rs-start-btn" v-if="stage === 0" @click="switchStage(1)">开始睡眠</span>
		<span class="btn rs-start-btn" v-if="stage === 1" @click="play">立即播放</span>
		<div class="rs-operation" v-if="stage === 2">
			<span class="btn rs-stop-btn" @click="stop">结束播放</span>
			<span class="btn rs-switch-btn" @click="exchange">换一首</span>
		</div>
		<transition name="modal">
			<div class="modal" v-if="status" @click="status = false">
				<ul class="modal-content rs-play" @click.stop>
					<li class="rs-play-item" :class="{selected: name === item.name}" v-for="item of playList" v-text="item.name" @click="goPlay(item)"></li>
					<!-- <li @click="status = false">取消</li> -->
				</ul>
			</div>
		</transition>
	</div>
</template>

<script>
	const width = window.innerWidth
	const playTimeArray = [15, 30, 45, 60, 90]
	let selectTimeOffset = 0

	import Vue from "vue"
	import {getResponse} from "../api"

	export default {
		name: "musicKeep",
		data() {
			return {
				width: window.innerWidth,
				height: window.innerHeight,
				index: 0,
				stage: 0,
				playTime: 45 * 60,
				loadTime: 0,
				name: "",
				surplusTime: "",
				audio: null,
				timer: null,

				status: false,
				playList: [],

				offset: 0,
				selectTimeHeight: 0,
				selectTimeOffset: 0,

				cardStatus: true,

				//song: null,
				times: ["15", "30", "45", "60", "90"],
				rsList: []
			}
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				vm.getResponse()
			})
		},
		watch: {
			stage(value) {
				if (value === 2) {
					this.audio = new Audio()

					const song = this.audio

					song.src = `https://oml9gawrn.qnssl.com/${this.playList[0].filePathAbs}`

					song.play()

					song.onended = () => {
						this.switchSong()
					}

					this.name = this.playList[0].name

					// 先执行一次
					this.playTime--

					this.timer = setInterval(() => {
						if (this.playTime === 0) {
							this.stop()

							return
						}

						this.playTime--
					}, 1000)

					// 改变 cardStatus
					this.cardStatus = false

					return
				}

				if (value === 1) {
					this.$nextTick(() => {
						this.selectTimeHeight = document.querySelector(".select-time").firstElementChild.offsetHeight
					})
				}
			},
			playTime(value) {
				this.surplusTime = this.timeForamt(value)
			}
		},
		methods: {
			async getResponse() {
				const data = await getResponse("/depression-api/Music/obtainMusicClassesAndSongs.json")

				this.rsList = data.musicClass8SongDTOs

				this.playList = this.rsList[0].musicSongDTOs
			},
			showIntro(item) {
				Vue.set(item, "clicked", true)
			},
			hiddenIntro(item) {
				item.clicked = false
			},
			switchStage(value) {
				this.stage = value
			},
			touchstart(e) {
				if (this.stage === 1 || this.stage === 2) {
					return
				}

				const target = e.currentTarget

				target.style.transition = "none"
				target.startX = e.touches[0].clientX

				target.time = Date.now()
			},
			touchmove(e) {
				if (this.stage === 1 || this.stage === 2) {
					return
				}

				const target = e.currentTarget
				const max = (this.rsList.length - 1) * width
				let x = e.touches[0].clientX - target.startX

				if (x < 0) {
					if (x > 0) {
						x = 0
					}

					if (Math.abs(x + -this.offset) > max) {
						target.style.transform = `translateX(${- max}px)`

						return
					}

					target.style.transform = `translateX(${x + -this.offset}px)`
				} else {
					if (- (this.offset - x) > 0) {
						return
					}

					target.style.transform = `translateX(${- (this.offset - x)}px)`
				}
			},
			touchend(e) {
				if (this.stage === 1 || this.stage === 2) {
					return
				}

				const target = e.currentTarget
				const offset = target.startX - e.changedTouches[0].clientX
				const max = (this.rsList.length - 1) * width
				const time = Date.now() - target.time

				target.style.transition = "all .2s"

				if (time < 120 && Math.abs(offset) < 15) {
					return
				}

				// 滑动速度快
				if (time < 110) {
					if (offset > 0) {
						if (this.offset === max) {
							return
						}

						this.left(target)
					} else {
						if (this.offset === 0) {
							return
						}

						this.right(target)
					}
				} else {
					// 向左滑动
					if (offset > 0) {
						if (this.offset === max) {
							return
						}

						if (offset >= width / 2) {
							this.left(target)
						} else {
							target.style.transform = `translateX(${- this.offset}px)`

							this.playList = this.rsList[this.index].musicSongDTOs
						}
					} else {
						if (this.offset === 0) {
							return
						}

						if (Math.abs(offset) >= width / 2) {
							this.right(target)

							this.playList = this.rsList[this.index].musicSongDTOs
						} else {
							target.style.transform = `translateX(${- this.offset}px)`

							this.playList = this.rsList[this.index].musicSongDTOs
						}
					}
				}
			},
			selectTimeStart(e) {
				const target = e.currentTarget

				target.style.transition = "none"
				target.startY = e.touches[0].clientY
			},
			selectTimeMove(e) {
				const target = e.currentTarget
				const max = 4 * this.selectTimeHeight
				let y = target.startY - e.touches[0].clientY
				let offsetEnd

				// 向上滑动
				if (y > 0) {
					offsetEnd = selectTimeOffset - y

					if (y - selectTimeOffset > max) {
						target.style.transform = `translateY(-${max}px)`

						this.selectTimeOffset = - max

						return
					}
				} else {
					offsetEnd = Math.abs(y) + selectTimeOffset

					if (offsetEnd >= max) {
						target.style.transform = `translateY(${max}px)`

						this.selectTimeOffset = max

						return
					}
				}

				target.style.transform = `translateY(${offsetEnd}px)`

				this.selectTimeOffset = offsetEnd
			},
			selectTimeEnd(e) {
				const target = e.currentTarget
				const max = 4 * this.selectTimeHeight
				const selectTimeHeight = this.selectTimeHeight

				let offset = target.startY - e.changedTouches[0].clientY
				let offsetEnd
				let sign = ""

				selectTimeOffset = this.selectTimeOffset

				selectTimeOffset = Math.abs(selectTimeOffset)

				target.style.transition = "all .2s"

				offsetEnd = (~~ (selectTimeOffset / selectTimeHeight)) * selectTimeHeight

				// 向上滑动
				if (offset > 0) {
					sign = "-"
				}

				if (selectTimeOffset >= max) {
					target.style.transform = `translateY(${sign}${max / 2}px)`

					this.selectTimeOffset = selectTimeOffset = (sign === "-" ? - max / 2 : max / 2)

					this.getPlayTime()

					return
				}

				if (offsetEnd >= selectTimeHeight * 3 && offsetEnd <= selectTimeHeight * 4) {
					target.style.transform = `translateY(${sign}${max / 2}px)`

					this.selectTimeOffset = selectTimeOffset = (sign === "-" ? - max / 2 : max / 2)

					this.getPlayTime()

					return
				}

				target.style.transform = `translateY(${sign}${offsetEnd}px)`

				this.selectTimeOffset = selectTimeOffset = sign === "-" ? - offsetEnd : offsetEnd

				this.getPlayTime()
			},
			getPlayTime() {
				const selectTimeOffset = this.selectTimeOffset
				const selectTimeHeight = this.selectTimeHeight

				if (selectTimeOffset >= 0) {
					this.playTime = playTimeArray[Math.abs(selectTimeOffset / selectTimeHeight - 2)] * 60
				} else {
					this.playTime = playTimeArray[Math.abs(selectTimeOffset) / selectTimeHeight + 2] * 60
				}
			},
			exchange() {
				const index = Math.floor(Math.random() * this.playList.length)
				const song = this.playList[index]

				this.name = song.name
				this.switchSong(song.url)
			},
			switchSong(url) {
				setTimeout(function volume() {
					this.audio.volume = (((this.audio.volume * 10) - 1) / 10).toFixed(1)

					if (this.audio.volume === 0) {
						this.audio.src = url
						this.audio.volume = 1
						this.audio.play()

						return
					}

					setTimeout(volume.bind(this), 100)
				}.bind(this), 100)
			},
			play() {
				this.switchStage(2)
			},
			stop() {
				// this.audio.pause()

				// clearInterval(this.timer)

				// this.stage = 0
				// this.index = 0
				// this.offset = 0
				// this.cardStatus = true

				// selectTimeOffset = 0
				// this.selectTimeOffset = 0

				// this.surplusTime = ""
				// this.playTime = 45 * 60
				// this.playList = this.rsList[0].musicSongDTOs
				location.reload()
			},
			goPlay(item) {
				this.status = false

				this.name = item.name

				this.switchSong(`https://oml9gawrn.qnssl.com/${this.playList[0].filePathAbs}`)
			},
			timeForamt(value) {
				const minutes = ~~ (value / 60)
				const second = value - (minutes * 60)

				return `${minutes}:${second}`.replace(/\b(\w)\b/g, "0$1")
			},
			left(target) {
				this.index++
				this.offset = this.index * width

				target.style.transform = `translateX(${- width * this.index}px)`

				this.playList = this.rsList[this.index].musicSongDTOs
			},
			right(target) {
				this.index--
				this.offset = this.index * width

				target.style.transform = `translateX(${- width * this.index}px)`

				this.playList = this.rsList[this.index].musicSongDTOs
			}
		},
		mounted() {


			document.title = "音乐"

			//document.body.ontouchmove = (e) => e.preventDefault()
		}
	}
</script>