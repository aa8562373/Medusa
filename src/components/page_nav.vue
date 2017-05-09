<template>
	<nav class="page-nav">
		<router-link :class="{'router-link-active': actived}" v-for="(item, index) of pageNav" :key="item.path" :to="item.path" exact>
			<svg class="page-nav-svg">
				<use xmlns:xlink="http://www.w3.org/1999/xlink" :xlink:href="'#' + ($route.path === item.path || (index === 1 && actived) ? item.svgSelected : item.svg)"></use>
			</svg>
			{{item.text}}
		</router-link>
	</nav>
</template>

<script>
	export default {
		props: ["actived"],
		data() {
			return {
				pageNav: [
					{
						path: "/",
						text: "首页",
						svg: "home",
						svgSelected: "home-selected"
					},
					{
						path: "/consult",
						text: "咨询",
						svg: "consult",
						svgSelected: "consult-selected"
					},
					{
						path: "/discover",
						text: "发现",
						svg: "discover",
						svgSelected: "discover-selected"
					},
					{
						path: "/profile",
						text: "我的",
						svg: "profile",
						svgSelected: "profile-selected"
					}
				]
			}
		}
	}
</script>