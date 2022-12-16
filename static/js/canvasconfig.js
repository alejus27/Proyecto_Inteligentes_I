
//*---- Variables y constantes ----*/
// variables de Canvas
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');
var endnodes = [];
// Inicializador
const NODERADIUS = 30;
var startletter = 65;
var connection = {
    connections: [],
    get_index: function (node_repr) {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].repr === node_repr) return i;
        }
        return -1;
    }
};
var search_results; // almacena los datos devueltos

//variables de objeto
var right_click_tracker = {
    events: [],
    connection: []
};

// llamada principal
window.onload = function () {
    main();

}

/*---- Función principal: ejecutada en la inicialización ----*/
function main() {
    let canvas_height = canvas.height;
    let canvas_width = canvas.width;
    //Choices
    /*
    1. #E6E6FA Light move
    */
    //draw canvas
    draw_rect(0, 0, canvas_width, canvas_height, fill_color = "#E6E6FA");

    // Event Listeners
     //--evento dibujar nodo
    canvas.addEventListener('click', (e) => draw_node(e));
    //--evento dibujar arista
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        draw_edge(e);
    });
    //--añade valor al evento de arista
    document.getElementById('submit')
        .addEventListener('click', (e) => add_weight(e));
    //--añade heurística al evento de nodo
    document.getElementById('submit_heuristic')
        .addEventListener('click', (e) => add_heuristic(e));
    //-- añade nodo final
    document.getElementById('addendnode')
        .addEventListener('click',(e)=>add_to_endnodes());
    //--botón enviar (iniciar búsqueda)
    document.getElementById('submit_search')
        .addEventListener('click', (e) => call_and_search(e));
    //--botones de animación
    document.getElementById('visualizeVisited').addEventListener('click', function(){
        if(search_results!=null) display_visited(search_results);
    });
    document.getElementById('visualizePath').addEventListener('click', function(){
        if(search_results!=null) display_path(search_results);
    });

    document.getElementById('submit_test')
        .addEventListener('click', (e) => test());
    //-

}

// añade a la lista de nodos finales
function add_to_endnodes(){
    let selected = document.getElementById('endnode');
    endn = selected.options[selected.selectedIndex].text;
    if (endn==="End"){
        window.alert("cannot add");
        return
    };
    if (endnodes.find(el=>el==endn)) return;
    endnodes.push(endn);
    console.log(endnodes)
    // visualization of endnodes
    display_endnodes();
} 
/*---- Funciones Goemetricas ----*/
// dibuja rectángulo
function draw_rect(xs, ys, xe, ye, fill_color = 'beige') {
    ctx.beginPath();
    ctx.fillStyle = fill_color;
    ctx.fillRect(xs, ys, xe, ye);
    ctx.stroke();
}

// dibuja círculos
function draw_circle(x, y, r = 5, color = 'green',strokeStyleColor = 'black',borderWidth = 2) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = strokeStyleColor;
    ctx.stroke();
}

/*---- Funciones gráficas ----*/
// dibujar nodedraw_rect(xs,ys,xe,ye, fill_color='beige')
function draw_node(e) {
    let node = {
        repr: null,
        pos: null,
        children_nodes: [],
        weights: [],
        heuristics: -1
    };
    [x, y] = correct_for_canvas(e);
    draw_circle(x, y, NODERADIUS, 'green','black',2);
    ctx.fillStyle = 'white';
    ctx.font = "15px Arial";
    let repr = String.fromCharCode(startletter++);
    ctx.fillText(repr, x - 15 / 4, y + 15 / 4);
    node.repr = repr;
    node.pos = [x, y];
    connection.connections.push(node);
    // añade nodo a la lista de nodos
    let new_option1 = document.createElement("option");
    let new_option2 = document.createElement("option");
    let new_option3 = document.createElement("option");
    new_option1.text = repr;
    new_option2.text = repr;
    new_option3.text = repr;
    document.getElementById('inputState_heuristic').add(new_option1);
    document.getElementById('startnode').add(new_option2);
    document.getElementById('endnode').add(new_option3);
}

