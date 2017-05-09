<style src="../css/register"></style>

<template>
	<div id="app" class="register">
		<header class="header-two">
			<span class="back" @click="back"></span>
			<div class="title">注册</div>
		</header>
		<div class="login-item">
			<svg>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login-phone"></use>
			</svg>
			<label data-tips="手机号码（+86）" :class="{'phone-actived': phone}">
				<input type="tel" v-model="phone" @keyup.enter="getCode">
			</label>
			<template v-if="waitStatus">
				<span class="get-code actived" v-text="codeText"></span>
			</template>
			<template v-else>
				<span class="get-code" :class="{actived: phoneStatus, waiting: waitCode}" v-text="codeText" @click="getCode"></span>
			</template>
		</div>
		<div class="login-item">
			<svg>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#code"></use>
			</svg>
			<label data-tips="验证码" :class="{'phone-actived': code}">
				<input type="number" v-model="code" ref="code">
			</label>
		</div>
		<div class="login-item">
			<svg>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#login-password"></use>
			</svg>
			<label data-tips="密码（6-20位）" :class="{'phone-actived': password}">
				<input type="password" v-model="password" @keyup.enter="register">
			</label>
		</div>
		<template v-if="registerStatus">
			<div class="login-btn" :class="{actived: registering}" v-text="text" @click="register"></div>
		</template>
		<template v-else>
			<div class="login-btn" v-text="text"></div>
		</template>
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
				code: "",
				password: "",

				text: "注册",
				codeText: "获取验证码",
				waitCode: false,
				waitStatus: false,

				registering: true,

				message: ""
			}
		},
		computed: {
			registerStatus() {
				return this.phone.length === 11 && this.code && this.password.length > 5
			},
			phoneStatus() {
				return this.phone.length === 11
			}
		},
		components: {
			tips
		},
		created() {
			document.title = "注册"
		},
		methods: {
			back() {
				this.$router.back()
			},
			async getCode() {
				const params = {
					mobilePhone: this.phone
				}

				this.waitCode = true

				const data = await getResponses("/depression-api/depression/api/getSmsAuthCode.json", serialize(params))

				this.waitCode = false

				if (data.code !== 0) {
					this.message = data.error

					return
				}

				this.$refs.code.focus()

				this.waitStatus = true

				let count = 59
				const that = this

				this.codeText = `${count}s`

				setTimeout(function codeFormat() {
					--count

					that.codeText = `${count}s`

					if (count) {
						setTimeout(codeFormat, 1000)
					} else {
						that.waitStatus = false
						that.codeText = "获取验证码"
					}
				}, 1000)
			},
			async register() {
				const params = {
					phoneNumber: this.phone,
					authCode: this.code,
					password: this.password
				}

				this.registering = false
				this.text = "注册中..."

				const data = await getResponses("/depression-api/depression/api/appRegisterMember.json", serialize(params))

				this.registering = true
				this.text = "注册"

				if (data.code === 0) {
					this.save(data)

					this.$router.push("/")

					return
				}

				this.message = data.error
			},
			... mapMutations(["nickname"]),
			save(data) {
				localStorage.setItem("profile", JSON.stringify({
					nickname: data.nickname
				}))

				this.nickname(data.nickname)
			}
		}
	}
</script>