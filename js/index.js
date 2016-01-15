function error(message, line) {
	throw new SyntaxError(message, null,
		line === undefined ? undefined : line + 1);
}

function Coordinate(x, y) {
	this.x = x;
	this.y = y;
}

Coordinate.prototype.distance = function(p2) {
	return Math.sqrt( (this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y));
};

Coordinate.prototype.angle_between = function(p2) {
	return Math.atan((p2.y - this.y) / (p2.x - this.x)) * 180 / Math.PI;
};

Coordinate.prototype.middle_point = function(p2) {
	return new Coordinate((this.x + p2.x) / 2, (this.y + p2.y) / 2);
}


function Node(name, id, x, y) {
	this.name = name;
	this.connect = {count: 0};
	this.id = id;
	this.position = new Coordinate(x, y);
	this.edges = {count: 0};
}

Node.prototype.get_name = function() {
	return this.name;
};

Node.prototype.set_connect = function(annother_node_id) {
	this.connect[annother_node_id] = all_nodes[annother_node_id];
	all_nodes[annother_node_id].connect[this.id] = this;
	all_nodes[annother_node_id].connect["count"] = all_nodes[annother_node_id].connect["count"] + 1;
	this.connect["count"] = this.connect["count"] + 1;
};

Node.prototype.set_edges = function(edge) {
	this.edges[edge.id] = edge;
	this.edges["count"] = this.edges["count"] + 1;
	var another_node = edge.node1 === this ? edge.node2 : edge.node1;
	another_node.edges[edge.id] = edge;
	another_node.edges["count"] = another_node.edges["count"] + 1;
}

Node.prototype.is_connect = function() {
	return this.connect["count"] !== 0;
};

Node.prototype.is_connect_by = function(node2_id) {
	return this.connect[node2_id] !== undefined;
}

Node.prototype.initial = function() {
	var self = this;
	$('#drag_area').append("<div class=\"node\" id=\"" + this.id + "\" unselectable=\"on\" onselectstart=\"return false;\">" + this.name + "</div>");
	$( "#" + this.id ).draggable({ 
		containment: "#drag_area", 
		scroll: false,
		drag: Node.prototype.update
	});
	$( "#" + this.id ).css({'top': this.position.y + "px", 'left' : this.position.x + "px"});
	$( "#nodes>table>tbody" ).append("<tr><td scope=\"row\">" + this.id +"</td><td>"+ this.name +"<td><td><button type=\"button\" class=\"btn btn-danger btn-xs\">DELETE</button><td></tr>");
	$( "#" + this.id ).mousedown(function(e) {
		if (e.which == 3) {
			self.highlight();
			self.create_line_to_mouse();
			mouse_event_node1 = self;
		}
	});
	$( "#" + this.id ).mouseup(function(e) {
		if (e.which == 3) {
			if (mouse_event_node1 !== undefined) {
				mouse_event_node2 = self;
				self.highlight();
				$("#get_weight_modal").modal();
			}
		}
	});
};

Node.prototype.create_line_to_mouse = function() {
	var self = this;
	mouse_edge = new Edge("mouse_edge", this, {position: new Coordinate(0, 0)}, -1, 0);
	$("#drag_area").mousemove(function(e) {
      	var offset = $(this).offset();
      	var relativeX = (e.pageX - offset.left);
      	var relativeY = (e.pageY - offset.top);
    	$("#mouse_edge").show();
    	mouse_edge.node2.position.x = relativeX - 20;
    	mouse_edge.node2.position.y = relativeY - 20;
    	mouse_edge.change();
    });
}

Node.prototype.stop_line_to_mouse = function() {
	$("#mouse_edge").hide();
	$("#drag_area").unbind("mousemove");
}

Node.prototype.update = function() {
    all_nodes[this.id].position.x = parseInt($("#" + this.id).css('left'));
    all_nodes[this.id].position.y = parseInt($("#" + this.id).css('top'));
    $("#drag_area").find(".edge").each(function(i){
        	all_edges[$(this).attr("id")].change();
    });
}

Node.prototype.highlight = function() {
	$("#" + this.id).animate({
		backgroundColor: '#54B0E9'
	});
}

Node.prototype.de_highlight = function() {
	$("#" + this.id).animate({
		backgroundColor: "Transparent"
	});
}

function Edge(id, node1, node2, weight, z_index) {
	this.id = id;
	this.node1 = node1;
	this.node2 = node2;
	this.weight = weight;
	this.z_index = z_index;
}

