<script>
    import { onMount, onDestroy } from "svelte";
    import { graphData, visibleLinks, allLinks } from "../stores";
    import * as d3 from "d3";

    let width = 0;
    let height = 0;
    let transform = d3.zoomIdentity;
    let svg, links, nodes, simulation;

    $: {
        links = $graphData.links.map((d) => Object.create(d));
        nodes = $graphData.nodes.map((d) => Object.create(d));
        runSimulation();
    }

    onMount(() => {
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
            .on("tick", simulationUpdate);
    }

    $: d3.select(svg).call(
        d3
            .zoom()
            .scaleExtent([1 / 2, 1])
            .on("zoom", zoomed)
    );

    function simulationUpdate() {
        nodes = [...nodes];
        links = [...links];
    }

    function zoomed(currentEvent) {
        transform = currentEvent.transform;
        simulationUpdate();
    }

    function linkArc(d) {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `M${d.source.x},${d.source.y} A${r},${r} 0 0,1 ${d.target.x},${d.target.y}`;
    }
</script>

<div class="graph" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={svg} {width} {height}>
        {#each links as link}
            <g stroke="#f2f2f2" stroke-width="2" fill="none">
                <path
                    d={linkArc(link)}
                    data-attr={link.source.id}
                    transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
                />
            </g>
        {/each}

        {#each nodes as node}
            <g
                transform="translate({transform.x} {transform.y}) scale({transform.k} {transform.k})"
                class="label"
                data-attr={node.id}
                color={$visibleLinks.includes(node.id) ? "blue" : $allLinks.includes(node.id) ? "black":" #919191"}
            >
                <foreignObject
                    requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility"
                    width="350"
                    height="150"
                    x={node.x}
                    y={node.y}
                    ><div>
                        {node.title}
                    </div>
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

    .graph:active {
        cursor: grabbing;
        cursor: -moz-grabbing;
        cursor: -webkit-grabbing;
    }
</style>
