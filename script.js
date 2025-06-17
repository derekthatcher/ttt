const scores = { X: 0, O: 0 };
const winningLines3D = [];
let currentPlayer = 'X';
let aiPlayer = false; // if true ai player plays 'O'
const aiPlayCheckbox = document.getElementById('aiPlay');
createWinStates();
// Create 3 grids with labels
const gridContainer = document.getElementById('grids');
const grids = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => Array(3).fill(''))
);
printGrids();

function printGrids() {
    // y is vertical (layers), x is horizontal, z is coming forward
    for (let y = 0; y < 3; y++) {
        const grid = document.createElement('div');
        grid.className = 'grid';
        for (let z = 0; z < 3; z++) {
            for (let x = 0; x < 3; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.z = z;
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.addEventListener('click', handleCellClick);
                grid.appendChild(cell);
            }
        }
        gridContainer.appendChild(grid);
    }
}

aiPlayCheckbox.addEventListener('change', function () {
    // toggle aiplayer
    aiPlayer = this.checked;
    //todo: reset board and grids.
});

function handleCellClick(event) {
    const cell = event.target;
    //console.log(cell);
    const z = Number(cell.dataset.z);
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);


    // Prevent overwriting a cell
    if (grids[y][x][z] !== '') {
        return;
    }
    // Update cell and grid state
    cell.textContent = currentPlayer;
    grids[y][x][z] = currentPlayer;

    // Check for 3-in-a-row
    checkForWin([y, x, z], currentPlayer);

    if (aiPlayer) {
        // if ai player then make ai move straight away.
        setTimeout(() => {
            aiBestMove();
            console.log("ai play");
        }, 800); // 800ms delay
        // no need to switch player.
    } else {
        // Switch player
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        console.log("Next go: ", currentPlayer);
    }
}

function aiMove() {
    // ai player make move for 'O'
    // random at first?
    // Keep track of visited cells to prevent infinite loops if grid is full
    const totalCells = 27;
    let attempts = 0;

    while (attempts < totalCells) { // Limit attempts to prevent infinite loop on full grid
        const x = getRandomInt(0, 2);
        const y = getRandomInt(0, 2);
        const z = getRandomInt(0, 2);

        if (grids[y][x][z] === '') {
            console.log({ y, x, z }); // Found an empty cell!
            // add 'O' to grids
            grids[y][x][z] = 'O';
            // find cell on screen, add 'O'
            const aiCell = document.querySelector(`div.cell[data-x="${x}"][data-y="${y}"][data-z="${z}"]`);
            aiCell.textContent = 'O';
            // check for winning position
            checkForWin([y, x, z], 'O');
            // jump out of while loop.
            attempts = totalCells;
        }
        attempts++;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createWinStates() {
    // Define all 49 possible winning lines using [z, y, x] coordinates
    // 1. Lines along X-axis (rows within each grid) - 3 grids * 3 rows = 9 lines
    for (let z = 0; z < 3; z++) {
        for (let y = 0; y < 3; y++) {
            winningLines3D.push([[z, y, 0], [z, y, 1], [z, y, 2]]);
        }
    }

    // 2. Lines along Y-axis (columns within each grid) - 3 grids * 3 columns = 9 lines
    for (let z = 0; z < 3; z++) {
        for (let x = 0; x < 3; x++) {
            winningLines3D.push([[z, 0, x], [z, 1, x], [z, 2, x]]);
        }
    }

    // 3. Lines along Z-axis (vertical lines through the grids) - 3 rows * 3 columns = 9 lines
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            winningLines3D.push([[0, y, x], [1, y, x], [2, y, x]]);
        }
    }

    // 4. Diagonals within each XY plane (2D diagonals) - 3 grids * 2 diagonals = 6 lines
    for (let z = 0; z < 3; z++) {
        winningLines3D.push([[z, 0, 0], [z, 1, 1], [z, 2, 2]]); // Top-left to bottom-right
        winningLines3D.push([[z, 0, 2], [z, 1, 1], [z, 2, 0]]); // Top-right to bottom-left
    }

    // 5. Diagonals within each XZ plane (slice diagonals when looking from front/back) - 3 columns * 2 diagonals = 6 lines
    for (let x = 0; x < 3; x++) {
        winningLines3D.push([[0, 0, x], [1, 1, x], [2, 2, x]]); // Front-top to back-bottom
        winningLines3D.push([[0, 2, x], [1, 1, x], [2, 0, x]]); // Front-bottom to back-top
    }

    // 6. Diagonals within each YZ plane (slice diagonals when looking from side) - 3 rows * 2 diagonals = 6 lines
    for (let y = 0; y < 3; y++) {
        winningLines3D.push([[0, y, 0], [1, y, 1], [2, y, 2]]); // Left-front to right-back
        winningLines3D.push([[0, y, 2], [1, y, 1], [2, y, 0]]); // Right-front to left-back
    }

    // 7. Space Diagonals (main 3D diagonals) - 4 lines
    winningLines3D.push([[0, 0, 0], [1, 1, 1], [2, 2, 2]]); // Corner to opposite corner
    winningLines3D.push([[0, 0, 2], [1, 1, 1], [2, 2, 0]]); // Corner to opposite corner
    winningLines3D.push([[0, 2, 0], [1, 1, 1], [2, 0, 2]]); // Corner to opposite corner
    winningLines3D.push([[0, 2, 2], [1, 1, 1], [2, 0, 0]]); // Corner to opposite corner
    //console.log(winningLines3D);
}

