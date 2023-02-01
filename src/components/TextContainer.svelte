<script>
    import { marked } from "marked";
    import { Api } from "../config";
    import { selectedMarkdown, visibleLinks, allLinks } from "../stores";
    import { onMount } from "svelte";

    const renderer = new marked.Renderer();

    renderer.link = (href, title, text) => {
        return `<a data-id="${Api}/resources/${href}" title="${text}">${text}</a>`;
    };

    $: html = marked(
        $selectedMarkdown.markdown || $selectedMarkdown[0].markdown,
        { renderer }
    );

    onMount(() => {
        // observer changes when scrolling the text
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                allLinks.update((items) => {
                    const newItem = entry.target.getAttribute("data-id");
                    if (!items.includes(newItem)) {
                        items.push(newItem);
                    }
                    return items;
                });

                if (entry.isIntersecting) {
                    visibleLinks.update((array) => {
                        if (!array) {
                            return [entry.target.getAttribute("data-id")];
                        }
                        return [...array, entry.target.getAttribute("data-id")];
                    });
                } else {
                    visibleLinks.update((array) => {
                        if (!array) {
                            return [];
                        }
                        return array.filter(
                            (link) =>
                                link !== entry.target.getAttribute("data-id")
                        );
                    });
                }
            });
        });

        const links = document.querySelectorAll(".markdown a");
        links.forEach((link) => observer.observe(link));
    });
</script>

<div class="markdown">
    {@html html}
</div>

<style>
    .markdown {
        flex: 1;
        min-width: 500px;
        font-size: 1.25rem;
        padding: 8px;
        padding-right: 1rem;
        padding-bottom: 150px;
        margin-right: 0.5rem;
        border-right: 1px solid;
        overflow: scroll;
    }
</style>
