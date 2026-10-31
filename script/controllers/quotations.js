import MVC from '../../lib/MAINFRAME.js';
import TEMPEST from '../../lib/TEMPEST.js';

const unfold = function() {
    refreshNodes();
    $("div.TEMPEST.quotations").empty();
    
    let matchedNodes = [];
    const params = TEMPEST.paramREC();
    const currentPath = params ? params.path : undefined;
    const currentGraph = MVC.Model.quotationGraph.graph;

    if (!currentGraph || !currentGraph.rels) return;

    currentGraph.rels.forEach(function(rel) {
        if (TEMPEST.pageREC() === "quotations" && currentPath && rel.pages && rel.pages.indexOf(currentPath) > -1) {
            var start = rel.start;
            var end = rel.end;
            var node_start = currentGraph.nodes.find(node => node.index === start);
            var node_end = currentGraph.nodes.find(node => node.index === end);
            
            if (node_start && notQuoted(node_start.index)) {                
                pushIndex(node_start.index);
                matchedNodes.push(node_start);
            }
            if (node_end && notQuoted(node_end.index)) {
                pushIndex(node_end.index);
                matchedNodes.push(node_end);
            }
        }
    });

    // Helper to count edges for sorting
    function getNodeEdgeCount(nodeIndex) {
        let count = 0;
        currentGraph.rels.forEach(function(rel) {
            if (rel.start === nodeIndex || rel.end === nodeIndex) {
                count++;
            }
        });
        return count;
    }

    // Sort by QRNG value first, then fallback to edge count descending
    matchedNodes.sort(function(a, b) {
        let qrngA = a.qrng !== undefined ? a.qrng : 0;
        let qrngB = b.qrng !== undefined ? b.qrng : 0;

        let edgesA = getNodeEdgeCount(a.index);
        let edgesB = getNodeEdgeCount(b.index);

        if (qrngA !== qrngB) {
            return qrngA - qrngB;
        } else {
            return edgesB - edgesA;
        }
    });

    matchedNodes.forEach(function(node) {
        implementQuotation(node, "div.TEMPEST.quotations");
    });

    $("div.TEMPEST").scrollTop();
};

let nodeIndexes = [];
let nodes = [];

function pushIndex(index) {
    nodeIndexes.push(index);
}

function refreshNodes() {
    nodeIndexes = [];
    nodes = [];
}

function notQuoted(index) {
    return nodeIndexes.indexOf(index) === -1;
}

const implementQuotation = function(node, container) {
    var div = document.createElement("div");
    $(div).addClass("quotation_div");
    
    var p = document.createElement("p");
    $(p).addClass("quotation").html(node.quotation);
    
    const a = document.createElement("a");
    $(a).attr("href", `#home?index=${node.index}`);
    

    var src = document.createElement("p");
    $(src).addClass("src").text(" -- " + node.src + (node.ai ? " [AI]" : ""));
    $(a).append(src);
    $(div).append(p).append(a);
    
    // Fixed container selector matching the rest of the file
    $(container).append(div);
}

export default { unfold, implementQuotation };