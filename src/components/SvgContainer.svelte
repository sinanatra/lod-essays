<script>
    import { onMount, onDestroy } from "svelte";
    import { graphData, visibleLinks, allLinks, selectedNode } from "../stores";
    import { observe } from "../functions.js";
    import * as d3 from "d3";

    let width = 0;
    let height = 0;
    let transform = d3.zoomIdentity;
    let svg, links, nodes, simulation;

    const zoom = d3
        .zoom()
        .scaleExtent([1 / 8, 1 / 1])
        .on("zoom", zoomed);

    $: d3.select(svg).call(zoom);

    $: {
        links = [
            ...$graphData.links.map((d) => Object.assign(d, { class: "link" })),
        ];
        nodes = [
            ...$graphData.nodes.map((d) => Object.assign(d, { class: "node" })),
        ];
        runSimulation();
    }

    $: {
        if ($visibleLinks.length > 0) {
            zoomToNode($visibleLinks[0]);
        }
    }

    $: {
        if ($selectedNode.length > 0) {
            zoomToNode($selectedNode);
        }
    }

    onMount(() => {
        // observe();
        runSimulation();
    });

    onDestroy(() => {
        simulation.stop();
    });

    function runSimulation() {
        simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => d.id)
                    .strength(0.01)
            )
            // .force("charge", d3.forceManyBody(50))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(150))
            // .force("x", d3.forceX().strength(1))
            .on("tick", simulationUpdate);
        observe();
    }

    function zoomToNode(item) {
        if (nodes.length > 0) {
            const nodeToZoom = nodes.find((node) => node.id === item);
            if (nodeToZoom) {
                const zoomTransform = d3.zoomIdentity
                    .scale(0.8)
                    .translate(
                        width / 4 - nodeToZoom.x,
                        height / 6 - nodeToZoom.y
                    );

                d3.select(svg)
                    .transition()
                    .duration(500)
                    .call(zoom.transform, zoomTransform);

                simulationUpdate();
            }
            highlightLinks(nodeToZoom);
        }
    }

    function zoomed(currentEvent) {
        transform = currentEvent.transform;
        simulationUpdate();
    }

    function simulationUpdate() {
        nodes = [...nodes];
        links = [...links];
    }

    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `M${d.source.x},${d.source.y} A${r},${r} 0 0,1 ${d.target.x},${d.target.y}`;
    }

    function highlightLinks(node) {
        // "z-index" on the selected links
        if (node) {
            $selectedNode = node;
            links = links.sort((a, b) => {
                if (
                    a.source.id === node.id ||
                    a.target.id === node.id ||
                    b.source.id === node.id ||
                    b.target.id === node.id
                ) {
                    return 1;
                }
                return -1;
            });
            links.forEach((link) => {
                if (link.source.id === node.id || link.target.id === node.id) {
                    link.class = "link-highlite";
                } else {
                    link.class = "link";
                }
            });
            simulationUpdate();
        }
    }
</script>

<div class="graph" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={svg} {width} {height}>
        {#each links as link}
            <g class={link.class} stroke-width="1" fill="none">
                <path
                    d={linkArc(link)}
                    data-attr={link.source.id}
                    transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
                />
            </g>
        {/each}
        {#each nodes as node}
            <g
                class={$selectedNode.id == node.id
                    ? "label selection"
                    : $visibleLinks.includes(node.id)
                    ? "label node-highlite"
                    : $allLinks.includes(node.id)
                    ? "label node"
                    : "label link"}
                on:dblclick={highlightLinks(node)}
                on:click={() => highlightLinks(node)}
                on:keydown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        highlightLinks(node);
                    }
                }}
                transform="translate({transform.x}
                {transform.y - 5}) scale({transform.k}
                {transform.k})"
                data-attr={node.id}
            >
                <foreignObject
                    requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                    width="300"
                    height="150"
                    x={node.x - 2}
                    y={node.y - 2}
                >
                    <div class="title">{node.title}</div>
                </foreignObject>
            </g>
        {/each}
    </svg>
</div>

<style>
    .graph {
        flex: 2;
        user-select: none;
        cursor: move;
        cursor: grab;
        cursor: -moz-grab;
        cursor: -webkit-grab;
    }

    .label {
        cursor: pointer;
    }

    .title {
        padding: 1px;
        width: fit-content;
    }

    .graph:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
    }
</style>
