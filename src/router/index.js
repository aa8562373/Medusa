import Home from "../views/home.vue"
import ArticleDetail from "../views/article_detail.vue"

import Consult from "../views/consult.vue"
import seekExpert from "../views/seek_expert.vue"
import askExpert from "../views/ask_expert.vue"
import ConsultDetail from "../views/consult_detail.vue"
import Counselor from "../views/counselor.vue"

import ConsultPost from "../views/consult_post.vue"

import RadioStation from "../views/radio_station.vue"

import Profile from "../views/profile.vue"
import ProfileQuiz from "../views/profile_quiz.vue"
import ProfileCircle from "../views/profile_circle.vue"
import ProfileTest from "../views/profile_test.vue"
import profileCollection from "../views/profile_collection.vue"
import Feedback from "../views/feedback"
import Homepage from "../views/homepage"
import Setting from "../views/setting"
import Nickname from "../views/nickname"

import Order from "../views/order"
import OrderDetail from "../views/order_detail"
import Rate from "../views/rate"

import Discover from "../views/discover.vue"
import DiscoverDetail from "../views/discover_detail.vue"
import discoverPost from "../views/discover_post.vue"

import Login from "../views/login.vue"
import Register from "../views/register.vue"

import Search from "../views/search.vue"
import SearchMore from "../views/search_more.vue"

import downloadApp from "../views/download_app.vue"

import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter)

const createView = name => () =>
  System.import('../views/CreateView').then(m => m.createListView(name))

const mode = "history"
const routes = [
	{
		path: "/",
		component: Home
	},
	{
		path: "/article/:id",
		component: ArticleDetail
	},
	{
		path: "/consult",
		component: seekExpert,
		meta: {
			keepAlive: true
		}
	},
	{
		path: "/consult/ask",
		component: askExpert,
		meta: {
			keepAlive: true
		}
	},
	{
		path: "/consult/post",
		component: ConsultPost
	},
	{
		path: "/consult/:id",
		component: seekExpert,
		meta: {
			keepAlive: true
		}
	},
	{
		path: "/consult/detail/:id",
		component: ConsultDetail
	},
	{
		path: "/counselor/:id",
		component: Counselor
	},
	{
		path: "/radio_station",
		component: RadioStation
	},
	{
		path: "/discover",
		component: Discover
	},
	{
		path: "/discover/detail/:id",
		component: DiscoverDetail
	},
	{
		path: "/discover/post",
		component: discoverPost
	},
	{
		path: "/profile",
		component: Profile
	},
	{
		path: "/profile/quiz",
		component: ProfileQuiz
	},
	{
		path: "/profile/circle",
		component: ProfileCircle
	},
	{
		path: "/profile/test",
		component: ProfileTest
	},
	{
		path: "/profile/collection",
		component: profileCollection
	},
	{
		path: "/profile/feedback",
		component: Feedback
	},
	{
		path: "/profile/setting",
		component: Setting
	},
	{
		path: "/profile/nickname",
		component: Nickname
	},
	{
		path: "/profile/:id",
		component: Homepage
	},
	{
		path: "/order",
		component: Order
	},
	{
		path: "/order/detail/:id",
		component: OrderDetail
	},
	{
		path: "/order/rate/:id",
		component: Rate
	},
	{
		path: "/login",
		component: Login
	},
	{
		path: "/register",
		component: Register
	},
	{
		path: "/search",
		component: Search
	},
	{
		path: "/search/more",
		component: SearchMore
	},
	{
		path: "/download_app",
		component: downloadApp
	},
	// {
	// 	path: "/login",
	// 	component: Login
	// },
	// {
	// 	path: "/message",
	// 	component: Message,
	// 	beforeEnter: (to, from, next) => {
	// 		if (! localStorage.getItem("user")) {
	// 			next("/login")
	// 		} else {
	// 			next()
	// 		}
	// 	}
	// },
	{
		path: "*",
		redirect: "/"
	}
]

export default new VueRouter({
	mode,
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition
		}

		if (to.hash) {
			return {
				selector: to.hash
			}
		}

		return {
			y: 0
		}
	}
})