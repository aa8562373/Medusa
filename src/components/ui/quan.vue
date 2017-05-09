<style src="../../css/quan"></style>

<template>
	<li class="friend-circle" @click="goDetail">
		<div class="friend-circle-header">
			<template v-if="detail.author.avatar">
				<avatar :avatar="detail.author.avatar"></avatar>
			</template>
			<template v-else>
				<div class="no-avatar">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#avatar-default"></use>
					</svg>
				</div>
			</template>
			<span class="nickname" v-text="detail.author.nickname"></span>
			<span>{{detail.author.sex | sexFormat}} {{detail.author.age ? '| ' + detail.author.age + '岁' : ''}}</span>
			<span class="location" v-text="detail.writeLocation" v-if="detail.writeLocation"></span>
		</div>
		<p class="friend-circle-content" v-text="detail.content"></p>
		<!-- <router-link :to="'/discover/detail/' + detail.updateId" class="friend-circle-content" v-text="detail.content"></router-link> -->

		<template v-if="detail.imgs.length">
			<template v-if="detail.imgs.length > 1">
				<div class="img-list flex" :class="{supplement: detail.imgs.length === 2 || detail.imgs.length === 5 || detail.imgs.length === 8}">
					<!-- <div class="img-div" v-for="(img, imgIndex) of detail.imgs">
						<img :src="prefix + img.imgPath + postfix" @click="showImg(imgIndex)" @load.once="imgLoad">
					</div> -->
					<div class="lazy-wrapper" :data-url="prefix + img.imgPreviewPath + postfix" v-for="(img, imgIndex) of detail.imgs">
							<div class="lazy-img" @click.stop="showImg(imgIndex)"></div>
						</div>
				</div>
			</template>
			<template v-else>
				<!-- <img class="img-list-one" :src="prefix + img.imgPreviewPath + postfix" v-for="(img, imgIndex) of detail.imgs" @click="showImg(imgIndex)" @load.once="imgLoad"> -->
				<div class="lazy-wrapper picture" :style="{width: img.width}" :data-url="prefix + img.imgPreviewPath + postfix" v-for="(img, imgIndex) of detail.imgs">
					<div class="lazy-img" :style="{height: img.height}" @click.stop="showImg(imgIndex)"></div>
				</div>
			</template>
		</template>

		<div class="friend-circle-footer">
			<div>
				<span>{{detail.createTime | format}}</span>
				<span>{{detail.readCount}}阅读</span>
				<span class="delete-ask" v-if="mid === detail.mid" @click.stop="deleteMood">删除</span>
			</div>
			<div class="comment">
				<template v-if="detail.isEmbraced === 1">
					<span class="flex-center praise">
						<svg>
							<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sun-selected"></use>
						</svg>
						{{detail.embraceNum}}
					</span>
				</template>
				<template v-else>
					<span class="flex-center" @click.stop="like">
						<svg>
							<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#sun"></use>
						</svg>
						{{detail.embraceNum}}
					</span>
				</template>
				<span class="flex-center">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#comment"></use>
					</svg>
					{{detail.respondCount}}
				</span>
			</div>
		</div>
		<slot></slot>
	</li>
</template>

<script>
	import {timeFormat} from "../../utils"
	import {getResponses} from "../../api"
	import {serialize} from "../../utils"
	import avatar from "./avatar"

	export default {
		props: {
			detail: {
				type: Object,
				required: true
			},
			index: {
				type: Number
			}
		},
		data() {
			return {
				imgIndex: 0
			}
		},
		components: {
			avatar
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			prefix() {
				return this.$store.state.prefix
			},
			postfix() {
				return this.webp ? "?imageView2/1/format/webp" : ""
			},
			webp() {
				return this.$store.state.webp
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		filters: {
			format(value) {
				return timeFormat(value)
			},
			sexFormat(value) {
				return ["未知", "男", "女"][value]
			}
		},
		created() {
			const imgs = this.detail.imgs

			imgs.forEach((img) => {
				const a = img.imgPreviewPath.split("-")[1].match(/(\d+)x(\d+)/)

				img.width = a[1] > a[2] ? '7.02rem' : '4rem'
				img.height = `${parseInt(img.width) * a[2] / a[1]}rem`
			})
		},
		methods: {
			goDetail() {
				this.$router.push(`/discover/detail/${this.detail.updateId}`)
			},
			imgLoad(e) {
				const target = e.target
				const width = target.naturalWidth
				const height = target.naturalHeight

				width < height && target.classList.add("horizontal")
			},
			showImg(index) {
				this.$emit("showImg", this.index, index)
			},
			deleteMood() {
				this.$emit("deleteMood", this.detail.updateId, this.index)
			},
			async like() {
				const params = {
					vid: this.mid,
					updateId: this.detail.updateId
				}
				const data = await getResponses(`${this.urlPrefix}Heartmate/V1/embraceUpdate.json`, serialize(params))

				if (data.code === 0) {
					this.detail.isEmbraced = 1
					this.detail.embraceNum++

					//this.message = "拥抱成功"
					//this.$emit("like", "拥抱成功")

					return
				}

				this.$emit("like", data.msg)
			}
		}
	}
</script>