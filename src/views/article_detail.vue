<style src="../css/article_detail"></style>
<template>
	<div id="app" class="article-detail">
		<header class="header" v-if="! loading">
			<img :src="prefix + img + postfix">
			<h1 class="title" v-text="title"></h1>
			<div class="article-info">
				<span v-text="author"></span>
				·
				<span>{{createTime | format}}</span>
				<span class="read-count">{{readCount}}阅读</span>
			</div>
		</header>
		<div class="article-container" v-if="! loading">
			<div class="article-summary">摘要：{{summary.slice(0, 20)}}</div>
			<div class="article-content" v-html="content"></div>
		</div>
		<div class="article-operation">
			<span class="back" @click="back"></span>
			<div @click="setCommentStatus">写评论</div>
			<span class="comment" :class="{'comment-count': totalCount}" :data-count="totalCount < 999 ? totalCount : '999+'">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#comment"></use>
				</svg>
			</span>
			<span class="collect" :class="{'collect-selected' : isCollected}" @click="collect">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="isCollected ? '#collect-selected' : '#collect'"></use>
				</svg>
			</span>
			<span class="share" v-if="isShare" @click="share">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share"></use>
				</svg>
			</span>
			<span class="share" v-if="isShareUC" @click="shareStatus = true">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#share"></use>
				</svg>
			</span>
		</div>

		<p class="comment-title" v-if="totalCount">全部评论</p>

		<list :url="url" :params="params" :count="count" :noDataTips="'还木有人回复，快来抢沙发吧~~'" :hiddenNoData="hiddenNoData" :hiddenLoading="true" :isAbortRequest="isAbortRequest" v-on:requestComplete="requestComplete">
			<ul class="article-comment" :class="{'article-comment-padding': totalCount < 11}" v-if="comment.length">
				<li v-for="item of comment">
					<div class="avatar-wrapper">
						<img :src="prefix + item.avatar + postfix">
					</div>
					<div class="comment-wrapper">
						<span v-text="item.nickname"></span>
						<span class="time">{{item.commentTime | format}}</span>
						<div class="comment-content" v-text="item.commentContent"></div>
					</div>
				</li>
			</ul>
		</list>

		<transition name="fade">
			<div class="comment-modal" v-if="commentStatus" @click="commentStatus = false">
				<div class="comment-content" @click.stop>
					<textarea placeholder="写评论" v-model="reply" ref="textarea"></textarea>
					<span class="send" :class="{actived: reply.length}" @click="sendComment">发送</span>
				</div>
			</div>
		</transition>

		<share :statusProps="shareStatus" v-on:hiddenShare="hiddenShare"></share>

		<tips :message="message" @cancelMessage="message = ''"></tips>

		<loading :loading="loading"></loading>
	</div>
</template>

<script>
	const title = document.title

	import list from "../components/list"
	import share from "../components/ui/share"
	import loading from "../components/loading"
	import {serialize, timeFormat} from "../utils"
	import tips from "../components/tips"
	import {getResponses} from "../api"

	export default {
		name: "articleKeep",
		data() {
			return {
				loading: true,
				title: "",
				img: "",
				author: "",
				createTime: 0,
				summary: "",
				content: "",
				readCount: "",
				isCollected: 0,
				totalCount: 0,

				shareStatus: false,

				reply: "",
				commentStatus: false,

				count: 0,
				url: "ArticleComment/listByPage.json",
				hiddenNoData: false,
				isAbortRequest: true,

				message: "",
				comment: []
			}
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			avatar() {
				return this.$store.state.avatar
			},
			nickname() {
				return this.$store.state.nickname
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
			},
			isShare() {
				return navigator.share
			},
			isShareUC() {
				return window.ucweb || window.ucbrowser
			},
			params() {
				const params = {
					articleId: this.$route.params.id,
					pageSize: 10
				}

				return serialize(params)
			}
		},
		created() {
			this.getArticleDetail()
		},
		beforeRouteLeave(to, from, next) {
			document.title = title

			next()
		},
		filters: {
			format(value) {
				return timeFormat(value)
			}
		},
		components: {
			tips,
			list,
			share,
			loading
		},
		methods: {
			back() {
				this.$router.back()
			},
			async getArticleDetail() {
				const params = {
					articleId: this.$route.params.id
				}

				this.mid && (params.mid = this.mid)

				const data = await getResponses(`${this.urlPrefix}Article/V1/obtainArticleDetail.json`, serialize(params))

				if (data.code === 0) {
					this.loading = false
					this.isAbortRequest = false

					this.title = data.articleDTO.title

					document.title = `${this.title} - 心猫`

					this.author = data.articleDTO.author
					this.img = data.articleDTO.filePath
					this.createTime = data.articleDTO.createTime
					this.summary = data.articleDTO.digest
					this.content = data.articleDTO.detail
					this.readCount = data.articleDTO.hits
					this.isCollected = data.articleDTO.isCollected

					return
				}

				this.message = data.msg
			},
			async collect() {
				if (! this.mid) {
					this.message = "请先登录"

					return
				}

				if (! this.content) {
					return
				}

				const params = {
					articleId: this.$route.params.id,
					cancel: this.isCollected ? 1 : 0,
					mid: this.mid
				}
				const data = await getResponses(`${this.urlPrefix}ArticleCollection/postArticleCollection.json`, serialize(params))

				if (data.code === 0) {
					this.message = data.msg

					this.isCollected = this.isCollected ? 0 : 1

					return
				}

				this.message = data.msg
			},
			setCommentStatus() {
				if (! this.content) {
					return
				}

				if (! this.mid) {
					this.message = "请先登录"

					return
				}

				this.commentStatus = true

				this.$nextTick(() => {
					this.$refs.textarea.focus()
				})
			},
			async sendComment() {
				const params = {
					articleId: this.$route.params.id,
					mid: this.mid,
					commentContent: this.reply
				}

				const data = await getResponses(`${this.urlPrefix}ArticleComment/save.json`, serialize(params))

				if (data.code === 0) {
					this.comment.unshift({
						avatar: this.avatar,
						nickname: this.nickname,
						commentContent: this.reply,
						commentTime: Date.now()
					})

					this.hiddenNoData = true

					this.totalCount++

					this.commentStatus = false
					this.reply = ""

					this.message = data.msg

					return
				}

				this.message = data.msg
			},
			requestComplete(data) {
				this.comment = this.comment.concat(data.articleComments)

				this.count = this.comment.length

				this.totalCount = data.count
			},
			hiddenShare() {
				this.shareStatus = false
			},
			share() {
				navigator.share({
				    title: "心猫，您的心理健康守护者",
				    text: "国内领先的在线心理健康管理与诊疗平台",
				    url: "https://m.120xinmao.com"
				})
			}
		}
	}
</script>