// dibujar aristas
function draw_edge(e) {
    res = get_bounds(e);
    if (res.captured) {
        right_click_tracker.events.push(e);
        right_click_tracker.connection.push(res.node)
        if (right_click_tracker.events.length > 1) {
            // configura la estructura de conexiones
            first_idx = connection.get_index(right_click_tracker.connection[0]);
            second_idx = connection.get_index(right_click_tracker.connection[1]);
            connection.connections[first_idx].children_nodes.push(connection.connections[second_idx].repr);
            connection.connections[first_idx].weights.push(0);
            // añade opción a la lista de bordes
            let new_option = document.createElement("option");
            new_option.text = connection.connections[first_idx].repr + ' -> ' + connection.connections[second_idx].repr
            document.getElementById('inputState').add(new_option)
            // configuración de la GUI
            pos = offset(canvas)
            x1 = right_click_tracker.events[0].clientX - pos.left;
            y1 = right_click_tracker.events[0].clientY - pos.top;
            x2 = right_click_tracker.events[1].clientX - pos.left;
            y2 = right_click_tracker.events[1].clientY - pos.top;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            draw_circle(x1, y1, 4, 'blue');
            draw_circle(x2, y2, 4, 'red')
            ctx.fillStyle = 'black';
            ctx.stroke();
            right_click_tracker.events = [];
            right_click_tracker.connection = [];
        }
    }
}

// añade y dibuja el peso
function add_weight(e) {
    if (document.getElementById('weight').value === '') return;
    [from_idx, to_idx] = [0, 5];
    let selected = document.getElementById('inputState');
    selected = selected.options[selected.selectedIndex].text;
    weight_el = document.getElementById('weight');
    let weight = parseInt(weight_el.value);
    let from_node = selected[from_idx];
    let to_node = selected[to_idx];
    //obtener el idx del nodo origen y destino
    let from_node_idx = connection.get_index(from_node);
    let to_node_idx = connection.get_index(to_node);
    from_node = connection.connections[from_node_idx];
    to_node = connection.connections[to_node_idx];
    //edita el peso en el nodo
    from_node.weights[from_node.children_nodes.indexOf(to_node.repr)] = weight;
    //dibuja el peso en la arista
    //obtiene la posición de from_node y to_node
    let [pos_from, pos_to] = [from_node.pos, to_node.pos];
    let midpoint = [(pos_from[0] + pos_to[0]) / 2, (pos_from[1] + pos_to[1]) / 2];
    //coloca el peso en el medio
    ctx.beginPath()
    ctx.fillStyle = 'black';
    ctx.fillText(weight, midpoint[0] + 2, midpoint[1] - 2);
    //restablece el campo de entrada a vacío
    weight_el.value = '';
}

function add_heuristic(e) {
    // añade heuristicas
    if (document.getElementById('Heuristic').value === '') return;
    let selected = document.getElementById('inputState_heuristic');
    selected = selected.options[selected.selectedIndex].text;
    let heuristic_el = document.getElementById('Heuristic');
    let heuristic = parseInt(heuristic_el.value);
    let node = connection.connections[connection.get_index(selected)];
    node.heuristics = heuristic;
    // dibuja encima del nodo
    let [x, y] = node.pos;
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillText('h = ' + heuristic, x - 0.5 * NODERADIUS, y - NODERADIUS - 1);
    heuristic_el.value = '';
}

/*---- Funciones auxiliares ----*/
// devuelve un objeto con el desplazamiento del elemento pasado 
// desde la parte superior izquierda de la pantalla
function offset(el) {
    var rect = el.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
}

// devuelve las coordenadas corregidas con respecto al lienzo
function correct_for_canvas(e) {
    let pos = offset(canvas)
    let x = e.clientX - pos.left;
    let y = e.clientY - pos.top;
    return [x, y];
}

// comprueba si el evento pulsado se encuentra dentro de los límites de los nodos
function get_bounds(e) {
    let [x, y] = correct_for_canvas(e);
    for (let node of connection.connections) {
        [x_compare1, y_compare1] = [node.pos[0] - NODERADIUS, node.pos[1] - NODERADIUS];
        [x_compare2, y_compare2] = [node.pos[0] + NODERADIUS, node.pos[1] + NODERADIUS];
        if (x_compare1 <= x && x_compare2 >= x) {
            if (y_compare1 <= y && y_compare2 >= y) {
                return {
                    captured: true,
                    node: node.repr
                };
            }
        }
    }
    return {
        captured: false,
        node: null
    };
}

