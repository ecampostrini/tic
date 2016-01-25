
var row_number = 3;

/* Utils */
function get_left(pos){
	return pos - 1;
}

function get_right(pos) {
	return pos + 1;
}

function get_top(pos) {
	return pos - row_number;
}

function get_bottom(pos) {
	return pos + row_number;
}

function in_bounds(pos){
	return (pos >= 0 && pos < 9);
}

function next_in_diag(i)
{
	return get_bottom(i) + 1;
}

function next_in_antidiag(i)
{
	return get_bottom(i) - 1;
}

function next_in_row(i)
{
	var result = ((i + 1) % row_number === 0) ? -1 : i + 1;
	
	return result;
}

function debug(text){
	$("#debugDiv").append("<p>" + text + "</p>");
}

function is_above(a,b){
	var row_a = Math.floor(a / 3);
	var row_b = Math.floor(b / 3);

	return (row_a + 1 === row_b);
}

function in_same_row(a,b){
	var row_a = Math.floor(a / 3);
	var row_b = Math.floor(b / 3);
	
	return (row_a === row_b);
}

function get_xy_coord(absolute_pos)
{
	var x = Math.floor( absolute_pos / row_number);
	var y = absolute_pos % row_number;

	//debug("x " + x + ", y: " + y);

	return {x:x, y:y};
}

function score(board)
{
	var result = null;

	if(board.winner === null) result = 0;
	else if (board.winner === 1) result = -10;
	else if (board.winner === -1) result = 10;
	else alert("Tratando de puntuar un juego inconcluso");

	return result;
}
/* ---------------------------- */

/* Cl//ase que representa la inteligencia artificial */

function IA () {
	this.name = "Ex-Machina";
}

/*
 * board: the current board of the game
 * curr_player: the player for whom's perspective we are exploring. 0: human, 1: machine.
 * */
IA.prototype.minimax = function (board)
{
	var best_move = null;
	var best_score = -100;


	for(var pos = 0; pos < board.size; pos++)
	{
		if(board.boxes[pos] != 0) continue;
		
		board.make_move(pos, -1);
		var this_score = this.min(board);
		board.undo_move(pos);

		if(this_score > best_score)
		{
			best_score = this_score;
			best_move = pos;
		}
	}

	return best_move;
}

IA.prototype.max = function (board)
{
	var best_score = -100;
	if(board.free_positions === 0 || Math.abs(board.has_winner()) === 1) return score(board);
	//{
		//debug("c'est fini en max!");
	//}

	for(var pos = 0; pos < board.size; pos++)
	{
		if(board.boxes[pos] != 0) continue;
		var local_best;	

		board.make_move(pos, -1);
		local_best = this.min(board);

		if(local_best > best_score)
			best_score = local_best;
		
		board.undo_move(pos);
	}
	return best_score;
}

IA.prototype.min = function(board)
{
	var worst_score = 100;
	if(board.free_postions === 0 || Math.abs(board.has_winner()) === 1) return score(board);

	for(var pos = 0; pos < board.size; pos++)
	{
		if(board.boxes[pos] != 0) continue;
		var local_worst;	

		board.make_move(pos, 1);
		local_worst = this.max(board);

		if(local_worst < worst_score)
			worst_score = local_worst;
		
		board.undo_move(pos);
	}

	return worst_score;
}

/*---------------------------------------------------*/

/* Clase que representa el tablero */
function Board (size_) {
	this.boxes = new Array();
	this.size = size_;
	this.free_positions = this.size;
	this.winner = null;
	
	for(i = 1; i <= this.size; i++){
		this.boxes.push(0);
	}
}

Board.prototype.check_line = function (init_val, increment_function)
{
	var accum = 0;
	var count = 0;

	for(var i = init_val; count < row_number && in_bounds(i); i = increment_function(i), count++)
	{
		accum += this.boxes[i];
	}

	//return (Math.abs(accum) === row_number);
	return accum;
}

Board.prototype.has_winner = function()
{
	var winner = null;

	/*check diagonal*/
	result = this.check_line(0, next_in_diag);
	if(Math.abs(result) === row_number)
	{
		winner = (result === row_number) ? 1 : -1;
		return winner;
	}
		

	/* check the anti-diagonal*/
	result = this.check_line(row_number - 1, next_in_antidiag);
	if(Math.abs(result) === row_number)
	{
		winner = (result === row_number) ? 1 : -1;
		return winner;
	}


	for(var row = 0; row < row_number; row++)
	{
		result = this.check_line(row * row_number, next_in_row) 
		if(Math.abs(result) === row_number)
		{
			winner = (result === row_number) ? 1 : -1;
			return winner;
		}
	}
	
	for(var col = 0; col < row_number; col++)
	{
		result = this.check_line(col, get_bottom);
		if(Math.abs(result) === row_number)
		{
			winner = (result === row_number) ? 1 : -1;
			return winner;
		}
	}

	return winner;
}