Edge.prototype.move_and_transfer = function(coord, d) {
	$("#" + this.id).css("width", d + "px");
	$("#" + this.id).css("left", coord.x + 20 + "px");
	$("#" + this.id).css("top", coord.y + 20 + "px") ;
	$("#" + this.id).css("z-index", this.z_index + "px") ;
}

Edge.prototype.rotate = function(angle) {
	$("#" + this.id).css("transform", "rotate("+ angle + "deg)");
	$("#" + this.id).css("-ms-transform", "rotate("+ angle + "deg)");
	$("#" + this.id).css("-webkit-transform", "rotate(" + angle + "deg)");
	$("#" + this.id).css("-o-transform", "rotate(" + angle + "deg)");
	$("#" + this.id).css("-moz-transform", "rotate(" + angle + "deg)");
}

Edge.prototype.move_weight_div = function(p) {
	$("#" + this.id + "_w").css("left", p.x);
	$("#" + this.id + "_w").css("top", p.y);
}


Edge.prototype.change = function() {
	var ditance_between = this.node1.position.distance(this.node2.position);
	this.move_and_transfer(this.node1.position, ditance_between);
	
	var angle_b = this.node1.position.angle_between(this.node2.position);
	if (this.node2.position.x < this.node1.position.x) {
		angle_b = angle_b + 180;
	}
	
	this.rotate(angle_b);
	this.move_weight_div(this.node1.position.middle_point(this.node2.position));
};

Edge.prototype.highlight = function() {
	$("#" + this.id).animate({
          backgroundColor: '#3BDE00',
        }, 1000 );
}

Edge.prototype.de_highlight = function() {
	$("#" + this.id).animate({
          backgroundColor: '#FE9136',
        }, 1000 );
}



function add_node() {
	if (initial_alpa > 90 ) {
		error("too_many_nodes");
	}
	
	var new_node = new Node(String.fromCharCode(initial_alpa + 64), "n_" + initial_alpa, initial_x, initial_y);
	all_nodes["n_" + initial_alpa] = new_node;
	all_nodes["count"] = all_nodes["count"] + 1;
	new_node.initial();
	
	initial_alpa = initial_alpa + 1;
	initial_x = initial_x + 30;
	initial_y = initial_y + 10;
}


function create_egde() {
	mouse_event_weight = $("#edge_weight").val();
	if (mouse_event_weight !== "") {
		add_edge(mouse_event_node1, mouse_event_node2, mouse_event_weight);
		
		mouse_edge.node1.stop_line_to_mouse();
		
		mouse_event_node1.de_highlight();
		mouse_event_node2.de_highlight();
		
		mouse_event_node1 = undefined;
		mouse_event_node2 = undefined;
		mouse_event_weight = "";
		$('#get_weight_modal').modal('hide');
	}
}

function deny_create_edge() {
	
	mouse_event_node1.de_highlight();
	mouse_event_node2.de_highlight();
	mouse_edge.node1.stop_line_to_mouse();

	mouse_event_node1 = undefined;
	mouse_event_node2 = undefined;
	mouse_event_weight = "";
}

function add_edge(node1, node2, weight) {
	if (node1 === node2) {
		error("This is simple graph, no self loop");
	}
	if (node1.is_connect_by(node2.id)) {
		error("No parallel edges");
	}
	if (weight === "" || !(/^-?\d+\.?\d*$/.test(weight))) {
		error("Please input the correct weight");
	}

	var new_edge = new Edge("e_" + initial_edge, node1, node2, parseFloat(weight) ,initial_z_index);
	node1.set_connect(node2.id);
	node1.set_edges(new_edge);
	all_edges[new_edge.id] = new_edge;
	all_edges["count"] = all_edges["count"] + 1;
	
	$("#lines").append("<div class=\"edge\" id = \"" + new_edge.id + "\"></div>");
	$("#weights").append("<div class=\"weight\" id = \"" + new_edge.id + "_w\">" + new_edge.weight + "</div>");
	$( "#edges>table>tbody" ).append("<tr><td scope=\"row\">" + new_edge.id +"</td><td>"+ ("(" + new_edge.node1.name + "," + new_edge.node2.name + ")") + ("(" + new_edge.weight + ")") +"<td><td><button type=\"button\" class=\"btn btn-danger btn-xs\">DELETE</button><td></tr>");
	new_edge.change();
	new_edge.node1.update();
	new_edge.node2.update();
	
	initial_edge = initial_edge + 1;
	initial_z_index = initial_z_index + 1;
}


