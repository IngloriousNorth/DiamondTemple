import MVC from '../../lib/MAINFRAME.js';
import TEMPEST from '../../lib/TEMPEST.js';

const unfold = function() {
    const params = TEMPEST.paramREC();
    const query = params && params.q ? decodeURIComponent(params.q).trim() : "";
    const resultsContainer = $('.graph-search');
    resultsContainer.empty();

    const currentGraph = MVC && MVC.Model && MVC.Model.quotationGraph ? MVC.Model.quotationGraph.graph : null;
    if (!currentGraph || !currentGraph.nodes) {
        return;
    }

    try {
        // Filter nodes matching query regex or fallback to substring search
        let matches = query ? currentGraph.nodes.filter(node => {
            try {
                const regex = new RegExp(query, 'i');
                return regex.test(node.quotation) || regex.test(node.src);
            } catch (err) {
                return (node.quotation && node.quotation.toLowerCase().includes(query.toLowerCase())) ||
                       (node.src && node.src.toLowerCase().includes(query.toLowerCase()));
            }
        }) : currentGraph.nodes;

        // --- JS RANDOM FALLBACK ---
        let isRandomFallback = false;
        if (matches.length === 0) {
            if (currentGraph.nodes.length > 0) {
                isRandomFallback = true;
                // Pick a random node from the entire graph as a fallback
                const randomIndex = Math.floor(Math.random() * currentGraph.nodes.length);
                matches = [currentGraph.nodes[randomIndex]];
                
                // Optional notice banner explaining the fallback
                resultsContainer.append(`
                    <div style="margin-bottom: 12px; font-style: italic; color: rgba(255, 255, 255, 0.6); font-size: 0.9em;">
                        No matches found for &ldquo;${query}&rdquo;. Showing a random quotation instead:
                    </div>
                `);
            } else {
                resultsContainer.html('<p style="color: #ff6b6b;">No matching quotations found.</p>');
                return;
            }
        }

        // Helper function to safely highlight search terms in gold without breaking HTML tags
        const highlightQuery = (text, q) => {
            if (!q || !text || isRandomFallback) return text;
            try {
                const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                // Negative lookahead ensures we don't match inside HTML tags like <br>
                const regex = new RegExp(`(${escapedQuery})(?![^<>]*>)`, 'gi');
                return text.replace(regex, '<span style="color: blue; font-weight: bold; background-color: rgba(255, 212, 59, 0.15); padding: 0 2px; border-radius: 3px;">$1</span>');
            } catch (e) {
                return text;
            }
        };

        matches.forEach(node => {
            MVC.Controller.quotations.implementQuotation(node, "div.TEMPEST.graph-search")
        });

    } catch (e) {
        console.log(e)
        resultsContainer.html('<p style="color: #ff6b6b;">Invalid regular expression syntax...</p>');
    }
};

// Real-time input binding with clean hiding/routing
$(document).on('input', '#quotationSearchInput', function() {
    const query = $(this).val().trim();
    if (query) {
        $('.graph-search').show();
        TEMPEST.route("#graph-search?q=" + encodeURIComponent(query));
    } else {
        $('.graph-search').empty().hide();
        TEMPEST.route("#home");
    }
});

export default { unfold };