<style src="../css/login"></style>

<template>
	<div id="app" class="login">
		<span class="back" @click="back"></span>
		<router-link to="/" class="logo">
			<img src="../images/logo.png">
		</router-link>
		<div class="login-item">
			<svg>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login-phone"></use>
			</svg>
			<label data-tips="手机号码（+86）" :class="{'phone-actived': phone}">
				<input type="tel" autofocus v-model="phone">
			</label>
		</div>
		<div class="login-item">
			<svg>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login-password"></use>
			</svg>
			<label data-tips="密码（6-20位）" :class="{'phone-actived': password}">
				<input type="password" v-model="password" @keyup.enter="login">
			</label>
		</div>
		<router-link to="/reset-password" class="forget-password">忘记密码？</router-link>
		<template v-if="loginStatus">
			<div class="login-btn" :class="{actived: logining}" v-text="text" @click="login"></div>
		</template>
		<template v-else>
			<div class="login-btn" v-text="text"></div>
		</template>
		<router-link class="register-btn" to="/register">
			没有账号？
			<span>立即注册</span>
		</router-link>
		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import {getResponses} from "../api"
	import {serialize} from "../utils"
	import tips from "../components/tips"
	import {mapMutations} from "vuex"

	export default {
		data() {
			return {
				phone: "",
				password: "",

				text: "登录",
				logining: true,

				message: ""
			}
		},
		created() {
			document.title = "登录"
		},
		components: {
			tips
		},
		computed: {
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			loginStatus() {
				return this.phone.length === 11 && this.password.length > 5
			}
		},
		methods: {
			back() {
				this.$router.push("/profile")
			},
			async login() {
				const params = {
					username: this.phone,
					password: this.password
				}

				this.logining = false
				this.text = "登录中..."

				const data = await getResponses(`${this.urlPrefix}/depression/api/appMemberLogin.json`, serialize(params))

				this.logining = true
				this.text = "登录"

				if (data.code === 0) {
					this.save(data)

					this.$router.push("/")

					return
				}

				this.message = data.error
			},
			... mapMutations(["user"]),
			save(data) {
				const user = {
					mid: data.list[0].mid,
					sex: data.list[0].sex,
					avatar: data.list[0].avatar,
					userType: data.list[0].userType,
					nickname: data.list[0].nickname,
					location: data.list[0].location
				}

				localStorage.setItem("profile", JSON.stringify(user))

				this.user(user)
			}
		}
	}
</script>