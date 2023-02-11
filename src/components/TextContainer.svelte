<script>
    import { marked } from "marked";
    import { Api } from "../config";
    import { selectedMarkdown, selectedNode } from "../stores";

    let scrollContainer;
    const renderer = new marked.Renderer();

    renderer.link = (href, title, text) => {
        if (href.includes("http")) {
            return `<a class="external" target="_blank" href="${href}" title="${text}">${text}</a>`;
        } else {
            let img = getMainImage(`${Api}/resources/${href}`);
            if (img) {
                return `<a class="node-highlite" data-id="${Api}/resources/${href}" title="${text}">${text}(${href})</a><img src="${img}" alt="${text}"></img>`;
            } else {
                return `<a class="node-highlite" data-id="${Api}/resources/${href}" title="${text}">${text}(${href})</a>`;
            }
        }
    };
    // Add a custom rule for parsing footnotes
    const footnoteRE = /\[\^([^\]]+)\]/g;
    renderer.text = (text) => {
        let output = text;
        let footnotes = [];
        let nextFootNoteId = 1;

        // Find all footnotes in the text
        output = output.replace(footnoteRE, (match, noteId) => {
            let footnote = footnotes[noteId];

            if (!footnote) {
                footnote = { id: nextFootNoteId++, text: noteId };
                footnotes[noteId] = footnote;
            }
            return `<sup class="footnote-reference" id="footnote-${footnote.id}"><a href="#footnote-${footnote.id}">${footnote.id}</a></sup>`;
        });

        // Append the footnotes to the end of the output
        // let footnoteSection = "";
        // for (let footnote of footnotes) {
        //     if (footnote) {
        //         footnoteSection += `<li id="footnote-${footnote.id}">${footnote.text}</li>`;
        //     }
        // }

        // if (footnoteSection) {
        //     output += `<div class="footnotes"><ol>${footnoteSection}</ol></div>`;
        // }

        return output;
    };
    $: html = marked($selectedMarkdown.markdown, { renderer });

    function getMainImage(id) {
        let match = $selectedMarkdown.items.filter((d) => d.url == id);
        if (match && match.length > 0) {
            let img = match?.[0].data?.thumbnail_display_urls?.medium;
            return img;
        }
    }

    function handleClick(event) {
        if (event.target.tagName === "A") {
            $selectedNode = event.target.getAttribute("data-id");
        }
    }
</script>

<div
    class="markdown"
    bind:this={scrollContainer}
    on:click={handleClick}
    on:keydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            handleClick;
        }
    }}
>
    {@html html}
</div>

<style>
    .markdown {
        flex: 3;
        min-width: 250px;
        font-size: 1.5rem;
        padding: 8px;
        padding-right: 0.5rem;
        padding-bottom: 150px;
        overflow: scroll;
    }
</style>
