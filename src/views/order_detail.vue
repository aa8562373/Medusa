<style src="../css/order_detail"></style>

<template>
	<div id="app" class="order-detail">
		<headers :title="'订单详情'" :placeholder="true"></headers>
		<div class="order-detail-container" v-if="! loading">
			<div class="order-header order-panel">
				<avatar :avatar="detail.specialistAvatar"></avatar>
				<p class="order-status">{{detail.status | format}}</p>
				<div class="btn-wrapper">
					<span class="btn" v-if="detail.status !== 11 || detail.status !== 12 || detail.status !== 13">再次咨询</span>
					<router-link :to="'/order/rate/' + detail.soid" class="btn evaluate" v-if="detail.status === 14">评价</router-link>
				</div>
			</div>
			<router-link :to="'/order/rate/' + detail.soid" class="order-evaluate more" v-if="detail.status === 14">
				<span>我的评价</span>
				未评价
			</router-link>
			<div class="order-evaluate" v-if="detail.status === 15">
				<span>我的评价</span>
				<span class="icon-wrapper">
					<svg v-for="item of 5" @click="changeScore(item)">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'#star' + (item - 1 < detail.score ? '-selected' : '')"></use>
					</svg>
				</span>
			</div>
			<div class="order-panel">
				<div class="title">咨询信息</div>
				<ul>
					<li class="expert more">
						<span>专家：</span>
						{{detail.specialistName}}
					</li>
					<li>
						<span>咨询类型：</span>
						{{detail.goodsType | formatConsult}}
					</li>
					<li>
						<span>优惠：</span>
						-{{detail.discountAmount}}
					</li>
					<li class="money">
						实付 ￥{{detail.cashAmount}}
					</li>
				</ul>
			</div>
			<div class="order-panel">
				<div class="title">订单信息</div>
				<ul>
					<li>
						<span>订单号：</span>
						{{$route.params.id}}
					</li>
					<li>
						<span>咨询时间：</span>
						{{detail.serviceBeginTime}}
					</li>
					<li>
						<span>咨询时长：</span>
						{{detail.practicalDuration}}
					</li>
				</ul>
			</div>
		</div>

		<loading :loading="loading"></loading>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import headers from "../components/headers"
	import loading from "../components/loading"
	import avatar from "../components/ui/avatar"
	import {getResponses} from "../api"
	import {serialize} from "../utils"
	import tips from "../components/tips"

	export default {
		data() {
			return {
				loading: true,
				message: "",

				detail: {}
			}
		},
		components: {
			headers,
			loading,
			avatar,
			tips
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (! vm.mid) {
					next("/login")
				}

				next()
			})
		},
		created() {
			this.getOrderDetail()
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
			formatConsult(value) {
				return ["专业咨询", "轻咨询"][value]
			}
		},
		methods: {
			async getOrderDetail() {
				const params = {
					orderNo: this.$route.params.id
				}
				const data = await getResponses(`${this.urlPrefix}serviceOrder/getServiceOrderDetail.json`, serialize(params))

				this.loading = false

				if (data.code === 0) {
					this.detail = {... data.obj}

					return
				}

				this.message = data.msg
			}
		}
	}
</script>