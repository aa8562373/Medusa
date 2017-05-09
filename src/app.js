import "normalize.css"
import "./css/common.css"

import "./css/radio_station.css"


import Vue from "vue"
import router from "./router"
import App from "./app.vue"
import store from "./vuex"

const app = new Vue({
	el: "#app",
	store,
	router,
	... App,
	//render: h => h(App)
	//render: (h) => h('div', {}, 'Hi, there.')
	//template: '<div id="app"> ... </div>'
})

//export { app, router, store }