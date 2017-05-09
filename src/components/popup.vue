<template>
	<transition name="popup">
		<div class="popup-wrapper" v-if="cancelPopup">
			<div class="content">
				<p v-text="text"></p>
				<div class="btn-wrapper">
					<span class="btn" @click="cancel">取消</span>
					<slot></slot>
				</div>
			</div>
		</div>
	</transition>
</template>

<script>
	export default {
		props: ["text", "cancelPopup"],
		methods: {
			cancel() {
				this.$emit("cancelPopup")
			}
		}
	}
</script>