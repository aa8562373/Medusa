<style src="../css/consult_detail"></style>

<template>
	<div id="app" class="ask-expert-detail consult-detail">
		<headers :title="'问答详情'" :placeholder="true"></headers>

		<ul v-if="! loading">
			<quiz-panel :quiz="detail" :index="0" v-on:deleteQuiz="deleteQuiz" v-on:showImg="showImg"></quiz-panel>
		</ul>
		<p class="comment-title" v-if="reply.length">{{reply.length}}条评论</p>

		<list :url="url" :params="params" :count="count" :noDataTips="'还木有人回复，快来抢沙发吧~~'" v-on:requestComplete="requestComplete">
			<transition name="fade">
				<ul v-if="! loading">
					<li class="consult-detail-comment" v-for="item of reply" @click="goCounselor(item.author.mid)">
						<!-- <div class="reply-content"> -->
							<div class="consult-detail-comment-header">
								<template v-if="item.author.avatar">
									<img class="avatar" :src="prefix + item.author.avatar + postfix">
								</template>
								<template v-else>
									<div class="no-avatar">
										<svg>
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#avatar-default"></use>
										</svg>
									</div>
								</template>

								<div class="info">
									<span class="name" v-text="item.author.nickname"></span>
									<p>
										<span class="license" v-text="item.author.licenseName" v-if="item.author.licenseName"></span>
										<span v-text="item.author.title"></span>
									</p>
								</div>
								<span class="consult-btn">咨询TA</span>
							</div>
							<p class="consult-detail-comment-content" v-text="item.commentContent"></p>
							<div class="consult-detail-comment-footer">
								<div>
									<span class="time">{{item.commentTime | format}}</span>
									<span class="flex-center" v-if="item.writeLocation">
										<svg class="location">
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#location"></use>
										</svg>
										{{item.writeLocation}}
									</span>
								</div>
								<div>
									<span class="flex-center">
										<svg>
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#agree"></use>
										</svg>
										{{item.praiseNum}}
									</span>
									<span class="flex-center">
										<svg>
											<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#comment"></use>
										</svg>
										{{item.descendantCount}}
									</span>
								</div>
							</div>
						<!-- </div> -->
						<ul class="reply-comment" v-if="item.descendants.length">
							<li v-for="item of item.descendants">
								<div>
									<span v-text="item.author.nickname"></span>
									回复
									<span v-text="item.parent.author.nickname"></span>：
								</div>
								<p v-text="item.commentContent"></p>
							</li>
						</ul>
					</li>
				</ul>
			</transition>
		</list>

		<!-- <template v-if="userType !== 1">
			<div class="to-reply" v-if="! replyStatus" @click="toReply('', '')">回复一下</div>
			<div class="to-reply-input-wrapper" v-else>
				<input class="to-reply-input" type="text" :placeholder="replyText" v-model="replyContent" ref="input" @keyup.enter="comment">
			</div>
		</template> -->

		<template v-if="commentStatus">
			<comment :url="commentURL" :params="commentParams" :isFocus="true" :id="commentId" :commentText="commentText" v-on:commentComplete="commentComplete"></comment>
		</template>

		<tips :message="message" @cancelMessage="message = ''"></tips>

		<transition name="scale">
			<slide :imgs="imgs" :currentIndex="imgIndex" v-if="showImgStatus" v-on:hiddenImg="hiddenImg"></slide>
		</transition>
	</div>
</template>

<script>
	import tips from "../components/tips"
	import list from "../components/list"
	import headers from "../components/headers"
	import quizPanel from "../components/ui/quiz_panel"
	import {getResponses} from "../api"
	import {serialize, timeFormat, lazy} from "../utils"
	import slide from "../components/ui/slide"
	import comment from "../components/ui/comment"

	export default {
		name: "consultDetailKeep",
		data() {
			return {
				loading: true,
				scrollLoad: false,
				page: 1,

				commentStatus: false,
				commentText: "回复一下",
				commentId: "",
				commentURL: "Advisory/V1/publishComment.json",

				imgs: [],
				showImgStatus: false,
				imgIndex: 0,

				url: "Advisory/V1/obtainCommentList.json",
				count: 0,
				hiddenLoading: true,

				message: "",
				//prefix: "https://oml9ntix5.qnssl.com/",

				detail: {
					tag: {

					},
					imgs: [],
					author: {

					}
				},
				reply: []
			}
		},
		components: {
			tips,
			list,
			headers,
			slide,
			comment,
			quizPanel
		},
		created() {
			document.title = "问答详情"

			const _quizData_ = window._quizData_

			if (_quizData_) {
				this.detail = _quizData_
				this.loading = false

				return
			}

			this.getConsultDetail()
		},
		filters: {
			format(value) {
				return timeFormat(value)
			}
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
			userType() {
				return this.$store.state.userType
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			params() {
				const params = {
					pageSize: 10,
					advisoryId: this.$route.params.id
				}

				return serialize(params)
			},
			commentParams() {
				const params = {
					advisoryId: this.$route.params.id,
					ancestorId: 0,
					//commentContent: this.replyContent,
					mid: this.$store.state.mid,
					parentId: 0
				}

				if (this.commentId) {
					params.ancestorId = this.commentId
					params.parentId = this.commentId
				}

				return params
			}
		},
		methods: {
			async getConsultDetail() {
				const params = {
					advisoryId: this.$route.params.id
				}
				const data = await getResponses(`${this.urlPrefix}Advisory/V1/obtainAdvisoryDetail.json`, serialize(params))

				if (data.code === 0) {
					this.loading = false

					this.detail = data.advisoryDTO

					this.$nextTick(lazy)

					return
				}

				this.message = data.msg
			},
			requestComplete(data) {
				this.reply = this.reply.concat(data.acmntDTOs)

				this.count = this.reply.length
			},
			showImg(value, index) {
				this.showImgStatus = true

				this.imgs = this.detail.imgs.map((img) => this.prefix + img.imgPath + this.postfix)

				this.imgIndex = index
			},
			hiddenImg() {
				this.showImgStatus = false
			},
			goCounselor(id) {
				this.$router.push(`/counselor/${id}`)
			},
			toReply(nickname, id) {
				if (! this.mid) {
					this.message = "请先登录"

					return
				}

				if (nickname) {
					this.commentText = `回复${nickname}`
				}

				if (id) {
					this.commentId = id
				}

				this.commentStatus = true
			},
			commentComplete(commentContent) {
				this.reply.push({
					author: {
						avatar: this.$store.state.avatar,
						nickname: this.$store.state.nickname,
					},
					commentContent: commentContent,
					commentTime: "" + Date.now(),
					descendantCount: 0,
					praiseNum: 0,
					descendants: []
				})

				this.count = this.reply.length

				// this.$nextTick(() => {
				// 	const y = document.documentElement.scrollHeight - window.innerHeight

				// 	document.scrollingElement ? document.scrollingElement.scrollTop = y : document.body.scrollTop = y
				// })
			},
			deleteQuiz(message, index) {
				this.message = message

				//this.list.splice(index, 1)
			}
		}
	}
</script>