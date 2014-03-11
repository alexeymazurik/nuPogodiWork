var intervalId;

//находим случайное число
function getRandom(max) {
    return Math.floor(Math.random()*(max));
}


function transpose(a) {
    return Object.keys(a[0]).map(function (c) {
        return a.map(function (r) {
            return r[c];
        });
    });
}

function getRandomRange(min,max) {
    return Math.floor(Math.random()*(max-min) + min);
}

function compareCoordinates(obj1,obj2) {
    return (obj1.x == obj2.x && obj1.y == obj2.y);
}


function makeSpecialGrid(wolf,grid) {

    var specialGrid = [];

    for (var i = 0; i < grid.length; i++) {
        specialGrid[i] = [];
        for (var j = 0; j < grid.length; j++) {
            specialGrid[i].push(Math.max(Math.abs(wolf.getPosition().x-j),Math.abs(wolf.getPosition().y-i)));
        }
    }

    for (i = 0; i < grid.length; i++) {
        for (j = 0; j < grid.length; j++) {
            if (grid[i][j] == 0) specialGrid[i][j] = 0;
        }
    }

    specialGrid[wolf.getPosition().x][wolf.getPosition().y] = 0;

    //console.log(specialGrid);

    return specialGrid;

}



function getQuarter(size,obj) {

    if ( obj.x <= size/2 ) {

        if ( obj.y <= size/2 ) return 1;
        else return 3;

    }

    else if ( obj.x >= size/2 ) {

        if ( obj.y <= size/2 ) return 2;
        else return 4;

    }

}

//конструктор Животного
function Animal(size,steps) {

    this.x = getRandom(size);
    this.y = getRandom(size);

    this.steps = steps;

}




//закидываем в прототип Животного методы
Animal.prototype.getPosition = function() {
    return {
        x: this.x,
        y: this.y
    }
};

//функция конструктор Волка


//наследуем волка от класса Животных
Wolf.prototype = Object.create(Animal.prototype);

function Wolf(size,steps) {
    Animal.apply(this, arguments);

//    this.steps = steps;

//    this.x = getRandomRange(size/2,size);
//    this.y = getRandomRange(size/2,size);
    this.win = false;

}

//расширяем свойства
Wolf.prototype.run = function(grid,rabbit) {



    var graph = new Graph(grid);


    //console.log('WOLF : ' + graph);

    //console.log(graph.nodes);

    var start = graph.nodes[this.x][this.y];
    var end = graph.nodes[rabbit.getPosition().x][rabbit.getPosition().y];

    var result = astar.search(graph.nodes,start,end);

    //console.log('WOLF RESULT : ' + result);


    if (this.steps >= result.length) {


        this.x = result[result.length-2].x;
        this.y = result[result.length-2].y;

    }

    else {

        this.x = result[this.steps-1].x;
        this.y = result[this.steps-1].y;

    }

    if (this.y == rabbit.y) {
        (this.x == (rabbit.x + 1) || this.x == (rabbit.x -1) ) ? this.win = true : this.win = false;

    }

    else if (this.x == rabbit.x) {
        (this.y == (rabbit.y + 1) || this.y == (rabbit.y -1) ) ? this.win = true : this.win = false;
    }



};

Rabbit.prototype = Object.create(Animal.prototype);

//функция конструктор Зайца
function Rabbit(size,steps) {
    Animal.apply(this, arguments);

//    this.steps = steps;
//
//    this.x = getRandomRange(0,size/2);
//    this.y = getRandomRange(0,size/2);


}

//наследуем волка от класса Животных


//расширяем свойства
Rabbit.prototype.run = function(grid,size,wolf) {


    //console.log(grid);

    var graph = new Graph(grid);

    //console.log('RABBIT : ' + graph);

    var start = graph.nodes[this.x][this.y];

    var specialGrid = makeSpecialGrid(wolf,grid);

    var max = {
        value: specialGrid[0][0],
        x: 0,
        y: 0
    }

    for (var i = 0; i < specialGrid.length; i++) {
        for (var j = 0; j < specialGrid.length; j++) {
           if (specialGrid[i][j] > max.value) {
               max.value = specialGrid[i][j];
               max.x = i;
               max.y = j;
           }
        }
    }

    var end = graph.nodes[max.x][max.y];

    var result = astar.search(graph.nodes,start,end);

    var rows = $('table tr');

    var cells = [];

    for(var i = 0; i < rows.length; i++) {
        cells.push(rows[i].getElementsByTagName('td'));
    }


    //alert(cells.length);
    //var size = cells.length;
//    console.log('RABBIT : ' + this.getPosition().x + '  ' + this.getPosition().y);
//    console.log(this.getPosition());
//    console.log(this);

    for (i = 0; i < result.length; i++) {

        cells[result[i].y][result[i].x].className = 'red';
        //console.log(result[i].x + '    ' + result[i].y);

    }

    //console.log( 'RABBIT RESULT : ' +  result);

    if (this.steps <= result.length) {
        this.x = result[this.steps-1].x;
        this.y = result[this.steps-1].y;
    }

    else {
        this.x = result[result.length-1].x;
        this.y = result[result.length-1].y;
    }






};


function Plant(size,wolf,rabbit) {

    do {

        this.x = getRandom(size);
        this.y = getRandom(size);

    }
    while (compareCoordinates({
        x: this.x,
        y: this.y
    },rabbit.getPosition()) || compareCoordinates({
        x: this.x,
        y: this.y
    },wolf.getPosition()));

}

Plant.prototype.getPos = function() {
    return {
        x: this.x,
        y: this.y
    }
};

Tree.prototype = Object.create(Plant.prototype);

function Tree(size,wolf,rabbit) {
    Plant.apply(this,arguments);

}

