import { Api } from "./config.js";
import { visibleLinks, allLinks } from "./stores";

export async function fetchFile(url) {
    const response = await fetch(url);
    const content = await response.text();
    return content;
}

export async function extractLinks(markdown) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    while ((match = regex.exec(markdown))) {
        // ignore normal links
        if (match[2].includes("http")) {
            continue
        }
        else {
            const url = match[2].includes(Api)
                ? match[2]
                : `${Api}/resources/${match[2]}`;
            const response = await fetch(url);
            const json = await response.json();
            links.push({
                label: match[1],
                url: url,
                data: json,
            });
        }

    }
    return links;
}

export function createTriplets(data) {
    let allTriplets = [];
    // Open all links and create a new object with the triples generated
    for (let i = 0; i < data.items.length; i++) {
        let jsonLD = data.items[i].data;
        let triplets = parseJSONLD(jsonLD);
        allTriplets = [...allTriplets, ...triplets];
    }

    // Create the nodes and links as d3 likes
    return {
        nodes: allTriplets.reduce((acc, curr) => {
            if (!acc.find((n) => n.id === curr.source)) {
                acc.push({ id: curr.source, title: curr.title });
            }
            if (!acc.find((n) => n.id === curr.target)) {
                acc.push({ id: curr.target, title: curr.title });
            }
            return acc;
        }, []),
        links: allTriplets,
    }
}

export function parseJSONLD(jsonLD) {
    var triplets = [];
    var source = jsonLD["@id"].replace("/items/", "/resources/");
    var parseRecursive = function (obj) {
        for (var key in obj) {
            if (key === "@id" && obj[key].startsWith(Api) && (obj["o:title"] || obj.display_title)) {
                var target = obj[key].replace("/items/", "/resources/");
                var title = obj["o:title"] || obj.display_title;
                triplets.push({
                    source: source,
                    target: target,
                    title: title
                });
            } else if (typeof obj[key] === "object") {
                parseRecursive(obj[key]);
            }
        }
    };
    parseRecursive(jsonLD);
    return triplets;
}

export function observe() {
    let visible = new Set();
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            const newItem = entry.target.getAttribute("data-id");
            // Update the allLinks array to include the new item if it doesn't already exist
            allLinks.update((items) => {
                if (!items.includes(newItem)) {
                    items.push(newItem);
                }
                return items;
            });
            // If the current entry is intersecting with the viewport, add it to the visible set
            if (entry.isIntersecting) {
                visible.add(newItem);
                // If the current entry is not intersecting with the viewport, remove it from the visible set
            } else {
                visible.delete(newItem);
            }
        });
        visibleLinks.set([...visible]);
    });

    const links = document.querySelectorAll(".markdown a[data-id]");
    links.forEach((link) => observer.observe(link));
}
