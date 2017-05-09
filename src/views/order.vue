<style src="../css/order"></style>

<template>
	<div id="app" class="order">
		<headers :title="'我的订单'" :placeholder="true"></headers>

		<bbb :tabs="tabs" v-on:switchTab="switchTab">
			<list class="homepage-list" :style="{width: width + 'px', height: sectionHeight}" :url="url" :params="params" :count="count" v-on:requestComplete="requestComplete">
				<ul class="order-list" v-if="list.length">
					<li v-for="item of list">
						<router-link :to="'/order/detail/' + item.no" class="order-item">
							<avatar :avatar="item.specialistAvatar"></avatar>
							<div class="order-content">
								<div class="header">
									<div>
										<div>
											<span class="nickname" v-text="item.specialistName"></span>
											<span class="title more" v-text="item.specialistTitle && item.specialistTitle.slice(0, 9)"></span>
										</div>
										<div class="order-type">
											咨询类型：{{12}}
										</div>
										<div class="order-type">
											咨询剩余：{{22}}
										</div>
									</div>
									<div>
										<span class="order-status">{{item.status | format}}</span>
										<span class="money">实付￥{{item.cashAmount}}</span>
									</div>
								</div>
								<div class="footer">
									<span class="time">{{item.serviceRealityBeginTime | timeForamt}}</span>
									<div class="btn-wrapper">
										<span class="btn">再次咨询</span>
										<span class="btn actived" v-if="item.status === 14" @click.prevent="evaluate(item.soid)">评价</span>
									</div>
								</div>
							</div>
						</router-link>
					</li>
				</ul>
			</list>
			<list class="homepage-list" :style="{width: width + 'px', height: sectionHeight}" :url="url" :params="params" :count="waitCount" :isAbortRequest="this.stage !== 1" v-on:requestComplete="waitRequestComplete">
				<ul class="order-list" v-if="waitList.length">
					<li v-for="item of waitList">
						<router-link :to="'/order/detail/' + item.no" class="order-item">
							<avatar :avatar="item.specialistAvatar"></avatar>
							<div class="order-content">
								<div class="header">
									<div>
										<div>
											<span class="nickname" v-text="item.specialistName"></span>
											<span class="title more" v-text="item.specialistTitle && item.specialistTitle.slice(0, 9)"></span>
										</div>
										<div class="order-type">
											咨询类型：{{12}}
										</div>
										<div class="order-type">
											咨询剩余：{{22}}
										</div>
									</div>
									<div>
										<span class="order-status">{{item.status | format}}</span>
										<span class="money">实付￥{{item.cashAmount}}</span>
									</div>
								</div>
								<div class="footer">
									<span class="time">{{item.serviceRealityBeginTime | timeForamt}}</span>
									<div class="btn-wrapper">
										<span class="btn">再次咨询</span>
										<span class="btn actived" v-if="item.status === 14" @click.prevent="evaluate(item.soid)">评价</span>
									</div>
								</div>
							</div>
						</router-link>
					</li>
				</ul>
			</list>
		</bbb>
	</div>
</template>

<script>
	//const width = window.innerWidth
	const width = 414

	import tips from "../components/tips"
	import avatar from "../components/ui/avatar"
	import bbb from "../components/ui/bbb"
	import list from "../components/list"
	import headers from "../components/headers"
	import {getResponses} from "../api"
	import {serialize, timeFormat} from "../utils"

	export default {
		data() {
			return {
				stage: 0,
				message: "",
				width: window.innerWidth,
				tabs: ["全部订单", "待评价"],
				sectionHeight: "642px",

				//lineWidth: width * 86 / 414,
				//lineTranslate: 26 * width / 414,

				list: [],
				count: 0,
				url: "/serviceOrder/getCallOrderForCusList.json",

				waitCount: 0,
				waitList: []
			}
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			notice() {
				return this.$store.state.notice
			},
			params() {
				const params = {
					mid: this.mid,
					//status: 1,
					pageSize: 10
				}

				return serialize(params)
			}
		},
		components: {
			headers,
			avatar,
			tips,
			bbb,
			list
		},
		created() {
			setTimeout(() => {
				if (this.notice) {
					this.message = this.notice

					this.$store.commit("notice", "")
				}
			}, 0)
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (! vm.mid) {
					next("/login")
				}

				next()
			})
		},
		filters: {
			format(value) {
				const obj = {
					7: "投诉未处理",
					8: "投诉已处理",
					11: "订单未接听",
					12: "订单未扣款",
					13: "订单进行中",
					14: "订单未评价",
					15: "订单已完成",
					16: "订单未成功"
				}

				return obj[value]
			},
			timeFormat(value) {
				return timeFormat(value)
			},
		},
		methods: {
			switchTab(value) {
				this.stage = value
			},
			requestComplete(data) {
				this.list = this.list.concat(data.list)

				this.count = this.list.length
			},
			waitRequestComplete(data) {
				this.waitList = this.waitList.concat(data.list)

				this.waitCount = this.waitList.length
			},
			evaluate(id) {
				this.$router.push("/order/rate/" + id)
			}
		}
	}
</script>