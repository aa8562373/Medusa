import Vue from "vue"
import Vuex from "vuex"

import axios from "axios"
import {serialize} from "../utils"

Vue.use(Vuex)


let data = {}

localStorage.getItem("profile") && (data = JSON.parse(localStorage.getItem("profile")))

const state = {
	mid: data.mid || "",
	avatar: data.avatar || "",
	nickname: data.nickname || "",
	token: data.token || "",
	webp: false,
	filterConsultType: 1,
	consultCategory: [],
	licenseType: [],
	pictureToken: "",
	userType: 1,
	location: data.location,
	sex: 0,
	notice: "",
	//urlPrefix: "/depression-api-liaoyuan/",
	urlPrefix: "/depression-api-liaoyuan/",
	//prefix: "https://oml9ntix5.qnssl.com/",
	prefix: "https://picture.120xinmao.com/",

	searchType: -1,
	searchText: "",
	searchTitle: "",
	searchURL: "",

	shan: -1,
	home: {
		//isAbortRequest: true,
		banner: [],
		notice: [],
		consultCategory: [],
		articles: []
	}
}

const fetchs = (name, url, params, aa) => axios.post(`http://api.120xinmao.com/depression-api-liaoyuan/${url}`, serialize(params)).then((response) => {
	return {
		name: name,
		data: response.data,
		aa: aa
	}
}).catch((e) => {
	console.log(e)
})

const aaa = [
	{
		name: "banner",
		url: "adBanner/list.json",
		params: null,
		aa: "list"
	},
	{
		name: "notice",
		url: "serviceOrder/V1/obtainServiceOrderBroadcast.json",
		params: null,
		aa: "broadcasts"
	},
	{
		name: "consultCategory",
		url: " /Psychor/V1/obtainPsychoTagList.json",
		params: {
			pageIndex: 1,
			pageSize: 6
		},
		aa: "psychoTags"
	},
	{
		name: "articles",
		url: "Article/V1/obtainArticlesNew.json",
		params: {
			pageIndex: 1,
			pageSize: 10
		},
		aa: "articleDTOs"
	}
]
const actions = {
	fetch_home_data({ commit, dispatch, state }, webp) {
		return Promise.all(aaa.map((item) => {
			return fetchs(item.name, item.url, item.params, item.aa)
		})).then((data) => {
			//console.log(data[3].data)
			//console.log(webp)
			//commit("webp", webp)
			//commit("isAbortRequest", false)
			commit("set_home_data", data)
		})
	}
}

const mutations = {
	mid(state, mid) {
		state.mid = mid
	},
	avatar(state, avatar) {
		state.avatar = avatar
	},
	nickname(state, nickname) {
		state.nickname = nickname
	},
	notice(state, notice) {
		state.notice = notice
	},
	shan(state, shan) {
		state.shan = shan
	},
	webp(state, webp) {
		state.webp = webp
	},
	isAbortRequest(state, isAbortRequest) {
		state.home.isAbortRequest = isAbortRequest
	},
	accesstoken(state, accesstoken) {
		state.accesstoken = accesstoken
	},
	pictureToken(state, pictureToken) {
		state.pictureToken = pictureToken
	},
	user(state, user) {
		state.mid = user.mid
		state.avatar = user.avatar
		state.nickname = user.nickname
		state.userType = user.userType
		state.location = user.location
	},
	filterConsultType(state, filterConsultType) {
		state.filterConsultType = filterConsultType
	},
	consultCategory(state, consultCategory) {
		state.consultCategory = consultCategory
	},
	licenseType(state, licenseType) {
		state.licenseType = licenseType
	},
	search(state, search) {
		state.searchType = search.searchType
		state.searchTitle = search.searchTitle
		state.searchText = search.searchText
		state.searchURL = search.searchURL
	},
	set_home_data(state, data) {
		//console.log(d.name)
		//state.home[name] = data
		//Vue.set(state.home, "banner", d.data.data.list)
		//console.log(state.home)

		//console.log(data)



		data.forEach((item) => {
			if (item.name === "notice") {
				item.data[item.aa] = item.data[item.aa].concat(item.data[item.aa].slice(0, 1))
			}

			state.home[item.name] = item.data[item.aa]
		})
	}
}

const getters = {
	mid: state => state.mid,
	avatar: state => state.avatar,
	nickname: state => state.nickname,
	webp: state => state.webp,
	filterConsultType: state => state.filterConsultType
}

export default new Vuex.Store({
	state,
	actions,
	getters,
	mutations
})