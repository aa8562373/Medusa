<style src="../css/test"></style>

<template>
	<div id="app" class="test">
		<headers :title="'我的测试'" :placeholder="true"></headers>

		<bbb :tabs="tabs" v-on:switchTab="switchTab">
			<list class="homepage-list" :style="{width: width, height: sectionHeight}" :url="url" :params="params" :count="count" v-on:requestComplete="requestComplete">
				<ul v-if="list.length">
					<test v-for="(item, index) of list" :key="item.testingId" :detail="item"></test>
				</ul>
			</list>
			<list class="homepage-list" :style="{width: width, height: sectionHeight}" :url="url" :params="params" :count="interestCount" :isAbortRequest="this.typeId !== 101" v-on:requestComplete="interestRequestComplete">
				<ul v-if="list.length">
					<test v-for="(item, index) of interestList" :key="item.testingId" :detail="item"></test>
				</ul>
			</list>
			<list class="homepage-list" :style="{width: width, height: sectionHeight}" :url="url" :params="params" :count="studentCount" :isAbortRequest="this.typeId !== 102" v-on:requestComplete="studentRequestComplete">
				<ul v-if="list.length">
					<test v-for="(item, index) of studentList" :key="item.testingId" :detail="item"></test>
				</ul>
			</list>
		</bbb>
	</div>
</template>

<script>
	const width = window.innerWidth

	import tips from "../components/tips"
	import bbb from "../components/ui/bbb"
	import list from "../components/list"
	import test from "../components/ui/test"
	import headers from "../components/headers"
	import {getResponses} from "../api"
	import {serialize, timeFormat, lazy} from "../utils"

	export default {
		name: "testKeep",
		data() {
			return {
				typeId: 100,
				tabs: ["专业测试", "趣味测试", "学生测试"],
				width: width + "px",
				sectionHeight: "642px",

				//lineWidth: width * 86 / 414,
				//lineTranslate: 26 * width / 414,

				list: [],
				count: 0,
				url: "/testing/getTestingByTypeId.json",

				interestCount: 0,
				interestList: [],

				studentCount: 0,
				studentList: []
			}
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			params() {
				const params = {
					mid: this.mid,
					typeId: this.typeId,
					pageSize: 10
				}

				return serialize(params)
			}
		},
		components: {
			headers,
			tips,
			bbb,
			test,
			list
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (! vm.mid) {
					next("/login")
				}

				next()
			})
		},
		methods: {
			switchTab(value) {
				this.typeId = [100, 101, 102][value]
			},
			requestComplete(data) {
				this.list = this.list.concat(data.list)

				this.count = this.list.length
			},
			interestRequestComplete(data) {
				this.interestList = this.interestList.concat(data.list)

				this.interestCount = this.interestList.length
			},
			studentRequestComplete(data) {
				this.studentList = this.studentList.concat(data.list)

				this.studentCount = this.studentList.length
			}
		}
	}
</script>