// k_method
function k_method_sort() {
	var all_edges_array = [];
	var k = 0;
	for(var id in all_edges) {
		if (id === "count") {
			continue;
		}
		all_edges_array[k] = all_edges[id];
		k++;
	}
	var t = undefined;
	for(var i = all_edges_array.length; i > 0; i--) {
		for (var j = 0; j < i - 1; j++) {
			if (all_edges_array[j].weight > all_edges_array[j + 1].weight) {
				t = all_edges_array[j];
				all_edges_array[j] = all_edges_array[j + 1];
				all_edges_array[j + 1] = t;
			}
		}
	}
	return all_edges_array;
}

function k_method_pre() {
	var all_edges_array = k_method_sort();

	$("#ordered_edges>tbody").html("");
	for(var i = 0; i < all_edges_array.length; i ++ ) {
		$("#ordered_edges>tbody").append("<tr id = \"o_"+ all_edges_array[i].id +"\"><td scope=\"row\">" + all_edges_array[i].id +"</td><td>"+ ("(" + all_edges_array[i].node1.name + "," + all_edges_array[i].node2.name + ")") + ("  <strong>(" + all_edges_array[i].weight + ")") +"</strong><td></tr>");
		all_edges_array[i].de_highlight();
	}
	$('#k_method').modal();
}

function k_method_main() {
	var ordered_edges = k_method_sort();
	var added_edges = [];
	var i = 0;
	while (added_edges.length < all_nodes["count"] - 1) {
		var try_add = added_edges.slice();
		try_add[try_add.length] = ordered_edges[i];
		if (!check_circuit(try_add, ordered_edges[i].node1)) {
			added_edges[added_edges.length] = ordered_edges[i];
			$("#o_" + ordered_edges[i].id).attr("class", "success");
			ordered_edges[i].highlight();
			i++;

		} else {
			$("#o_" + ordered_edges[i].id).attr("class", "danger");
			i++;
		}
	}
}


function check_circuit(candidate_edges, startpoint) {
	if (candidate_edges.length === 0) {
		return false;
	}
	function travel(point, has_explored_nodes, has_explored_edges) {
		if (has_explored_nodes.indexOf(point) >= 0) {
			return true;
		}

		var can_edges = [];
		for (var c_edge in point.edges) {
			if (c_edge === "count") {
				continue;
			}
			if (has_explored_edges.indexOf(point.edges[c_edge]) >= 0) {
				continue;
			} 
			if (candidate_edges.indexOf(point.edges[c_edge]) >= 0) {
				can_edges[can_edges.length] = point.edges[c_edge];
			}
		}

		if (can_edges.length <= 0) {
			return false;
		} else {

			var indicate = false;
			var new_has_explored_nodes = has_explored_nodes.slice();
			new_has_explored_nodes[new_has_explored_nodes.length] = point;

			for (var i = 0; i < can_edges.length; i++) {
				var new_has_explored_edges = has_explored_edges.slice();
				new_has_explored_edges[new_has_explored_edges.length] = can_edges[i];
				var next_node = can_edges[i].node1 === point ? can_edges[i].node2 : can_edges[i].node1;
				indicate = indicate || travel(next_node, new_has_explored_nodes, new_has_explored_edges);
			}

			return indicate;
		}
	}
	return travel(startpoint, [], []);
}

function p_method() {
	var add_node = [];
	var add_edge = [];

	add_node[add_node.length] = all_nodes["n_1"]; // starting point

	while(add_node.length < all_nodes["count"]) {
		var candidate_edges = [];
		for(var i = 0; i < add_node.length; i++) {
			// get all adjacent edge
			for (var edge in add_node[i].edges) {
				if (edge === "count") { continue; }

				if ((candidate_edges.indexOf(add_node[i].edges[edge]) < 0) && (add_edge.indexOf(add_node[i].edges[edge]) < 0) ) {
					candidate_edges[candidate_edges.length] = add_node[i].edges[edge];
				}
			}
		}
		// find the minimal one
		var edge_with_min_weight = candidate_edges[0];
		for (var k = 1; k < candidate_edges.length; k++) {
			if (edge_with_min_weight.weight > candidate_edges[k].weight) {
				edge_with_min_weight = candidate_edges[k];
			}
		}

		// add to the add_edge
		edge_with_min_weight.highlight();
		add_edge[add_edge.length] = edge_with_min_weight;
		add_node[add_node.length] = (add_node.indexOf(edge_with_min_weight.node1) >= 0) ? edge_with_min_weight.node2 : edge_with_min_weight.node1;
	}
}