/// 1 == X; -1 == O
Board.prototype.make_move = function (pos, sym)
{
	if(this.boxes[pos] === 0)
	{
		this.boxes[pos] = sym;
		this.free_positions--;
		this.winner = this.has_winner();
	}
}

Board.prototype.undo_move = function(pos)
{
	this.boxes[pos] = 0;
	this.free_positions++;
	this.winner = this.has_winner();

}


Board.prototype.get_size = function () {
	return this.board.size;
}

Board.prototype.is_empty = function (position){
	return (this.free_positions === this.size);
}

/* ----------------------------------- */



/* Inteligencia artificial provisoria */
function silly_move (board){
	var move = -1;
	for(i = 0; i < board.size; i++){
		//if(board.boxes[i].empty){
		if(board.boxes[i] === 0)
		{
			//board[i] = 2;
			return i;
		}
	}
	return move; 
}
/* ------------------------------- */

/* Clase que da cohesion a todos los elementos y controla el 
 * flujo del juego */
function Game () 
{
	this.human = {name : "Esteban", his_turn: true};
	this.machine = {name : "Ex-Machina", his_turn: false};
	this.inteligencia = new IA();
	this.winner = null;
	this.waiting = false;
	this.board = new Board(3*3);
}

/* controls the flow of the game */
Game.prototype.flow_control = function() 
{
	while(this.board.free_positions > 0 && !this.waiting && this.winner === null  )
	{
		if(this.human.his_turn)
		{
			this.register_human_events(this);
			this.waiting = true;
		}
		else
		{//we assume this.machine.his_turn to be true here 
			this.machine_moves();
		}
		debug("waiting " + this.waiting);
	}
	
	if(this.winner !== null){
		debug("El ganador es " + this.winner.name);
		$('.box').unbind("click");
	}
}

Game.prototype.switch_turns = function(){
	if(this.human.his_turn){
		this.human.his_turn = false;
		this.machine.his_turn = true;
	}
	else{
		this.human.his_turn = true;
		this.machine.his_turn = false;
	}
}

Game.prototype.register_human_events = function(actual_round){
	$('.box').unbind("click").click(function(event){
		if(!$(this).hasClass("marked")){
			var winner = null;
			var box_id = $(this).attr('id');
			$("#debugDiv").append("<p style=\"color: red\"> Human move (" + box_id +")</p>");
			actual_round.board.make_move(box_id, 1);
			debug("result " + result);	
			var equis = $('<i>').addClass("fa fa-times fa-5x");
			$(this).addClass("marked");
			$(this).append(equis);
			//if(result)
			winner = actual_round.board.has_winner();
			debug("winner " + winner);
			if(winner != null)
			{
				alert("gano el humano");
				actual_round.winner = this.human;
			}
			else
			{
				actual_round.waiting = false;
				actual_round.switch_turns();	
			}
			actual_round.flow_control();
		}
	});
}

Game.prototype.machine_moves = function () {
	debug("pre machine move");
	var machine_move = this.inteligencia.minimax(this.board);
	//var machine_move = silly_move(this.board);

	$("#debugDiv").append("<p style=\" color: red \"> Machine move (" + machine_move + ")</p>");
	if(machine_move != -1){
		var winner = null;
		var id = "#" + (machine_move);
		var circulo = $("<i>").addClass("fa fa-circle-o fa-5x");
		$(id).append(circulo);
		$(id).addClass("marked");
		//var result = this.board.make_move(machine_move, -1);
		this.board.make_move(machine_move, -1);
		debug("result " + result);
		winner = this.board.has_winner();
		debug("winner " + winner);
		if(winner != null){
			alert("Gano la maquina!");
			this.winner = this.machine;
		}
	}
	this.switch_turns();
}

var main = function(){
	
	$('.box').mouseover(function(){
		$(this).css("background", "red");
	});
	
	$('.box').mouseout(function(){
		$(this).css("background", "silver");
	});
	var game = new Game();
	
	game.flow_control(null);
}

$(document).ready(main);
