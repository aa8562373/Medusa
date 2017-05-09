<style src="../css/discover_detail"></style>

<template>
	<div id="app" class="discover-detail">
		<headers :title="'动态详情'" :placeholder="true"></headers>

		<quan :detail="detail" v-on:showImg="showImg" v-on:deleteMood="deleteMood" v-if="! loading"></quan>

		<p class="comment-title" v-if="totalCount">{{totalCount}}条评论</p>

		<list :url="url" :params="params" :count="count" :hiddenNoData="hiddenNoData" :noDataTips="'还木有人回复，快来抢沙发吧~~'" :hiddenLoading="hiddenLoading" v-on:requestComplete="requestComplete">
			<ul class="discover-detail-reply-list">
				<li v-for="item of reply">
					<div class="header">
						<template v-if="item.author.avatar">
							<!-- <img class="avatar" :src="prefix + item.author.avatar + postfix"> -->
							<avatar :avatar="item.author.avatar"></avatar>
						</template>
						<template v-else>
							<div class="no-avatar">
								<svg>
									<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#avatar-default"></use>
								</svg>
							</div>
						</template>
						<div class="info">
							<p>
								<span v-text="item.author.nickname"></span>
								<span class="sex">{{item.author.sex | sexFormat}} {{item.author.age ? '| ' + item.author.age + '岁' : ''}}</span>
								<span class="location" v-text="item.writeLocation"></span>
							</p>
							<span class="time">{{item.commentTime | format}}</span>
						</div>
					</div>
					<p class="comment" v-text="item.commentContent"></p>
				</li>
			</ul>
		</list>

		<comment :url="commentURL" :params="commentParams" :id="commentId" :commentText="commentText" v-on:commentComplete="commentComplete"></comment>

		<loading :loading="loading" v-if="loading"></loading>

		<tips :message="message" @cancelMessage="message = ''"></tips>

		<transition name="scale">
			<slide :imgs="imgs" :currentIndex="imgIndex" v-if="showImgStatus" v-on:hiddenImg="hiddenImg"></slide>
		</transition>
	</div>
</template>

<script>
	import headers from "../components/headers"
	import quan from "../components/ui/quan"
	import {timeFormat, lazy} from "../utils"
	import {getResponses} from "../api"
	import {serialize} from "../utils"
	import tips from "../components/tips"
	import list from "../components/list"
	import loading from "../components/loading"
	import avatar from "../components/ui/avatar"
	import slide from "../components/ui/slide"
	import comment from "../components/ui/comment"

	export default {
		name: "discoverDetailKeep",
		data() {
			return {
				loading: true,
				message: "",

				commentText: "我来说两句",
				commentId: "",
				commentURL: "Heartmate/V1/publishComment.json",

				count: 0,
				totalCount: 0,
				hiddenLoading: true,
				hiddenNoData: false,
				url: "Heartmate/V1/obtainCommentList.json",

				imgs: [],
				imgIndex: 0,
				showImgStatus: false,

				detail: {

				},
				reply: []
			}
		},
		components: {
			headers,
			quan,
			tips,
			list,
			avatar,
			slide,
			comment,
			loading
		},
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
			},
			params() {
				const params = {
					pageSize: 10,
					updateId: this.$route.params.id
				}

				return serialize(params)
			},
			commentParams() {
				const params = {
					mid: this.$store.state.mid,
					updateId: this.$route.params.id,
					parentId: 0,
					isAnony: 1
				}

				if (this.commentId) {
					params.ancestorId = this.commentId
					params.parentId = this.commentId
				}

				return params
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
			document.title = "动态详情"

			this.getDetail()
		},
		methods: {
			async getDetail() {
				const params = {
					vid: this.mid,
					updateId: this.$route.params.id
				}
				const data = await getResponses(`${this.urlPrefix}Heartmate/V1/obtainUpdateDetail.json`, serialize(params))

				this.loading = false

				if (data.code === 0) {
					this.detail = data.updateDTO

					this.$nextTick(lazy)

					return
				}

				this.message = data.msg
			},
			showImg(value, index) {
				this.showImgStatus = true

				this.imgs = this.detail.imgs.map((img) => this.prefix + img.imgPath + this.postfix)

				this.imgIndex = index
			},
			hiddenImg() {
				this.showImgStatus = false
			},
			requestComplete(data) {
				this.reply = this.reply.concat(data.commentDTOs)

				this.count = this.reply.length

				this.totalCount = data.count
			},
			commentComplete(commentContent, value) {
				if (value) {
					this.message = commentContent

					return
				}

				this.reply.push({
					author: {
						sex: this.$store.state.sex,
						avatar: this.$store.state.avatar,
						nickname: this.$store.state.nickname,
					},
					commentContent: commentContent,
					commentTime: Date.now()
				})

				//this.count = this.reply.length
				this.hiddenNoData = true
				this.totalCount++

				// this.$nextTick(() => {
				// 	const y = document.documentElement.scrollHeight - window.innerHeight

				// 	document.scrollingElement ? document.scrollingElement.scrollTop = y : document.body.scrollTop = y
				// })
			},
			async deleteMood(id, index) {
				//this.list.splice(index, 1)

				const params = {
					updateId: id
				}
				const data = await getResponses(`${this.urlPrefix}Heartmate/V1/deleteUpdate.json`, serialize(params))

				if (data.code === 0) {
					this.message = "删除成功"

					this.$router.back()

					return
				}

				this.message = data.msg
			}
		}
	}
</script>