Bush.prototype = Object.create(Plant.prototype);

function Bush(size,wolf,rabbit) {
    Plant.apply(this,arguments);
}


function GameController(size, numTrees, timeTrees, numBushes, timeBushes, stepsRabbit, stepsWolf, timeOfStep) {

    var time = timeOfStep;
    var grid = [];

    var trees = [];
    var bushes = [];

    this.wolf = new Wolf(size,stepsWolf);
    this.rabbit = new Rabbit(size,stepsRabbit);

    console.log(this.rabbit);
    console.log(this.wolf);

    //устанавливаем сетку
    this.setGrid = function() {
        for (var i = 0; i < size; i++) {
            grid[i] = [];
            for(var j = 0; j < size; j++) {
                grid[i].push(1);
            }
        }
    };

    //садим деревья
    this.setTrees = function() {

        trees = [];

        for (var i = 0; i < numTrees; i++) {
            var tree = new Tree(size,this.wolf,this.rabbit);
            grid[tree.getPos().y][tree.getPos().x] = 0;

            trees.push(tree);
        }

    }
    //садим кусты
    this.setBushes = function() {

        bushes = [];


        for (var j = 0; j < numBushes; j++) {
            var bush = new Bush(size,this.wolf,this.rabbit);
            grid[bush.getPos().y][bush.getPos().x] = 0;
            bushes.push(bush);
        }

    }




    //животные делают ход
    this.makeStep = function() {

        this.rabbit.run(grid,size,this.wolf);
        this.wolf.run(grid,this.rabbit);

        //console.log('Wolf:' + this.wolf.getPosition().x + ' ' + this.wolf.getPosition().y);
        //console.log('Rabbit:' + this.rabbit.getPosition().x + ' ' + this.rabbit.getPosition().y);



    }




    this.init = function() {

        var counterTree = 0;
        var counterBush = 0;

        var self = this;
        self.setGrid();





        clearInterval(intervalId);
        intervalId = setInterval(function() {


            if ( self.wolf.win ) {

                alert('Wolf win!');

                clearInterval(intervalId);

                return;
            }

            self.setGrid();

            if (counterTree == (timeTrees-1)) {
                counterTree = 0;
            } else if (counterTree == 0) {
                self.setTrees();
                counterTree++;

            } else counterTree++;


            if (counterBush == (timeBushes-1)) {
                counterBush = 0;
            } else if (counterBush == 0) {
                self.setBushes();
                counterBush++;
            } else counterBush++;


//            console.log(grid);
//
//            console.log(transpose(grid));

            self.makeStep();

            //console.log('GRID: ' + grid);

            clearInterval(intervalId);

            engine(self.wolf,self.rabbit,bushes,trees);

        }, time);
    }



}


function drawGrid(size) {


    if (document.querySelector('table')){
        document.querySelector('table').parentNode.removeChild(document.querySelector('table'));
    }

    var table = document.createElement('table');
    var tbody = document.createElement('tbody');


    table.style.width = $('#rightCol').width() + 'px';
    table.style.height = $('#rightCol').width() + 'px';
    table.style.border = '1px solid black';

    for (var i = 0; i < size; i++) {

        var row = document.createElement('tr');

        for (var j = 0; j < size; j++) {
            var cell = document.createElement('td');
            cell.style.border = '1px solid black';
            row.appendChild(cell);
        }

        tbody.appendChild(row);
    }

    table.appendChild(tbody);


    document.getElementById('rightCol').appendChild(table);
}



function engine(wolf,rabbit,bushes,trees) {

    var rows = $('table tr');

    var cells = [];

    for(var i = 0; i < rows.length; i++) {
        cells.push(rows[i].getElementsByTagName('td'));
    }

    var size = cells.length;

    for (i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            cells[j][i].className = ' ';
        }
    }


    for (var i = 0; i < size; i++) {
        cells[0][i].innerHTML = i;
    }

    for (var i = 0; i < size; i++) {
        cells[i][0].innerHTML = i;
    }

   //for (var i = 0; )


    //alert('WOLF : ' + wolf.getPosition().x + '  ' + wolf.getPosition().y);
    cells[wolf.getPosition().y][wolf.getPosition().x].className = 'wolf';


    //alert('RABBIT : ' + rabbit.getPosition().x + '   ' + rabbit.getPosition().y);
    cells[rabbit.getPosition().y][rabbit.getPosition().x].className = 'rabbit';

    for (i = 0; i < bushes.length; i++) {
        cells[bushes[i].getPos().y][bushes[i].getPos().x].className = 'bush';
    }

    for (i = 0; i < trees.length; i++) {
        cells[trees[i].getPos().y][trees[i].getPos().x].className = 'tree';
    }



}




$(document).ready( function() {



    var form = $('form');


    form.validate({
        rules: {
            size: {
                required: true,
                range:[10,100]
            },
            numTrees: {
                required: true,
                range: [1,200]
            },
            timeTrees: {
                required: true,
                range:[1,200]
            },
            numBushes: {
                required: true,
                range:[1,200]
            },
            timeBushes: {
                required: true,
                range:[1,200]
            },
            stepsRabbit: {
                required: true,
                range: [1,10]
            },
            stepsWolf: {
                required: true,
                range: [1,10]
            },
            time: {
                required:true,
                range: [100,100000]
            }
        }
    });

        form.submit(function(event) {


            event.preventDefault();

            var size = $('#size').val();

            drawGrid(size);

            var game = new GameController(size, $('#numTrees').val(), $('#timeTrees').val(), $('#numBushes').val(),
                $('#timeBushes').val(), $('#stepsRabbit').val(),$('#stepsWolf').val(),$('#time').val());

            game.init();



   });


});