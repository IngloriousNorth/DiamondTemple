import MVC from '../../lib/MAINFRAME.js';
import TEMPEST from '../../lib/TEMPEST.js';

let matchedNodes = [];
let currentIndex = 0;
const PAGE_SIZE = 10;
let isLoading = false;
let qrngSeed = 0;

const unfold = async function() {
    refreshNodes();
    const container = $("div.TEMPEST.home");
    container.empty();
    
    currentIndex = 0;
    matchedNodes = [];
    isLoading = false;

    const currentGraph = MVC && MVC.Model && MVC.Model.quotationGraph ? MVC.Model.quotationGraph.graph : null;
    if (!currentGraph || !currentGraph.nodes || !currentGraph.rels) return;

    // 1. Safely determine active menu / page overlap constraints from route parameters
    const params = TEMPEST.paramREC?.() || {};
    const currentPath = params.path ? params.path : undefined;
    const currentPage = TEMPEST.pageREC?.() || "";

    // Collect valid node indexes constrained by page overlap (menu filter)
    const allowedNodeIndexes = new Set();
    currentGraph.rels.forEach(function(rel) {
        const matchesPage = currentPath && rel.pages && rel.pages.indexOf(currentPath) > -1;
        const matchesGeneralPage = !currentPath && rel.pages && rel.pages.indexOf(currentPage) > -1;
        
        if (matchesPage || matchesGeneralPage || !rel.pages) {
            allowedNodeIndexes.add(rel.start);
            allowedNodeIndexes.add(rel.end);
        }
    });

    // 2. Build Adjacency List from graph.rels (Edge Connections)
    const adj = {};
    currentGraph.nodes.forEach(n => { 
        if (allowedNodeIndexes.size === 0 || allowedNodeIndexes.has(n.index)) {
            adj[n.index] = []; 
        }
    });

    currentGraph.rels.forEach(r => {
        if (adj[r.start] && adj[r.end]) {
            adj[r.start].push(r.end);
            adj[r.end].push(r.start); // Undirected connection graph
        }
    });

    // 3. Fetch Single Quantum Seed from Val Town proxy with ?length=1 (with local Math.random fallback)
    try {
        const response = await fetch('https://Selapian--2f58e6388fb311f1b0781607ee4eb77e.web.val.run?length=1');
        const data = await response.json();
        qrngSeed = parseInt(data.number, 10) || 0;
    } catch (err) {
        console.warn("[QRNG Proxy] Failed, falling back to local Math.random() entropy:", err);
        qrngSeed = Math.floor(Math.random() * 100000);
    }

    const validNodeKeys = Object.keys(adj);
    if (validNodeKeys.length === 0) {
        matchedNodes = [...currentGraph.nodes];
    } else {
        // 4. Build non-deterministic sorted/filtered list of nodes using 2-hop neighbor grouping and arr[QRNG % arr.length] logic
        const visited = new Set();
        let startNodeKey = validNodeKeys[Math.abs(qrngSeed) % validNodeKeys.length];

        let queue = [startNodeKey];
        while (matchedNodes.length < currentGraph.nodes.length && queue.length > 0) {
            const currentKey = queue.shift();
            if (visited.has(currentKey)) continue;
            visited.add(currentKey);

            const nodeObj = currentGraph.nodes.find(n => n.index === Number(currentKey) || n.index === currentKey);
            if (nodeObj && !matchedNodes.some(n => n.index === nodeObj.index)) {
                matchedNodes.push(nodeObj);
            }

            // 2-Hop expansion & edge sorting formula
            const hop1 = adj[currentKey] || [];
            let arr = [];
            hop1.forEach(neighbor => {
                (adj[neighbor] || []).forEach(secondHop => {
                    if (secondHop !== currentKey && !visited.has(secondHop) && !arr.includes(secondHop)) {
                        arr.push(secondHop);
                    }
                });
            });

            // Sort 2-hop neighborhood array by edge density (descending)
            arr.sort((keyA, keyB) => (adj[keyB] || []).length - (adj[keyA] || []).length);

            // Apply array formula: arr[QRNG % arr.length] to pick next non-deterministic traversal node
            if (arr.length > 0) {
                const nextKey = arr[Math.abs(qrngSeed + matchedNodes.length) % arr.length];
                if (!visited.has(nextKey)) {
                    queue.push(nextKey);
                }
            }

            // Push remaining valid graph nodes if queue drains
            validNodeKeys.forEach(k => {
                if (!visited.has(k) && !queue.includes(k)) {
                    queue.push(k);
                }
            });
        }
    }

    // Final safety fallback
    if (matchedNodes.length === 0) {
        matchedNodes = [...currentGraph.nodes];
    }

    // Render initial batch
    loadMoreNodes();

    // 5. Setup Infinite Scroll Listener on the scrollable container
    setupInfiniteScroll();
};

function loadMoreNodes() {
    if (isLoading) return;
    if (currentIndex >= matchedNodes.length) return;
    
    isLoading = true;

    const container = $("div.TEMPEST.home");
    const nextBatch = matchedNodes.slice(currentIndex, currentIndex + PAGE_SIZE);

    nextBatch.forEach(function(node) {
        implementHomeQuotation(node, container);
    });

    currentIndex += PAGE_SIZE;
    isLoading = false;
}

function setupInfiniteScroll() {
    const $container = $("div.TEMPEST.home");
    
    // Bind scroll event specifically to the scrollable container
    $container.off("scroll.homeInfinite").on("scroll.homeInfinite", function() {
        const scrollTop = $container.scrollTop();
        const innerHeight = $container.innerHeight();
        const scrollHeight = $container[0].scrollHeight;

        // When user scrolls within 150px of the bottom of the container
        if (scrollTop + innerHeight >= scrollHeight - 150) {
            if (!isLoading && currentIndex < matchedNodes.length) {
                loadMoreNodes();
            }
        }
    });
}

let nodeIndexes = [];
let nodes = [];

function pushIndex(index) {
    nodeIndexes.push(index);
}

function refreshNodes() {
    nodeIndexes = [];
    nodes = [];
}

const implementHomeQuotation = function(node, container) {
    var div = document.createElement("div");
    $(div).addClass("quotation_div");
    
    var p = document.createElement("p");
    $(p).addClass("quotation").html(node.quotation);
    
    const a = document.createElement("a");
    $(a).attr("href", `#home?index=${node.index}`);

    var src = document.createElement("p");
    $(src).addClass("src").text(" -- " + node.src + (node.ai ? " [AI]" : ""));
    $(a).append(src);
    $(div).append(p).append("<br>").append(a);
    
    $(container).append(div);
};

export default { unfold, implementHomeQuotation };