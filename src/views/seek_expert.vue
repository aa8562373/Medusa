<style src="../css/seek_expert"></style>

<template>
	<div id="app" class="consult" :class="{overflow: filterType !== -1}">
		<header class="seek-expert-header-wrapper">
			<div class="consult-header">
				<router-link to="/search">
					<svg class="search-icon">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#search"></use>
					</svg>
				</router-link>
				<div class="switch-expert-type">
					<router-link to="/consult" exact>找专家</router-link>
					<router-link to="/consult/ask" exact>问专家</router-link>
				</div>
				<router-link to="/download_app">
					<svg class="message-icon">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#message"></use>
					</svg>
				</router-link>
			</div>
			<section class="consult-filter-bar">
				<span :class="{selected: filterType === 0}" @click="filterType = 0">
					{{consultText}}
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow-down"></use>
					</svg>
				</span>
				<span :class="{selected: filterType === 1}" @click="filterType = 1">
					{{sortText}}
					<svg class="arrow-down">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow-down"></use>
					</svg>
				</span>
				<span :class="{selected: filterType === 2}" @click="filterType = 2">
					{{exactText}}
					<svg class="arrow-down">
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#arrow-down"></use>
					</svg>
				</span>
			</section>
		</header>
		<div class="list-container">

			<list :url="url" :params="params"  :currentCount="currentCount" :hiddenLoading="hiddenLoading" v-on:requestComplete="requestComplete">
				<transition name="fade">
					<section v-if="list.length">
							<router-link :to="'/counselor/' + item.mid" class="seek-expert-item" v-for="item of list" :key="item.mid">
							<div class="header">
								<!-- <div class="avatar-wrapper">
									<img class="avatar" :src="">
								</div> -->
								<avatar :avatar="item.avatar"></avatar>
								<div class="info">
									<p class="nickname" v-text="item.nickname"></p>
									<span class="tag" v-text="item.licenseName" v-if="item.licenseName"></span>
									<span v-text="item.title"></span>
								</div>
								<span class="flex-center">
									<svg>
										<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#location"></use>
									</svg>
									{{item.location}}
								</span>
							</div>
							<div class="lazy-wrapper" :data-url="prefix + item.candidPhoto + postfix">
								<div class="lazy-img"></div>
							</div>
							<template v-if="item.profileNoTag.length">
								<template v-if="item.profileNoTag.length < 49">
									<p class="intro" v-text="item.profileNoTag"></p>
								</template>
								<template v-else>
									<p class="intro" v-text="item.profileNoTag.slice(0, 49) + '...'"></p>
								</template>
							</template>
							<div class="footer">
								<div>
									<span class="expert-tag" v-for="item of item.tags" v-text="item.phrase"></span>
									<p>
										<span>已有{{item.concernedNum}}人咨询</span>
										<span>咨费：{{item.voicePrice}}元 / {{item.voiceDuration}}分钟</span>
									</p>
								</div>
								<span class="call-status" :class="{'call-status-offline': item.status === 0, 'call-status-calling': item.status === 2, 'call-status-online': item.status === 1}" @click.prevent="downloadApp">
									{{item.status | statusFormat}}
									<svg class="phone" v-if="item.status === 1">
										<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#phone"></use>
									</svg>
								</span>
							</div>
							</router-link>
					</section>
				</transition>
			</list>

			<transition name="pull-down">
				<div class="pull-down consult-type" v-if="filterType === 0" @click="filterType = -1">
					<ul class="content" @click.stop>
						<li :class="{selected: item === consultText}" v-text="item" v-for="item of consultList" @click="selectConsultType(item)"></li>
					</ul>
				</div>
			</transition>

			<transition name="pull-down">
				<div class="pull-down sort-type" v-if="filterType === 1" @click="filterType = -1">
					<ul class="content" @click.stop>
						<li :class="{selected: item === sortText}" v-text="item" v-for="(item, index) of sortList" @click="selectSortType(item, index)"></li>
					</ul>
				</div>
			</transition>

			<transition name="pull-down">
				<div class="pull-down exact-type" v-if="filterType === 2" @click="filterType = -1">
					<div class="content" @click.stop>
						<div class="content-wrapper">
							<div class="exact-type-item" v-for="type of exactTypes">
								<h4 v-text="type.title" v-if="type.title"></h4>
								<ul>
									<li :class="{selected: item.selected}" v-text="item.text || item.phrase || item.licenseName" v-for="item of type.array" @click="selectExactType(item, type, $event)"></li>
								</ul>
							</div>
						</div>
						<div class="btn-wrapper">
							<span @click="resetExactType">重置</span>
							<span @click="sureExactType">确定{{exactNum ? '（' + exactNum + '）' : ""}}</span>
						</div>
					</div>
				</div>
			</transition>
		</div>

		<page-nav></page-nav>

	</div>
