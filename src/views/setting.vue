<style src="../css/setting"></style>

<template>
	<div id="app">
		<headers :title="'设置'" :placeholder="true"></headers>

		<ul class="setting-list">
			<li class="more">
				<span>头像</span>
				<avatar :avatar="avatar" v-if="avatar"></avatar>
				<label class="setting-avatar">
					<input type="file" accept="image/*" @change="changeAvatar">
				</label>
			</li>
			<li class="more" @click="modifyNickname">
				<span>昵称</span>
				<span v-text="nickname"></span>
			</li>
		</ul>

		<div class="sign-out" @click="signOut">退出登录</div>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import tips from "../components/tips"
	import headers from "../components/headers"
	import avatar from "../components/ui/avatar"
	import {serialize} from "../utils"
	import {getResponse, getResponses, getResponsesFile} from "../api"

	export default {
		data() {
			return {
				message: ""
			}
		},
		components: {
			tips,
			avatar,
			headers
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			avatar() {
				return this.$store.state.avatar
			},
			nickname() {
				return this.$store.state.nickname
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
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
			pictureToken() {
				return this.$store.state.pictureToken
			}
		},
		created() {
			if (! this.pictureToken) {
				this.getPictureToken()
			}
		},
		methods: {
			async getPictureToken() {
				const data = await getResponse(`${this.urlPrefix}Qiniu/obtainPictureUploadToken.json`)

				if (data.code === 0) {
					this.$store.commit("pictureToken", data.token)

					return
				}

				this.message = data.msg
			},
			changeAvatar(e) {
				const file = e.target.files[0]

				// chrome bug 弹出文件选择框 点取消 依然触发 change 事件
				if (! file) {
					return
				}


				if (file.type.indexOf("image") === -1) {
					this.message = "请选择图片文件"

					return
				}

				if (file.size > 6 * 1024 * 1024) {
					this.message = "图片过大！"

					return
				}

				let width, height
				const formdata = new FormData()
				const target = e.target
				const array = file.name.split(".")

				window.URL = window.URL || window.webkitURL


				const img = new Image()

				img.src = window.URL.createObjectURL(file)

				new Promise((resolve) => {
					img.onload = () => {
						width = img.naturalWidth
						height = img.naturalHeight

						window.URL.revokeObjectURL(file)

						resolve()
					}
				}).then(async () => {
					formdata.append("file", file, file.name)
					formdata.append("key", `${Date.now()}${this.mid}${array[0]}-${width}x${height}.${array[1]}`)
					formdata.append("token", this.pictureToken)

					this.message = "正在上传头像..."

					const avatar = await getResponsesFile("http://up.qiniu.com", formdata)

					const params = {
						mid: this.mid,
						avatar: avatar.key,
						avatarThumbnail: avatar.key
					}
					const data = await getResponses(`${this.urlPrefix}depression/api/modifyUserData.json`, serialize(params))

					if (data.code === 0) {
						this.message = ""

						this.$store.commit("avatar", avatar.key)

						const user = JSON.parse(localStorage.getItem("profile"))

						user && (user.avatar = avatar.key)

						localStorage.setItem("profile", JSON.stringify(user))

						return
					}

					this.message = data.msg
				})
			},
			signOut() {
				localStorage.clear()

				location.href = "/profile"
			},
			modifyNickname() {
				this.$router.push("/profile/nickname")
			}
		}
	}
</script>