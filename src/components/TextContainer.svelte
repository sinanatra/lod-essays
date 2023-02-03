<script>
    import { marked } from "marked";
    import { Api } from "../config";
    import { selectedMarkdown} from "../stores";
    import { onMount } from "svelte";
    import { observe } from "../functions.js";

    const renderer = new marked.Renderer();
    let scrollContainer;
    renderer.link = (href, title, text) => {
        return `<a data-id="${Api}/resources/${href}" title="${text}">${text}</a>`;
    };

    $: html = marked(
        $selectedMarkdown.markdown || $selectedMarkdown[0].markdown,{ renderer }
    );

    $: {
        observe();
    }

    onMount(() => {
        observe();
        scrollContainer.addEventListener("scroll", function (e) {
            observe();
        });
    });

</script>

<div class="markdown" bind:this={scrollContainer}>
    {@html html}
</div>

<style>
    .markdown {
        flex: 1;
        min-width: 250px;
        font-size: 1.25rem;
        padding: 8px;
        padding-right: 1rem;
        padding-bottom: 150px;
        margin-right: 0.5rem;
        border-right: 1px solid;
        overflow: scroll;
    }
</style>
