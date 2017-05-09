<style src="../css/quiz.css"></style>

<template>
	<div id="app" class="quiz">
		<headers :title="'提问'" :left="false">
			<span slot="left" @click="cancel">取消</span>
			<span class="prepare-btn" :class="{success: issueStatus}" @click="prepareIssue">发布</span>
		</headers>
		<section class="quiz-item">
			<input class="title" type="text" placeholder="一句话描述你的问题（18字以内）" maxlength="18" v-model="title" ref="title">
		</section>
		<section class="quiz-item quiz-content">
			<textarea placeholder="详细描述你的情况，以得到咨询师更有效的指导和建议，建议不少于40字哦~" maxlength="2000" v-model="content"></textarea>
			<!-- <label v-if="! imgs.length">
				<input type="file" multiple @change="change">
			</label> -->
			<div class="quiz-img">
				<div class="quiz-img-progress" v-for="(img, index) of imgs" :key="img.url" v-if="imgs.length">
					<div class="img-div" :class="{horizontal: img.width > img.height}">
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
			{{content.length}}/2000
		</p>
		<ul class="quiz-item">
			<li class="add-tag" @click="status = true">
				<span class="flex-center">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#location"></use>
					</svg>
					添加标签
				</span>
				<span class="quiz-tag" v-text="tag ? tag : '选择标签'" ></span>
			</li>
			<li class="issue">
				<div class="flex-center">
					<svg>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#mao"></use>
					</svg>
					<span>匿名发布</span>
					<div class="switch-btn">
						<input type="checkbox" id="switch-input" v-model="anonymous">
						<label for="switch-input"></label>
					</div>
				</div>
				<span class="anonymous-text" v-if="anonymous">放心咨询，咨询内容会匿名显示</span>
				<span class="anonymous-text" v-else>会显示你的昵称和头像</span>
			</li>
		</ul>

		<tips :message="message" @cancelMessage="message = ''"></tips>

		<transition name="modal">
			<div class="modal" v-if="status" @click="status = false">
				<ul class="modal-content quiz-list" @click.stop>
					<li class="quiz-tag-item" :class="{avc: index === tagList.length - 1}" v-for="(item, index) of tagList" v-text="item.phrase" @click="selectTag(item)"></li>
					<li class="quiz-tag-item cancel" @click="status = false">取消</li>
				</ul>
			</div>
		</transition>
		<transition name="modal">
			<div class="modal" v-if="saveStatus" @click="saveStatus = false">
				<ul class="modal-content quiz-list save" @click.stop>
					<li class="quiz-save-item" @click="save">保存草稿</li>
					<li class="quiz-save-item avc" @click="noSave">不保存</li>
					<li class="quiz-save-item cancel" @click="saveStatus = false">取消</li>
				</ul>
			</div>
		</transition>
	</div>
</template>

<script>
	import tips from "../components/tips"
	import headers from "../components/headers"
	import {getResponse, getResponses, getResponsesFile} from "../api"
	import {serialize} from "../utils"

	export default {
		name: "consultPostKeep",
		data() {
			return {
				title: "",
				content: "",
				message: "",

				imgs: [],
				imgURL: [],
				tag: "",
				tagId: "",
				tagList: [],
				anonymous: true,

				status: false,
				saveStatus: false
			}
		},
		components: {
			tips,
			headers
		},
		beforeRouteEnter(to, from, next) {
			next((vm) => {
				if (! vm.mid) {
					next("/login")

					return
				}

				next()
			})
		},
		created() {
			document.title = "提问"

			this.getAskExpertTags()

			this.getPictureToken()
		},
		mounted() {
			this.$refs.title.focus()
		},
		computed: {
			mid() {
				return this.$store.state.mid
			},
			urlPrefix() {
				return this.$store.state.urlPrefix
			},
			pictureToken() {
				return this.$store.state.pictureToken
			},
			issueStatus() {
				return this.title && this.content && this.tag
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
			async upload(e, img, index) {
				const xhr = new XMLHttpRequest()
				const formdata = new FormData()
				const target = e.target
				const pictureToken = this.pictureToken
				const file = img.file
				const array = file.name.split(".")
				const filename = `${Date.now()}${this.mid}`

				this.imgs[index].width = target.naturalWidth
				this.imgs[index].height = target.naturalHeight

				formdata.append("file", file, filename)
				formdata.append("key", `${filename}${array[0]}-${target.naturalWidth}x${target.naturalHeight}.${array[1]}`)
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
			async getAskExpertTags() {
				if (sessionStorage.getItem("askExpertTags")) {
					try {
						this.tagList = JSON.parse(sessionStorage.getItem("askExpertTags"))
					} catch(e) {
						return console.log("%caskExpertTags 解析错误", "color: #F14382")
					}
				}

				const params = {
					pageIndex: 1,
					pageSize: 10
				}
				const data = await getResponses(`${this.urlPrefix}MemberAdvisory/obtainAdvisoryTagList.json`, serialize(params))

				this.tagList = data.advisoryTags

				sessionStorage.setItem("askExpertTags", JSON.stringify(this.tagList))
			},
			cancel() {
				if (this.title || this.content || this.tag) {
					this.saveStatus = true
				}

				this.$router.back()
			},
			save() {
				this.saveStatus = false

				localStorage.setItem("quizTitle", this.title)
				localStorage.setItem("quizContent", this.content)
				localStorage.setItem("quizTag", this.tag)
			},
			noSave() {
				this.saveStatus = false
			},
			prepareIssue() {
				if (! this.title) {
					this.message = "你还没有描述你的问题哦！"

					return
				}

				if (! this.content) {
					this.message = "亲说点什么吧~"

					return
				}

				if (! this.tag) {
					this.message = "还要选择标签哦！"

					return
				}

				this.issue()
			},
			async issue() {
				const params = {
					mid: this.mid,
					title: this.title,
					content: this.content,
					tagId: this.tagId,
					imgsJsn: JSON.stringify(this.imgURL),
					isAnony: this.anonymous ? 0 : 1
				}
				const data = await getResponses(`${this.urlPrefix}Advisory/V1/publishAdvisory.json`, serialize(params))

				if (data.code === 0) {
					this.message = "发布成功"

					this.$router.push("/consult/ask")

					return
				}

				this.message = data.msg
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
			selectTag(item) {
				this.status = false
				this.tag = item.phrase
				this.tagId = item.tagId
			}
		}
	}
</script>