//envia y hace una llamada ajax al backend con la variable 'connection'
function call_and_search(e) {
    //retrieve the values of the start and end nodes
    let start = document.getElementById('startnode');
    start = start.options[start.selectedIndex].text;
    let method = document.getElementById('inputState_algorithm');
    method = method.options[method.selectedIndex].text;
    connection.start = start;
    connection.goal = endnodes;
    connection.method = method;

    if(start=="Start" || endnodes.length<1){
        window.alert("No se han establecido nodos de inicio/final");
        return;
    }
    
    // obtiene la información sobre cómo llegar
    let is_undirected = document.getElementById('directed').checked==true;

    // llamada ajax al backend
    let tosend = {
        start: connection.start,
        goal: connection.goal,
        method: connection.method,
        connections: connection.connections,
        is_undirected: is_undirected
    };
    // llamada ajax
    fetch('/process', {
        method: 'POST',
        body: JSON.stringify({
            'structure': JSON.stringify(tosend)
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res=>res.json())
    .then((data)=>{
        if(data.path==null){
            window.alert("Camino no encontrado")
            search_results = null;
            document.getElementById('path').textContent = '';
            return;
        }
        get_path(data);
        search_results = Object.create(data);
    })
}


// muestra la ruta devuelta
function get_path(data){
    start_ascii = 65;
    let p_el = document.getElementById('path');
    let text = '';
    for(let i = 0; i<data.path.length-1; i++){
        text+=String.fromCharCode(start_ascii+data.path[i]);
        text+='->';
    }
    text += String.fromCharCode(start_ascii+data.path[data.path.length-1]);
    text += ' Coste: ' + String(data.cost)

    p_el.textContent = text;
}

// resetea todos los nodos
function reset_nodes(){
    for (let i = 0; i < connection.connections.length; i++) {
        let pos = connection.connections[i].pos;
        let repr = connection.connections[i].repr;
        draw_circle(pos[0], pos[1], NODERADIUS, 'green', 'black', 2.5);
        ctx.fillStyle = 'white';
        ctx.font = "15px Arial";
        ctx.fillText(repr, pos[0] - 15 / 4, pos[1] + 15 / 4);
        ctx.stroke()
    }
}

function display_endnodes(){
    for(let endn of endnodes){
        end_idx = connection.get_index(endn);
        node = connection.connections[end_idx];
        pos = node.pos;
        repr = node.repr;
        draw_circle(pos[0], pos[1], NODERADIUS, 'yellow', 'black', '2');
        ctx.fillStyle = 'black';
        ctx.font = "15px Arial";
        ctx.fillText(repr, pos[0] - 15 / 4, pos[1] + 15 / 4);
        ctx.stroke()
    }
}

// rodea los nodos de la ruta con un círculo naranja
function display_path(data){
    start_ascii = 65;
    //reset colors
    reset_nodes();
    display_endnodes();
    // initialize with new colors
    for(let i=0;i<data.path.length;i++){
        let pos = connection.connections[connection.get_index(String.fromCharCode(start_ascii+data.path[i]))].pos;
        setTimeout(()=>{
            draw_circle(pos[0], pos[1], NODERADIUS, "rgba(255, 255, 255, 0.1)",'red','4')
        }
        ,250*i);
    }
}

// rodea los nodos de la ruta con un círculo naranja
function display_visited(data){
    start_ascii = 65;
    //reset colors
    reset_nodes();
    display_endnodes();
    // initialize with new colors
    for(let i=0;i<data.visited.length;i++){
        let pos = connection.connections[connection.get_index(String.fromCharCode(start_ascii+data.visited[i]))].pos;
        let repr = connection.connections[connection.get_index(String.fromCharCode(start_ascii+data.visited[i]))].pos
        setTimeout(()=>{
            draw_circle(pos[0], pos[1], NODERADIUS, "rgba(255, 255, 255, 0.1)",'blue','4')
        }
            , 1000 * i);
    }
}

function test(){

    window.alert("Test");
}