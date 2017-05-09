<template>
	<li class="quiz-panel" @click="goDetail(quiz.advisoryId)">
		<div class="quiz-panel-header">
			<template v-if="quiz.author.avatar && quiz.isAnony">
				<!-- <div class="avatar-wrapper">
					<img :src="prefix + quiz.author.avatar + postfix">
				</div> -->
				<avatar :avatar="quiz.author.avatar"></avatar>
			</template>
			<template v-else>
				<div class="no-avatar">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#avatar-default"></use>
					</svg>
				</div>
			</template>
			<span v-text="quiz.author.nickname"></span>
			<span class="tag" v-text="quiz.tag.phrase" v-if="quiz.tag"></span>
		</div>

		<!-- <router-link :to="'/consult/detail/' + quiz.advisoryId"> -->
			<h1 class="quiz-panel-title" v-text="quiz.title"></h1>
			<!-- <template v-if="quiz.content.length > 100">
				<p class="content" v-text="quiz.content.slice(0, 100) + '...'"></p>
			</template>
			<template v-else>
				<p class="content" v-text="quiz.content"></p>
			</template> -->
			<p class="quiz-panel-content" v-text="quiz.content"></p>
		<!-- </router-link> -->

		<template v-if="quiz.imgs.length">
			<template v-if="quiz.imgs.length > 1">
				<div class="img-list" :class="{supplement: quiz.imgs.length === 2 || quiz.imgs.length === 5 || quiz.imgs.length === 8}">
					<div class="lazy-wrapper" :data-url="prefix + img.imgPath + postfix" v-for="(img, imgIndex) of quiz.imgs">
							<div class="lazy-img" @click.stop="showImg(imgIndex)"></div>
						</div>
				</div>
			</template>
			<template v-else>
				<div class="lazy-wrapper one" :style="{width: img.width}" :data-url="prefix + img.imgPath + postfix" v-for="(img, imgIndex) of quiz.imgs">
					<div class="lazy-img" :style="{height: img.height}" @click.stop="showImg(imgIndex)"></div>
				</div>
			</template>
		</template>

		<div class="quiz-panel-footer">
			<span>{{quiz.createTime | format}}</span>
			<span>{{quiz.readCount}}阅读</span>
			<span class="delete-quiz" v-if="mid === quiz.mid" @click.stop="deleteQuiz(quiz, index)">删除</span>
			<span class="comment-icon">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#comment"></use>
				</svg>
				{{quiz.answerCount}}
			</span>
		</div>
	</li>
</template>

<script>
	import avatar from "./avatar"
	import {getResponses} from "../../api"
	import {serialize, timeFormat} from "../../utils"

	export default {
		props: ["quiz", "index"],
		computed: {
			mid() {
				return this.$store.state.mid
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			prefix() {
				return this.$store.state.prefix
			},
			postfix() {
				return this.webp ? "?imageView2/1/format/webp" : ""
			},
			webp() {
				return this.$store.state.webp
			}
		},
		components: {
			avatar
		},
		created() {
			const imgs = this.quiz.imgs

			imgs.forEach((img) => {
				const a = img.imgPreviewPath.split("-")[1].match(/(\d+)x(\d+)/)

				img.width = a[1] > a[2] ? '7.02rem' : '4rem'
				img.height = `${parseInt(img.width) * a[2] / a[1]}rem`
			})
		},
		filters: {
			format(value) {
				return timeFormat(value)
			}
		},
		methods: {
			goDetail(id) {
				// 先把数据保存在内存里
				window._quizData_ = {... this.quiz}

				this.$router.push(`/consult/detail/${id}`)
			},
			showImg(index) {
				this.$emit("showImg", this.index, index)
			},
			async deleteQuiz(quiz, index) {
				const params = {
					advisoryId: quiz.advisoryId
				}
				const data = await getResponses(`${this.urlPrefix}Advisory/V1/deleteAdvisory.json`, serialize(params))

				if (data.code === 0) {
					this.$emit("deleteQuiz", "删除成功", this.index)

					return
				}

				this.$emit("deleteQuiz", data.msg, this.index)
			}
		}
	}
</script>