<template>
<!-- <transition name="up"> -->
	<div id="app" class="quiz">
		<headers :title="'发心情'" :left="false">
			<span slot="left" @click="cancel">取消</span>
			<span class="prepare-btn" :class="{success: issueStatus}" @click="prepareIssue">发布</span>
		</headers>
		<section class="quiz-item quiz-content">
			<textarea placeholder="和心友们分享一下你此刻的心情~" maxlength="300" v-model="content" ref="textarea"></textarea>
			<!-- <label v-if="! imgs.length">
				<input type="file" multiple @change="change">
			</label> -->
			<div class="quiz-img" :class="{supplement: imgs.length === 1 || imgs.length === 2 || imgs.length === 5 || imgs.length === 6, 'supplement-before': imgs.length === 1 || imgs.length === 5}">
				<div class="quiz-img-progress" v-for="(img, index) of imgs" :key="img.url" v-if="imgs.length">
					<div class="img-div">
						<img :src="img.url" @click="deleteImg(img, index)" @load="upload($event, img, index)">
					</div>
					<div class="mask" :style="{transform: 'translateY(-' + img.progress + '%)'}" v-if="img.progress !== 100"></div>
					<span class="delete-img" v-else></span>
				</div>
				<label v-if="imgs.length < 9">
					<input type="file" accept="image/*" multiple @change="change">
				</label>
			</div>
		</section>
		<p class="surplus-quiz-num">
			{{content.length}}/300
		</p>
		<ul class="quiz-item">
			<li class="issue">
				<div class="flex-center">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#location"></use>
					</svg>
					<span>显示位置</span>
					<div class="switch-btn">
						<input id="switch-input" type="checkbox" v-model="showLocation">
						<label for="switch-input"></label>
					</div>
				</div>
				<span class="anonymous-text" v-if="location">杭州</span>
				<span class="anonymous-text" v-else>心友圈内容不会显示你的位置</span>
			</li>
			<li class="issue">
				<div class="flex-center">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mao"></use>
					</svg>
					<span>匿名发布</span>
					<div class="switch-btn">
						<input id="switch-input" type="checkbox" v-model="anonymous">
						<label for="switch-input"></label>
					</div>
				</div>
				<span class="anonymous-text" v-if="anonymous">心友圈内容会匿名显示</span>
				<span class="anonymous-text" v-text="nickname" v-else></span>
			</li>
		</ul>

		<tips :message="message" @cancelMessage="message = ''"></tips>
		<transition name="modal">
			<div class="modal" v-if="status" @click="status = false">
				<ul class="modal-content quiz-list save" @click.stop>
					<li class="quiz-save-item" @click="save">保存草稿</li>
					<li class="quiz-save-item avc" @click="noSave">不保存</li>
					<li class="quiz-save-item cancel" @click="status = false">取消</li>
				</ul>
			</div>
		</transition>
	</div>
<!-- 	</transition> -->
</template>

<script>
	import tips from "../components/tips"
	import headers from "../components/headers"
	import {getResponse, getResponses} from "../api"
	import {serialize} from "../utils"

	export default {
		name: "discoverPostKeep",
		data() {
			return {
				content: "",
				message: "",

				imgs: [],
				imgURL: [],
				showLocation: true,
				anonymous: false,

				status: false
			}
		},
		components: {
			tips,
			headers
		},
		created() {
			document.title = "发心情"

			this.getPictureToken()

			this.$nextTick(() => {
				this.$refs.textarea.focus()
			})
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
			},
			location() {
				return this.$store.state.location
			},
			issueStatus() {
				return this.content
			},
			pictureToken() {
				return this.$store.state.pictureToken
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
			prepareIssue() {
				if (! this.content) {
					this.message = "亲说点什么吧~"

					return
				}

				this.issue()
			},
			async issue() {
				const params = {
					mid: this.mid,
					content: this.content,
					imgsJsn: JSON.stringify(this.imgURL),
					isAnony: this.anonymous ? 0 : 1
				}

				if (this.showLocation) {
					params.writeLocation = this.location
				}

				const data = await getResponses(`${this.urlPrefix}Heartmate/V1/publishUpdate.json`, serialize(params))

				if (data.code === 0) {
					this.message = "发布成功"

					this.$router.push("/discover")

					return
				}

				this.message = data.msg
			},
			cancel() {
				if (this.content) {
					this.status = true

					return
				}

				this.$router.push("/discover")
			},
			save() {
				this.status = false

				localStorage.setItem("moodContent", this.content)

				this.$router.push("/discover")
			},
			noSave() {
				this.status = false

				this.$router.push("/discover")
			},
			change(e) {
				//const [file] = e.target.files
				const files = [... e.target.files]

				// chrome bug 弹出文件选择框 点取消 依然触发 change 事件
				if (! files) {
					return
				}

				window.URL = window.URL || window.webkitURL

				for (let file of files) {
					if (file.type.indexOf("image") === -1) {
						this.message = "请选择图片文件"

						return
					}

					if (file.size > 6 * 1024 * 1024) {
						this.message = "图片过大！"

						return
					}

					this.imgs.push({
						file: file,
						progress: 0,
						url: window.URL.createObjectURL(file)
					})
				}
			},
			revokeImg(img) {
				window.URL.revokeObjectURL(img)
			},
			deleteImg(index) {
				this.imgs.splice(index, 1)

				this.imgURL.splice(index, 1)
			},
			async upload(e, img, index) {
				const xhr = new XMLHttpRequest()
				const formdata = new FormData()
				const target = e.target
				const pictureToken = this.pictureToken
				const file = img.file
				const array = file.name.split(".")
				const filename = `${Date.now()}${this.mid}`

				target.naturalWidth > target.naturalHeight && e.target.classList.add("horizontal")

				formdata.append("file", file, filename)
				formdata.append("key", `${filename}-${target.naturalWidth}x${target.naturalHeight}.${array[1]}`)
				formdata.append("token", pictureToken)

				xhr.onload = () => {
					if (xhr.status === 200 && xhr.status < 300 || xhr.status === 304) {
						try {
							const data = JSON.parse(xhr.responseText)

							this.imgURL.push(data.key)
						} catch(e) {
							console.log("%c数据解析失败", "font: 14px 微软雅黑; color: #F14382")
						}
					} else {
						reject(new Error(xhr.statusText))
					}
				}

				xhr.upload.onprogress = (e) => {
					e.lengthComputable && (img.progress = (e.loaded / e.total) * 100)
				}

				xhr.open("POST", "http://up.qiniu.com")
				xhr.send(formdata)
			},
		}
	}
</script>