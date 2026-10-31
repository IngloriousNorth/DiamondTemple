import MVC from '../../lib/MAINFRAME.js';
import TEMPEST from '../../lib/TEMPEST.js';

const initialize = function(index = undefined){
    $("button").off("click").on('click', function() {
        const currentText = $('#myriad').text().trim();
        let startNodeKey = null;

        const graph = MVC && MVC.Model && MVC.Model.quotationGraph ? MVC.Model.quotationGraph.graph : null;
        if (currentText && graph && graph.nodes) {
            const matchedNode = graph.nodes.find(n => n.quotation.trim() === currentText);
            if (matchedNode) {
                startNodeKey = matchedNode.index;
            }
        }
        QRNG(startNodeKey);
    });

    var node = MVC.Model.quotationGraph.graph.nodes.find(n => n.index === index);
    if(!node){
        MVC.View.home.initialize();
    }
    else{
        $("#myriad").html(node.quotation);
        $("#myriad_src").html(" -- " + node.src);    
    }
}

const QRNG = function(providedStartKey = null) {
    fetch('https://Selapian--2f58e6388fb311f1b0781607ee4eb77e.web.val.run')
        .then(response => response.json())
        .then(data => {
            const qIndex = parseInt(data.number, 10) || 0;
            const graph = MVC.Model.quotationGraph.graph;

            // 1. Build Adjacency List from graph.rels
            const adj = {};
            graph.nodes.forEach(n => { adj[n.index] = []; });
            graph.rels.forEach(r => {
                if (adj[r.start] && adj[r.end]) {
                    adj[r.start].push(r.end);
                    adj[r.end].push(r.start); // Undirected connection graph
                }
            });

            // 2. Determine starting node: use provided/current quotation key, or fallback to quantum random index
            let startNodeKey = providedStartKey;
            if (!startNodeKey) {
                const startIndex = Math.abs(qIndex) % graph.nodes.length;
                startNodeKey = graph.nodes[startIndex].index;
            }

            // 3. 2-Hop Recommendation Algorithm to build the target array (arr)
            const hop1 = new Set();
            let arr = [];

            // Find 1-hop neighbors
            (adj[startNodeKey] || []).forEach(neighbor => {
                hop1.add(neighbor);
            });

            // Find 2-hop neighbors (friends of friends)
            hop1.forEach(neighborKey => {
                (adj[neighborKey] || []).forEach(secondHopKey => {
                    // Exclude the starting node and direct 1-hop neighbors
                    if (secondHopKey !== startNodeKey && !hop1.has(secondHopKey)) {
                        if (!arr.includes(secondHopKey)) {
                            arr.push(secondHopKey);
                        }
                    }
                });
            });

            // Fallback to 1-hop or all nodes if the 2-hop array is empty
            if (arr.length === 0) {
                arr = Array.from(hop1);
                if (arr.length === 0) {
                    arr = graph.nodes.map(n => n.index);
                }
            }

            // 4. Select node using your array formula: arr[quantumIndex % arr.length]
            const targetKey = arr[Math.abs(qIndex) % arr.length];
            const node = graph.nodes.find(n => n.index === targetKey) || graph.nodes[0];

            if (node) {
                // Smooth flash card fade transition
                TEMPEST.route(`#home?index=${node.index}`)
                $('#myriad').html(node.quotation);
                $('#myriad_src').html(" -- " + node.src);
            }
        })
        .catch(err => {
            const graph = MVC.Model.quotationGraph.graph;
            const fallbackNode = graph.nodes[0];
            $('#myriad').html(fallbackNode.quotation);
            $('#myriad_src').html(fallbackNode.src);
        });
}

export default { initialize };