</template>

<script>
	import Vue from "vue"
	//import {mapState} from "vuex"
	import {getResponses} from "../api"
	import {serialize, lazy} from "../utils"
	import list from "../components/list"
	import pageNav from "../components/page_nav"
	import avatar from "../components/ui/avatar"

	export default {
		//name: "seekExpertKeep",
		data() {
			return {
				//prefix: "https://oml9ntix5.qnssl.com/",
				width: window.innerWidth,
				currentCount: 0,
				url: "Psychor/V1/searchPsycho.json",
				hiddenLoading: false,

				consultType: 0,
				sortMode: 1,
				tagId: [],
				licenseTypeJSON: [],
				degree: [],
				sex: 0,
				city: "",
				priceCeil: -1,
				priceFloor: -1,

				list: [],
				filterType: -1,

				consultText: "专业咨询",
				consultList: ["我校咨询", "专业咨询", "轻咨询"],
				sortText: "默认排序",
				sortList: ["默认排序", "在线", "最长从业年限", "价格从高到低", "价格从低到高", "最多经验", "最高效率"],
				exactText: "精确筛选",

				exactNum: 0
			}
		},
		components: {
			list,
			avatar,
			pageNav
		},
		created() {
			document.title = "咨询"

			if (+ this.$route.params.id === 1) {
				this.consultType = 1

				this.consultText = "轻咨询"
			}

			if (this.shan !== -1) {
				this.tagId.push(this.shan)

				this.exactNum = 1
				this.exactText = `筛选（${this.exactNum}）`

				this.consultCategory.forEach((item) => {
					item.tagId === this.shan && Vue.set(item, "selected", true)
				})
			}

			if (! this.consultCategory.length) {
				this.getExpertTag()
			}
		},
		watch: {
			consultType() {
				this.resetList()
			},
			sortMode() {
				this.resetList()
			}
		},
		computed: {
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			location() {
				return this.$store.state.location
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
			shan() {
				return this.$store.state.shan
			},
			consultCategory() {
				return this.$store.state.consultCategory
			},
			licenseType() {
				return this.$store.state.licenseType
			},
			//... mapState(["consultCategory", "licenseType"]),
			exactTypes() {
				const array = [
					{
						title: "擅长领域",
						array: this.consultCategory
					},
					{
						title: "执照类型",
						array: this.licenseType
					},
					{
						title: "学历",
						array: [
							{
								text: "博士",
								dId: 1
							},
							{
								text: "硕士",
								dId: 2
							},
							{
								text: "本科及以下",
								dId: 3
							}
						]
					},
					{
						title: "性别",
						array: [
							{
								text: "男",
								sId: 1
							},
							{
								text: "女",
								sId: 2
							}
						]
					},
					{
						title: "咨询价格区间",
						array: [
							{
								text: "小于100",
								priceCeilId: 100,
								priceFloorId: 0
							},
							{
								text: "100-200",
								priceCeilId: 200,
								priceFloorId: 100
							},
							{
								text: "大于200",
								priceCeilId: 0,
								priceFloorId: 200
							}
						]
					}
				]

				this.location && array.unshift({
					title: "",
					array: [
						{
							text: "同城"
						}
					]
				})

				return array
			},
			params() {
				const params = {
					pLevel: this.consultType,
					sortMode: this.sortMode,

					tagIdsJsn: JSON.stringify(this.tagId),
					licenseIdsJsn: JSON.stringify(this.licenseTypeJSON),
					degreeIdsJsn: JSON.stringify(this.degree),
					sex: this.sex,
					city: this.city,
					priceCeil: this.priceCeil,
					priceFloor: this.priceFloor,

					pageSize: 10
				}

				if (! this.city) {
					delete params.city
				}

				if (! this.tagId.length) {
					delete params.tagIdsJsn
				}

				if (! this.licenseTypeJSON.length) {
					delete params.licenseIdsJsn
				}

				if (! this.degree.length) {
					delete params.degreeIdsJsn
				}

				if (! this.sex) {
					delete params.sex
				}

				if (! params.priceCeil || params.priceCeil === -1) {
					delete params.priceCeil
				}

				if (! params.priceFloor || params.priceFloor === -1) {
					delete params.priceFloor
				}

				return serialize(params)
			}
		},
		filters: {
			statusFormat(value) {
				return ["不在线", "", "通话中"][value]
			}
		},
		methods: {
			async getExpertTag() {
				const params = {
					pageIndex: 1,
					pageSize: 6
				}
				const data = await getResponses(`${this.urlPrefix}Psychor/V1/obtainPsychoTagListAndLicenseList.json`, serialize(params))

				if (data.code === 0) {
					//this.expertTag = data.licenseTypes
					this.$store.commit("consultCategory", data.psychoTags)
					this.$store.commit("licenseType", data.licenseTypes)

					return
				}

				this.message = data.msg
			},
			requestComplete(data) {
				this.list = this.list.concat(data.psychoDTOs)

				this.currentCount = this.list.length

				// 恢复 shan 为-1，不然的话该字段值将一直存在
				this.$store.commit("shan", -1)

				this.$nextTick(lazy)
			},
			selectConsultType(value) {
				this.consultText = value
				this.filterType = -1
				this.consultType = value === "轻咨询" ? 1 : 0

				//this.cancelObserve = true

				// if (value === "我校咨询") {
				// 	this.url = "Psychor/getEapPsychos.json"
				// }
			},
			selectSortType(value, index) {
				this.sortText = value
				this.filterType = -1

				this.sortMode = index + 1

				this.cancelObserve = true
			},
			selectExactType(item, type, e) {
				//e.stopPropagation()

				if (item.selected) {
					item.selected = false

					this.exactNum--

					if (item.text === "同城") {
						this.city = ""
					}

					this.tagId.forEach((id, index, array) => {
						if (id === item.tagId) {
							array.splice(index, 1)
						}
					})

					this.licenseTypeJSON.forEach((id, index, array) => {
						if (id === item.ltid) {
							array.splice(index, 1)
						}
					})

					this.degree.forEach((id, index, array) => {
						if (id === item.dId) {
							array.splice(index, 1)
						}
					})

					return
				}

				if (item.text === "同城") {
					this.city = this.location
				}

				if (item.tagId) {
					this.tagId.push(item.tagId)
				}

				if (item.ltid) {
					this.licenseTypeJSON.push(item.ltid)
				}

				if (item.dId) {
					this.degree.push(item.dId)
				}

				if (item.sId) {
					this.sex && this.exactNum--;

					this.sex = item.sId

					type.array.forEach((item) => {
						item.selected = false
					})
				}

				if (item.priceCeilId !== undefined) {
					this.priceCeil !== -1 && this.exactNum--;

					this.priceCeil = item.priceCeilId
					this.priceFloor = item.priceFloorId

					//! item.priceFloor && (this.priceFloor = "")

					type.array.forEach((item) => {
						item.selected = false
					})
				}

				Vue.set(item, "selected", true)

				this.exactNum++
			},
			resetExactType(value) {
				this.exactNum = 0

				value !== 1 && this.resetState()

				this.exactTypes.forEach((item) => {
					item.array.forEach((item) => {
						item.selected = false
					})
				})
			},
			sureExactType() {
				this.filterType = -1
				this.exactText = this.exactNum ? `筛选（${this.exactNum}）` : "精确筛选"

				// 再点筛选需要保持点亮的状态 先注释掉
				//this.resetExactType(1)

				this.resetList()
			},
			resetState() {
				this.tagId = []
				this.licenseTypeJSON = []
				this.degree = []
				this.sex = 0
				this.priceCeil = 0
				this.priceFloor = 0
			},
			resetList() {
				this.currentCount = -1
				this.list = []
			},
			downloadApp() {
				this.$router.push("/download_app")
			}
		}
	}
</script>