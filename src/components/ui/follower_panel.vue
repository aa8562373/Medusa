<template>
	<li class="follower-panel" @click="redirect(item.mid)">
		<div class="avatar-wrapper">
			<img :src="prefix + item.avatarAbs + postfix" :class="{horizontal: item.avatarAbs && item.avatarAbs.replace(/\-(\d+)x(\d+)\./, (match, w, h) => + w > + h).indexOf('true') !== -1}">
		</div>
		<div class="info">
			<span class="nickname" v-text="item.nickname"></span>
			<p v-text="item.title" v-if="item.title"></p>
		</div>
		<span v-if="item.isConcern === 0" @click.stop="cancelFollow(item)">
			<svg>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#follower"></use>
			</svg>
			已关注
		</span>
		<span class="to-follower" v-else @click.stop="follow(item)">
			<svg>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#to-follow"></use>
			</svg>
			加关注
		</span>
	</li>
</template>

<script>
	import {getResponses} from "../../api"
	import {serialize} from "../../utils"

	export default {
		props: ["item"],
		data() {
			return {

			}
		},
		computed: {
			mid() {
				return this.$store.state.mid
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
			}
		},
		methods: {
			redirect(mid) {
				location.href = `/profile/${mid}`
			},
			async follow(item) {
				const params = {
					concernFrom: this.mid,
					concernTo: item.mid
				}

				const data = await getResponses(`${this.urlPrefix}MemberConcern/concernMemberConcern.json`, serialize(params))

				if (data.code === 0) {
					item.isConcern = 0

					this.$emit("message", "关注成功")

					return
				}

				this.$emit("message", data.msg)
			},
			cancelFollow(item) {
				this.$emit("popup", true)

				window.item = item
			}
		}
	}
</script>