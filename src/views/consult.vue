<template>
	<div id="app" class="consult" :class="{overflow: filterType !== -1}">
		<header class="common-header">
			<router-link to="/search">
				<svg class="search">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#search"></use>
				</svg>
			</router-link>
			<div class="switch-expert-type">
				<!-- <span :class="{selected: stage === 0}" @click="stage = 0">找专家</span>
				<span :class="{selected: stage === 1}" @click="stage = 1">问专家</span> -->
				<router-link to="/consult" exact :class="{selected: selected}">找专家</router-link>
				<router-link to="/consult/ask" exact>问专家</router-link>
			</div>
			<router-link to="/download_app">
				<svg class="message">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#message"></use>
				</svg>
			</router-link>
		</header>
		<!-- <div class="consult-wrapper"> -->
			<!-- <seek-expert v-if="stage === 0" v-on:listLoad="listLoad" v-on:filterType="filterTypeChange"></seek-expert>
			<ask-expert v-if="stage === 1" v-on:listLoad="listLoad"></ask-expert> -->
			<router-view v-on:actived="activedHandler" v-on:filterType="filterTypeChange"></router-view>
		<!-- </div> -->
		<page-nav :actived="actived"></page-nav>
	</div>
</template>

<script>
	import Vue from "vue"
	import {getResponses} from "../api"
	import {serialize} from "../utils"
	import pageNav from "../components/page_nav"

	export default {
		data() {
			return {
				stage: 0,
				loading: true,
				filterType: -1,
				actived: false
			}
		},
		// beforeRouteEnter(to, from, next) {
		// 	next((vm) => {
		// 		vm.getWenZJTag()

		// 		window.addEventListener("scroll", vm.scrollLoad, false)
		// 	})
		// },
		components: {
			pageNav
		},
		computed: {
			selected() {
				// 为了解决 path 加上查询字符串后不匹配的问题
				return + this.$route.query.type === 2
			}
		},
		watch: {
			stage(value) {
				this.loading = true
			}
		},
		methods: {
			// listLoad(value) {
			// 	this.loading = ! value
			// },
			activedHandler() {
				this.actived = true
			},
			filterTypeChange(value) {
				this.filterType = value
			}
		}
	}
</script>