function addPulseEffect(cellElement, currentPlayer) {
    if (cellElement) {
        if (currentPlayer == 'X') {
            // Remove the class first to allow the animation to re-trigger if already present
            // This is important if you want to pulse the same cell multiple times
            cellElement.classList.remove('pulseY');

            // Force a reflow/repaint to ensure the animation restarts
            void cellElement.offsetWidth;

            // Add the class to trigger the animation
            cellElement.classList.add('pulseY');

            // The animation duration is 1s, so we'll remove it slightly after.
            setTimeout(() => {
                cellElement.classList.remove('pulseY');
            }, 2100); // Slightly longer than the animation duration
        } else {
            // Remove the class first to allow the animation to re-trigger if already present
            // This is important if you want to pulse the same cell multiple times
            cellElement.classList.remove('pulseG');

            // Force a reflow/repaint to ensure the animation restarts
            void cellElement.offsetWidth;

            // Add the class to trigger the animation
            cellElement.classList.add('pulseG');

            // The animation duration is 1s, so we'll remove it slightly after.
            setTimeout(() => {
                cellElement.classList.remove('pulseG');
            }, 2100); // Slightly longer than the animation duration
        }
    }
}

function arraysEqual(a, b) {
    // are the two arrays equal
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function checkForWin(playedCell, currentPlayer) {
    scores.X = 0;
    scores.O = 0;

    // loop through winning lines, and count all that have same character.
    for (const line3D of winningLines3D) {
        const coord1 = line3D[0];
        const coord2 = line3D[1];
        const coord3 = line3D[2];
        let justPlayed = false;
        if (arraysEqual(line3D[0], playedCell) || arraysEqual(line3D[1], playedCell) || arraysEqual(line3D[2], playedCell)) {
            justPlayed = true;
        }

        // y, x, z of the three in a rows
        const y1 = coord1[0];
        const x1 = coord1[1];
        const z1 = coord1[2];

        const y2 = coord2[0];
        const x2 = coord2[1];
        const z2 = coord2[2];

        const y3 = coord3[0];
        const x3 = coord3[1];
        const z3 = coord3[2];

        const val1 = grids[y1][x1][z1];
        const val2 = grids[y2][x2][z2];
        const val3 = grids[y3][x3][z3];

        if (val1 && val1 === val2 && val1 === val3) {
            scores[val1]++;
            // now pulse winning rows - change to only when includes last placement.
            if (justPlayed) {
                const t1 = document.querySelector(`div.cell[data-x="${x1}"][data-y="${y1}"][data-z="${z1}"]`);
                addPulseEffect(t1, currentPlayer);
                const t2 = document.querySelector(`div.cell[data-x="${x2}"][data-y="${y2}"][data-z="${z2}"]`);
                addPulseEffect(t2, currentPlayer);
                const t3 = document.querySelector(`div.cell[data-x="${x3}"][data-y="${y3}"][data-z="${z3}"]`);
                addPulseEffect(t3, currentPlayer);
            }
        }
    }

    // Update scoreboard
    document.getElementById('scoreX').textContent = scores.X;
    document.getElementById('scoreO').textContent = scores.O;
    document.getElementById('scoreX').classList.remove("winner");
    document.getElementById('scoreO').classList.remove("winner");
    if (scores.X > scores.O) {
        document.getElementById('scoreX').classList.add("winner");
    } else if (scores.O > scores.X) {
        document.getElementById('scoreO').classList.add("winner");
    }
}

function aiBestMove() {
    /* - could add depth to this - look n moves ahead.
    * Go through each empty cell and find the one that give the best score (=+1,2,3 rows for AI)
    * if no score availible look for reverse, best score for 'X' and then block.
    * else randomly select the best other cell: mega centre -> corner -> center side - >edge 
    */
    let bestScore = -10;
    let bestMove = { y: 0, x: 0, z: 0 };
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            for (let z = 0; z < 3; z++) {
                if (grids[y][x][z] === '') {
                    let score = checkMove({ y: y, x: x, z: z }, 'O')
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove.y = y;
                        bestMove.x = x;
                        bestMove.z = z;
                    }
                }
            }
        }
    }
    if (bestScore > -5) {
        grids[bestMove.y][bestMove.x][bestMove.z] = 'O';
        const aiCell = document.querySelector(`div.cell[data-x="${bestMove.x}"][data-y="${bestMove.y}"][data-z="${bestMove.z}"]`);
        aiCell.textContent = 'O';
    } else {
        aiMove(); // random.
    }
    // check for winning position
    checkForWin([bestMove.y, bestMove.x, bestMove.z], 'O');
    //is still X's go.
}

