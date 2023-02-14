<script>
    import { onMount } from "svelte";
    import { selectedNode } from "../stores.js";
    import { parseProperties } from "../functions.js";

    let selections = new Map(); // Use a Map to store the selections and their keys
    let selection;

    onMount(async () => {
        selectedNode.subscribe(async (value) => {
            if (selections.has(value.id)) {
                // Check if the selection has already been made
                selection = selections.get(value.id); // Use the cached selection if it exists
            } else {
                if (value.id) {
                    try {
                        const response = await fetch(value.id);
                        selection = await response.json();
                        selections.set(value.id, selection); // Store the new selection in the Map
                    } catch (error) {
                        console.error(error);
                    }
                }
            }
        });
    });

    let parsedProperties;
    $: {
        parsedProperties = parseProperties(selection);
        console.log(parsedProperties)
    }
</script>

<div class="detail">
    {#if selection}
        <h3>
            {selection["o:title"]}
        </h3>
        {#if selection?.thumbnail_display_urls?.large}
            <img
                src={selection?.thumbnail_display_urls?.large}
                alt={selection["o:title"]}
            />
        {/if}
        {#each parsedProperties as property}
            {#if property != undefined}
                <h4>{property.property}:</h4>
                <h4><em>{property.title}</em></h4>
            {/if}
        {/each}
    {/if}
</div>

<style>
    .detail {
        flex: 1;
        min-width: 250px;
        padding: 8px;
        overflow: scroll;
    }

    img {
        width: 100%;
    }
</style>
