<script>
    import { selectedMarkdown, graphData } from "../stores";
    import { createTriplets } from "../functions.js";
    export let MarkdownFiles;

    function selectMarkdown(event, id) {
        selectedMarkdown.set(MarkdownFiles.filter((d) => d.id === id));
        graphData.set(createTriplets(...$selectedMarkdown));
    }
</script>

<header>
    {#each MarkdownFiles as file}
        <button on:click={(e) => selectMarkdown(e, file.id)}>{file.title}</button>
    {/each}
</header>

<style>
    header {
        display: flex;
        background: gainsboro;
        font-size: 1.25rem;
    }

    header button {
        margin: 0 1rem;
        background: none;
        border: none;
        cursor: pointer;
    }
</style>