/* from game board, move={ y: 0, x: 0, z: 0 } and player 'X' or 'O' return point increase that move makes.  */
function checkMove(move, player) {
    let scoretemp = { X: 0, O: 0 };
    let gameboard = [];
    for (let y = 0; y < grids.length; y++) {
        gameboard[y] = [];
        for (let x = 0; x < grids[y].length; x++) {
            gameboard[y][x] = [];
            for (let z = 0; z < grids[y][x].length; z++) {
                gameboard[y][x][z] = grids[y][x][z]; // Copy the primitive value
            }
        }
    }
    gameboard[move.y][move.x][move.z] = player;
    // loop through winning lines, and count all that have same character.
    for (const line3D of winningLines3D) {
        const coord1 = line3D[0];
        const coord2 = line3D[1];
        const coord3 = line3D[2];

        // y, x, z of the three in a rows
        const y1 = coord1[0];
        const x1 = coord1[1];
        const z1 = coord1[2];

        const y2 = coord2[0];
        const x2 = coord2[1];
        const z2 = coord2[2];

        const y3 = coord3[0];
        const x3 = coord3[1];
        const z3 = coord3[2];

        const val1 = gameboard[y1][x1][z1];
        const val2 = gameboard[y2][x2][z2];
        const val3 = gameboard[y3][x3][z3];

        if (val1 && val1 === val2 && val1 === val3) {
            scoretemp[val1]++;
        }
    }
    // return differnece in actual score to temp score for player.
    return scoretemp[player] - scores[player];
}