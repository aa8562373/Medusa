<template>
	<div id="app">
		<headers :title="'修改昵称'">
			<span class="gray" :class="{success: name.length}" @click="modifyNickname">完成</span>
		</headers>

		<ul class="setting-list">
			<li class="modify-nickname">
				<input type="text" maxlength="12" autofocus :placeholder="nickname" v-model="name" @keyup.enter="modifyNickname">
			</li>
		</ul>

		<tips :message="message" @cancelMessage="message = ''"></tips>
	</div>
</template>

<script>
	import headers from "../components/headers"
	import tips from "../components/tips"
	import {getResponses} from "../api"
	import {serialize} from "../utils"

	export default {
		data() {
			return {
				name: "",
				message: ""
			}
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			nickname() {
				return this.$store.state.nickname
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			}
		},
		components: {
			tips,
			headers
		},
		methods: {
			async modifyNickname() {
				if (! this.name) {
					return
				}

				const params = {
					mid: this.mid,
					nickname: this.name
				}
				const data = await getResponses(`${this.urlPrefix}depression/api/modifyUserData.json`, serialize(params))

				if (data.code === 0) {
					this.$store.commit("notice", "昵称修改成功！")

					this.$store.commit("nickname", this.name)

					const user = JSON.parse(localStorage.getItem("profile"))

					user && (user.nickname = this.name)

					localStorage.setItem("profile", JSON.stringify(user))

					this.$router.push("/profile")

					return
				}


				this.message = data.error
			}
		}
	}
</script>