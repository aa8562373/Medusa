<style src="../css/counselor"></style>

<template>
	<div id="app" class="counselor">
		<div class="header" v-if="! loading">
			<span class="back" @click="back"></span>
			<img :src="prefix + counselor.candidPhoto + postfix" class="counselor-photo">
			<avatar :avatar="counselor.avatar"></avatar>
			<div class="counselor-info">
				<span class="nickname" v-text="counselor.nickname"></span>
				<!-- <span class="title" v-text="counselor.licenseName"></span> -->
				<span v-text="counselor.title"></span>
				<ul>
					<li v-for="item of counselor.tags.slice(0, 3)" v-text="item.phrase.slice(0, 4)"></li>
				</ul>
				<span class="location flex-center">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#location"></use>
					</svg>
					{{counselor.location}}
				</span>
			</div>
		</div>
		<div class="container" v-if="! loading">
			<div class="panel flex">
				<span class="item" v-text="counselor.answerCount + '次回答'"></span>
				<span class="item" v-text="counselor.appreciatedCount + '个感谢'"></span>
				<span class="item" v-text="counselor.concernedNum + '个粉丝'"></span>
			</div>
			<div class="panel">
				<div class="support">
					<span>平台交易担保</span>
					<span>身份资格认证</span>
				</div>
				<div class="cost">
					<p class="type">
						<span>{{counselor.pLevel | typeFormat}}</span>
						（直拨在线专家，通话5分钟内免费）
					</p>
					<div class="flex">
						<p>
							<span class="price actived" v-text="counselor.voicePrice + '元'"></span>
							<span class="duration" v-text="'/ ' + counselor.voiceDuration + '分钟'"></span>
							（已包含话费）
						</p>
						<p>
							已有
							<span class="actived" v-text="counselor.voiceTimes"></span>
							人咨询
						</p>
					</div>
				</div>
			</div>
			<bbb :tabs="tabs" @switchTab="switchTab">
				<div class="homepage-list intro-wrapper" :style="{width: width, height: height}">
					<div class="item">
						<h4 class="title">铭言</h4>
						<p v-text="counselor.motto"></p>
					</div>
					<div class="item">
						<h4 class="title">专家简介</h4>
						<template v-if="counselor.profile.length > 74">
							<template v-if="allProfile">
								<p v-text="counselor.profile"></p>
								<div class="all-profile up" @click="getProfile">收起</div>
							</template>
							<template v-else>
								<p v-text="counselor.profile.slice(0, 74) + '...'" ></p>
								<div class="all-profile" @click="getProfile">全部</div>
							</template>
						</template>
						<template v-else>
							<p v-text="counselor.profile"></p>
						</template>
					</div>
					<div class="item">
						<h4 class="title">执业介绍</h4>
						<ul class="zhi-intro">
							<li v-if="counselor.workYears">
								<span>从业年限</span>
								<span>{{counselor.workYears}}年</span>
							</li>
							<li v-if="counselor.caseHours">
								<span>累计个案</span>
								<span>{{counselor.caseHours}}小时</span>
							</li>
							<li v-if="counselor.school">
								<span>毕业院校</span>
								<span>{{counselor.school}}</span>
							</li>
							<li v-if="counselor.major">
								<span>所学专业</span>
								<span>{{counselor.major}}</span>
							</li>
							<li v-if="counselor.degree">
								<span>学历</span>
								<span>{{counselor.degree}}</span>
							</li>
						</ul>
					</div>
					<div class="item" v-if="counselor.trainingExperience">
						<h4 class="title">培训经历</h4>
						<template v-if="counselor.trainingExperience.length > 74">
							<template v-if="allTraining">
								<p v-text="counselor.trainingExperience"></p>
								<div class="all-profile up" @click="getTraining">收起</div>
							</template>
							<template v-else>
								<p v-text="counselor.trainingExperience.slice(0, 74) + '...'" ></p>
								<div class="all-profile" @click="getTraining">全部</div>
							</template>
						</template>
						<template v-else>
							<p v-text="counselor.trainingExperience"></p>
						</template>
					</div>
					<div class="item" v-if="counselor.primaryDomain.length">
						<h4 class="title">擅长领域</h4>
						<p>
							<span class="master" v-for="item of counselor.primaryDomain" v-text="item"></span>
						</p>
					</div>
				</div>

				<list class="homepage-list reply-wrapper" :style="{width: width, height: height}" :url="askURL" :params="askParams" :currentCount="askCount" :noDataTips="'还木有回答哦~~'" @requestComplete="askRequestComplete">
					<!-- <h4 class="title" v-if="askList.length">
						回答（{{askTotalCount}}）
					</h4> -->
					<ul class="ask-list" v-if="askList.length">
						<router-link v-for="(item, index) of askList" :to="'/consult/detail/' + item.advisoryId" :key="item.advisoryId">
							<h4 v-text="item.content.slice(0, 22) + '...'" v-if="item.content.length > 22"></h4>
							<h4 v-text="item.content" v-else></h4>
							<p v-text="item.commentContent"></p>
							<div>
								<span v-text="item.commentTime.split(' ')[0]"></span>
								<span v-text="item.commentPraiseNum + '感谢'"></span>
							</div>
						</router-link>
					</ul>
				</list>

				<list class="homepage-list reply-wrapper" :style="{width: width, height: height}" :url="pingURL" :params="pingParams" :currentCount="pingCount" :noDataTips="'还木有评价哦~~'" @requestComplete="pingRequestComplete">
					<h4 class="title" v-if="pingList.length && effectiveRate">
						<span class="effective-rate" v-if="effectiveRate">
							有效率：
							<span v-text="effectiveRate"></span>
						</span>
					</h4>
					<div class="ping-content" v-if="effectiveRate">
						<div class="score">
							<span>平均评分：{{score.toFixed(2)}}分</span>
							<div class="star-wrapper">
								<svg v-for="n of 5">
									<use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'#star' + (n <= (~~ score) ? '-selected' : '')"></use>
								</svg>
								<!-- <span class="star" :class="{'star-light': n <= (~~ score)}" v-for="n of 5"></span> -->
							</div>
						</div>
						<ul class="score-list">
							<li v-for="item of tags">
								{{item.name}}（{{item.count}}）
							</li>
						</ul>
					</div>
					<ul class="ping-list" v-if="pingList.length">
						<li class="ping-item" v-for="(item, index) of pingList">
							<div>
								<span class="nickname">匿名用户</span>
								<div>
									<span class="tag" v-for="item of item.labelDTOs.slice(0, 3)" v-text="item.name"></span>
								</div>
								<span>{{item.createTime | timeFormat}}</span>
							</div>
							<template v-if="item.comment.length > 30">
								<p v-if="item.status">
									{{item.comment}}
									<span @click="spread(item)"></span>
								</p>
								<p v-else>
									{{item.comment.slice(0, 30) + "..."}}
									<span class="view-all" @click="spread(item)">查看全部</span>
								</p>
							</template>
							<template v-else>
								<p>{{item.comment}}</p>
							</template>
						</li>
					</ul>
				</list>
			</bbb>
		</div>

		<div class="footer" v-if="! loading">
			<span class="btn item follow" @click="follow" v-if="counselor.isConcern">关注</span>
			<span class="btn item following" @click="cancelFollow" v-else>已关注</span>
			<router-link to="/download_app" class="item flex-center">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#phone"></use>
				</svg>
				私信
			</router-link>
			<router-link to="/download_app" class="item flex-center">
				<svg>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#phone-fff"></use>
				</svg>
				立即咨询
			</router-link>
		</div>

		<loading :loading="loading"></loading>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import Vue from "vue"
	import bbb from "../components/ui/bbb"
	import list from "../components/list"
	import avatar from "../components/ui/avatar"
	import tips from "../components/tips"
	import loading from "../components/loading"
	import {getResponses} from "../api"
	import {serialize, timeFormat} from "../utils"

	export default {
		name: "counselorKeep",
		data() {
			return {
				loading: true,
				stage: 0,
				tabs: ["简介", "回答", "评价"],
				width: window.innerWidth + "px",
				height: window.innerHeight * .7 + "px",
				message: "",

				askURL: "MemberAdvisory/getAnsweredList.json",
				askCount: 0,
				askTotalCount: 0,
				askList: [],

				pingURL: "Psychor/obtainEvaluations4Psycho.json",
				pingCount: 0,
				pingTotalCount: 0,
				pingList: [],

				// replyLoading: true,
				// pingLoading: true,
				// tab: "intro",
				allProfile: false,
				allTraining: false,

				//scrollStatus: false,
				//noReply: false,
				// ping: 0,
				// replyList: [],
				// replyCount: 0,
				// pingList: [],

				counselor: {
					profile: "",
					tags: [],
					trainingExperience: "",
					primaryDomain: [],
					isConcern: 1
				},

				// pingPage: 1,
				// replyPage: 1,
				// lockedReply: false,
				// lockedPing: false,

				score: 0,
				tags: [],
				effectiveRate: 0
			}
		},
		components: {
			list,
			bbb,
			tips,
			avatar,
			loading
		},
		// beforeRouteEnter(to, from, next) {
		// 	next((vm) => {
		// 		window.addEventListener("scroll", vm.scroll, false)
		// 	})
		// },
		// beforeRouteLeave(to, from, next) {
		// 	window.removeEventListener("scroll", this.scroll, false)

		// 	next()
		// },
		filters: {
			timeFormat(value) {
				return timeFormat(value)
			},
			typeFormat(value) {
				return ["专业咨询", "轻咨询"][value]
			}
		},
		computed: {
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
			mid() {
				return this.$store.state.mid
			},
			askParams() {
				const params = {
					mid: this.$route.params.id,
					pageSize: 10
				}

				return serialize(params)
			},
			pingParams() {
				const params = {
					pid: this.$route.params.id,
					pageSize: 10
				}

				return serialize(params)
			}
		},
		created() {
			this.getCounselorDetail()
		},
		methods: {
			back() {
				this.$router.back()
			},
			async getCounselorDetail() {
				const params = {
					pid: this.$route.params.id
				}

				this.mid && (params.vid = this.mid)

				const data = await getResponses(`${this.urlPrefix}Psychor/V1/obtainPsychoHomepage.json`, serialize(params))

				this.loading = false

				if (data.code === 0) {
					this.counselor = {... data.psychoDTO}

					this.counselor.primaryDomain = JSON.parse(this.counselor.primaryDomain)

					if (! this.counselor.primaryDomain) {
						this.counselor.primaryDomain = []
					}

					if (! this.counselor.trainingExperience) {
						this.counselor.trainingExperience = ""
					}

					document.title = `${this.counselor.nickname} - ${this.counselor.title}`

					return
				}

				this.message = data.msg

				// this.$nextTick(() => {
				// 	this.top = Math.round(document.querySelector(".tab-nav").getBoundingClientRect().top) + (document.body.scrollTop || document.documentElement.scrollTop)
				// })
			},
			// async getReply() {
			// 	const id = this.$route.query.id
			// 	const params = {
			// 		mid: id,
			// 		pageIndex: this.replyPage,
			// 		pageSize: 10
			// 	}
			// 	const data = await getReply(serialize(params))

			// 	this.lockedReply = false
			// 	this.replyLoading = false

			// 	this.replyList = this.replyList.concat(data.answeredAdvisorys)
			// 	this.replyCount = data.count

			// 	this.noReply =  ! this.replyList.length
			// },
			// async getPingList() {
			// 	const id = this.$route.query.id
			// 	const params = {
			// 		pid: id,
			// 		pageIndex: this.pingPage,
			// 		pageSize: 10
			// 	}
			// 	const data = await getPingList(serialize(params))

			// 	this.lockedReply = false
			// 	this.pingLoading = false

			// 	this.pingList = data.evaluationDTOs

			// 	const length = this.pingList.length

			// 	if (! length) {
			// 		this.ping = 0
			// 	} else if (length > 0 && length < 10) {
			// 		this.ping = 1
			// 	} else {
			// 		this.ping = 2
			// 	}
			// },
			async getTongJi() {
				const id = this.$route.params.id
				const params = {
					pid: id
				}

				const data = await getResponses(`${this.urlPrefix}Psychor/obtainEvaluationStatis4Psycho.json`, serialize(params))

				if (data.code === 0) {
					this.effectiveRate = `${data.statisDTO.effectiveRate.toFixed(2) * 100}%`
					this.score = data.statisDTO.score
					this.tags = data.statisDTO.labelDTOs

					return
				}

				this.message = data.msg
			},
			switchTab(value) {
				this.stage = value

				if (value === 2) {
					this.pingList.length > 10 && this.getTongJi()
				}
			},
			askRequestComplete(data) {
				this.askList = this.askList.concat(data.answeredAdvisorys)

				this.askTotalCount = data.count
				this.askCount = this.askList.length
			},
			pingRequestComplete(data) {
				this.pingList = this.pingList.concat(data.evaluationDTOs)

				this.pingTotalCount = data.count
				this.pingCount = this.pingList.length
			},
			async follow() {
				if (! this.mid) {
					this.message = "请先登录"

					return
				}

				const params = {
					concernFrom: this.mid,
					concernTo: this.$route.params.id
				}

				const data = await getResponses(`${this.urlPrefix}MemberConcern/concernMemberConcern.json`, serialize(params))

				if (data.code === 0) {
					this.counselor.isConcern = 0

					this.message = "关注成功"

					return
				}

				this.message = data.msg
			},
			async cancelFollow() {
				if (! this.mid) {
					this.message = "请先登录"

					return
				}

				const params = {
					concernFrom: this.mid,
					concernTo: this.$route.params.id
				}

				const data = await getResponses(`${this.urlPrefix}MemberConcern/cancelMemberConcern.json`, serialize(params))

				if (data.code === 0) {
					this.counselor.isConcern = 1

					this.message = "取消关注成功"

					return
				}

				this.message = data.msg
			},
			getProfile() {
				this.allProfile = ! this.allProfile
			},
			getTraining() {
				this.allTraining = ! this.allTraining
			},
			// scroll() {
			// 	const value = document.body.scrollTop || document.documentElement.scrollTop

			// 	if (value > this.top) {
			// 		this.scrollStatus = true
			// 	} else {
			// 		this.scrollStatus = false
			// 	}
			// },
			// scrollLoadReply() {
			// 	if (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight) >= 0.7) {
			// 		 if (! this.lockedReply) {
			// 			this.lockedReply = true
			// 			this.replyPage++

			// 			this.getReply()
			// 		 }
			// 	}
			// },
			// scrollLoadPing() {
			// 	if (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight) >= 0.7) {
			// 		 if (! this.lockedPing) {
			// 			this.lockedPing = true

			// 			this.pingPage++

			// 			this.getPingList()
			// 		 }
			// 	}
			// },
			// changeitem(value) {
			// 	this.tab = value
			// },
			// spread(item) {
			// 	Vue.set(item, "status", true)
			// }
		}
	}
</script>