//MAINFRAME EXAMPLE
import quotations from '../script/controllers/quotations.js';
import quantum_scroll from "../script/controllers/quantum_scroll.js";
import flash from '../script/controllers/quantum_flash.js';
import graphSearch from '../script/controllers/graph_search.js';
import quotationGraph from '../script/models/quotation_graph.js';
import homeV from '../script/views/home.js'
import menuV from '../script/views/menu.js'//the bug is here
import home from '../script/models/home.js'
import menu from '../script/models/menu.js'

const MVC = {
    Model: {
        quotationGraph: quotationGraph,
        home : home,
        menu : menu

    },
    View: {
        home : homeV,
        menu : menuV//what's up with the menu?
    },
    Controller: {
        quantumScroll : quantum_scroll,
        quotations : quotations,
        flash: flash,
        search: graphSearch,
    }
};

export default MVC;