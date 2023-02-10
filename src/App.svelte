<script>
	import { onMount } from "svelte";
	import { Files } from "./config.js";
	import { fetchFile, extractLinks, createTriplets } from "./functions.js";
	import { selectedMarkdown, graphData } from "./stores.js";
	import { v4 as uuidv4 } from "uuid";
	import TextContainer from "./components/TextContainer.svelte";
	import SvgContainer from "./components/SvgContainer.svelte";
	import Header from "./components/Header.svelte";
	import ItemDetail from "./components/ItemDetail.svelte";

	let MarkdownFiles;

	onMount(async () => {
		MarkdownFiles = await Promise.all(
			Files.map(async (item) => {
				const title = item
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
				const url = `/essays/${item}.md`;
				const markdown = await fetchFile(url);
				const items = await extractLinks(markdown);
				const id = uuidv4();
				return { title, url, markdown, items, id };
			})
		);
		selectedMarkdown.set(MarkdownFiles[0]);
		graphData.set(createTriplets($selectedMarkdown));
	});
</script>

<main>
	{#if MarkdownFiles === undefined}
		<h4 class="loading">Loading Essays...</h4>
	{:else}
		<Header {MarkdownFiles} {selectedMarkdown} />
		<div class="container">
			<TextContainer {MarkdownFiles} />
			<ItemDetail />
			<SvgContainer />
		</div>
	{/if}
</main>

<style>
	.loading {
		padding: 1rem;
		margin: 0;
	}
	.container {
		display: flex;
		height: 100vh;
	}

	:global(a) {
		color: blue;
	}
</style>
