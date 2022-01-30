var grid;
var tempgrid;
var gridSize = 16;
var finished;
var timerGo = false;

function generateGrid() {
    finished = false;
    //generate random 2d array
    grid = [];
    for (var i = 0; i < gridSize; i++) {
        let line = [];
        for (var j = 0; j < gridSize; j++) {
            //can rewrite so make a set number of mines
            let element = Math.floor(Math.random() * 1.185);//1.185185185185...
            if (element == 1) {
                element = -1;
            }
            line.push(element);
        }
        grid.push(line);
    }

    //calculate values
    for (var i = 0; i < gridSize; i++) {
        for (var j = 0; j < gridSize; j++) {
            totalMines = 0;
            if (grid[i][j] != -1) {
                if (i != 0) {
                    if (grid[i-1][j]==-1) {totalMines++}
                    if (j != 0) {
                        if (grid[i-1][j-1]==-1) {totalMines++}
                    }
                    if (j != gridSize-1) {
                        if (grid[i-1][j+1]==-1) {totalMines++}
                    }
                }
                if (i != gridSize-1) {
                    if (grid[i+1][j]==-1) {totalMines++}
                    if (j != 0) {
                        if (grid[i+1][j-1]==-1) {totalMines++}
                    }
                    if (j != gridSize-1) {
                        if (grid[i+1][j+1]==-1) {totalMines++}
                    }
                }
                if (j != 0) {
                    if (grid[i][j-1]==-1) {totalMines++}
                }
                if (j != gridSize-1) {
                    if (grid[i][j+1]==-1) {totalMines++}
                }
                grid[i][j] = totalMines;
            }
        }
    }

    var old_lines = document.getElementsByClassName('line');
    if (old_lines != null) {
        //traverse list backwords so as they are removed none are missed
        for (var i = old_lines.length - 1; i >= 0; i--) {
            old_lines[i].remove();
        }
    }
    resetTempGrid();

    //create html elemtns to play game
    var container = document.createElement('div');
    container.className = 'container';
    for (var i = 0; i < gridSize; i++) {
        var line = document.createElement('div');
        line.className = 'line';
        line.id = i;
        for (var j = 0; j < gridSize; j++) {
            var cell = document.createElement('div');
            cell.row = i;
            cell.column = j;
            cell.mine = grid[i][j];
            if (grid[i][j] == -1) {
                cell.setAttribute('name','mine');
            }
            cell.id = i.toString() + '/' + j.toString();
            cell.addEventListener('mousedown', (e) => onMouseDown(e));
            cell.className = 'cell covered';
            if (j == gridSize-1) {
                cell.style.borderRightStyle = 'solid';
                cell.style.borderRightColor = 'grey';
            }
            if (i == gridSize-1) {
                cell.style.borderBottomStyle = 'solid';
                cell.style.borderBottomColor = 'grey';
            }
            
            //number
            if (grid[i][j] != 0) {
                var label = document.createElement('p');
                label.className = 'p';
                let displayText = grid[i][j];
                if (displayText == -1) {
                    displayText = 'M'
                }
                var text = document.createTextNode(displayText);
                label.appendChild(text);
                cell.appendChild(label);
            }

            line.appendChild(cell);
        }
        container.appendChild(line);
        document.body.appendChild(container);
    }
}

function resetTempGrid() {
    tempgrid = grid.map(function(line) {
        return line.slice();
    });
}

async function adjacentZeros(line, index) {
    let cell = document.getElementById(line+'/'+index);
    cell.classList.remove('covered');
    cell.classList.remove('flagged');
    cell.classList.add('uncovered');
    await sleep(50);
    if (cell.mine == 0) {
        cell.mine = -5;
        if (line != 0 ) {
            adjacentZeros(line-1, index);
        }
        if (line != grid.length-1) {
            adjacentZeros(line+1, index);
        }
        if (index != 0) {
            adjacentZeros(line, index-1);
        }
        if (index != grid[line].length-1) {
            adjacentZeros(line, index+1);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }  

async function onMouseDown(event) {
    if (finished) {
        return
    }
    //left click
    if (event.which == 1) {
        if (event.target.classList.contains('covered')) {
            if (event.target.mine == 0) {
                adjacentZeros(event.target.row,event.target.column);
            } else if (event.target.mine == -1) {
                let mines = document.getElementsByName('mine');
                for (const mine of mines) {
                    //lose
                    await sleep(50);
                    mine.classList.remove('covered');
                    mine.classList.add('uncovered-mine');
                    mine.style.color = 'black';
                }
                finished = true;
                return
            } else {
                event.target.classList.remove('covered');
                event.target.classList.add('uncovered');
            }
            if (document.getElementsByClassName('covered').length + document.getElementsByClassName('flagged').length == document.getElementsByName('mine').length) {
                //win
                let mines = document.getElementsByName('mine');
                for (const mine of mines) {
                    mine.classList.remove('covered');
                    mine.classList.add('uncovered-mine');
                }
                finished = true;
            }
        }
    //right click
    } else if (event.which == 3) {
        if (event.target.classList.contains('flagged')) {
            event.target.classList.remove('flagged');
            event.target.classList.add('covered');
        } else if (event.target.classList.contains('covered')) {
            event.target.classList.remove('covered');
            event.target.classList.add('flagged');
        }
    }
}

//Timer functions
function startTimer() {
    timerGo = true;
    start = new Date(); //buggy--
    // start = new Date(2021, 0, 6, 10, 0, 0, 0);
}

function stopTimer() {
    timerGo = false;
}

function resetTimer() {
    nextPrevTime = 0;
    prevTime = 0;
    start = new Date();
}

function enableTimer() {
    now = new Date()
    if (timerGo) {
        timer = now.getTime() - start.getTime()
    }

}

function setup() {
    window.addEventListener("contextmenu", e => e.preventDefault());
    window.setTimeout(enableTimer, 1);
    generateGrid();
}

window.onload = () => setup();