/*
 * Author: Joseph Morris
 * Summary: n Queens Grid class. Used as the internal grid representation for the game.
 * Last Modified: 07/13/2016 23:30
 */

var nQueens  = nQueens || {};
nQueens.Grid = (function() {

    var runningTests = (typeof module !== "undefined" && module.exports != null);

    function Grid(size) {

        var gridSize = size,
            tiles = new Array(gridSize),
            maxGridIdx = gridSize - 1,
            STATE_EMPTY = 0,
            STATE_DOT = 1,
            STATE_QUEEN = 2;

        // Fill each row with a column of zeroes.
        for (var i = 0; i < gridSize; i++) {

            tiles[i] = [];
            for (var j = 0; j < gridSize; j++) {
                tiles[i][j] = STATE_EMPTY;
            }
        }

        // Returns the tiles array.
        // If flatten, the multi-dimensional array will be flattened into a single array
        function getTiles (flatten) {
            return (flatten) ? [].concat.apply([], tiles) : tiles;
        }
        this.getTiles = getTiles; // Expose to public

        // Sets the state of a tile in the tiles array
        // row, col = index of tile to change
        // state = 0, 1, 2
        // States: 0 = empty, 1 = dotted, 2 = queen
        function setTileState (row, col, state) {
            if (row < gridSize &&
                col < gridSize &&
                state >= STATE_EMPTY &&
                state <= STATE_QUEEN) {
                tiles[row][col] = state;
            }
        }

        // Places a queen into the grid and marks affected tiles with the
        // appropriate state.
        // Returns the affected tiles (exluding the queen) for further processing.
        this.placeQueen = function placeQueen(row, col) {

            var affectedTiles;

            setTileState(row, col, STATE_QUEEN);
            affectedTiles = getAffectedTileCoords(row, col);

            for (var i = 0, j = affectedTiles.length; i < j; i++) {
                var tile = affectedTiles[i];
                setTileState(tile[0], tile[1], STATE_DOT);
            }

            return affectedTiles;
        };

        // Finds the starting coordinates of the ascending diagonal
        // row, col = position of queen
        function getAscendingDiagonal (row, col) {

            /* The starting coordinates of the ascending diagonal can be computed
             by using:
             x = row + col

             Where:
             x >= size - 1	yields [rows - 1, x - (size - 1)]
             x < size - 1	yields [x, 0]

             There are two points that will produce no ascending diagonal:
             [0, 0]
             [rows - 1, cols - 1]
             */

            var diag = row + col,
                diagCoords = [];

            // If our queen falls on the two exception points, return an empty array
            if ((row === 0 && col === 0) ||
                (row === maxGridIdx && col === maxGridIdx)) {
                return [];
            }

            // Otherwise, calculate the starting coord of the diagonal using our formula.
            if (diag >= maxGridIdx) {
                var diagCol = diag - maxGridIdx;
                diagCoords = [maxGridIdx, diagCol];
            } else {
                diagCoords = [diag, 0];
            }

            return diagCoords;
        }

        // Finds the starting coordinates of the descending diagonal
        // row, col = position of queen
        function getDescendingDiagonal (row, col) {

            /* The starting coordinates of the descending diagonal can be computed
             by using:
             x = row - col

             Where:
             x >= 0	yields [x, 0]
             x < 0	yields [0, x]

             There are two points that will produce no descending diagonal:
             [gridSize - 1, 0]
             [0, gridSize - 1]
             */

            var diag = row - col,
                diagCoords = [];

            // If our queen falls on the two exception points, return an empty array
            if ((row === maxGridIdx && col === 0) ||
                (row === 0 && col === maxGridIdx)) {
                return [];
            }

            // Otherwise, calculate the starting coord of the diagonal using our formula.
            if (diag < 0) {
                diagCoords = [0, Math.abs(diag)];
            } else {
                diagCoords = [diag, 0];
            }

            return diagCoords;
        }

        // Get the coordinate set of the descending diagonal, excluding the queen's position.
        // row, col = position of queen
        function getDescendingDiagonalCoords(row, col) {
            var startingCoord = getDescendingDiagonal(row, col),
                coordRow,
                coordCol,
                coords = [];

            if (!startingCoord.length) {
                return coords;
            }

            coordRow = startingCoord[0];
            coordCol = startingCoord[1];

            while (coordRow <= maxGridIdx && coordCol <= maxGridIdx) {
                if (coordRow !== row && coordCol !== col) {
                    coords.push([coordRow, coordCol])
                }
                coordRow++;
                coordCol++;
            }

            return coords;
        }

        // Get the coordinate set of the ascending diagonal, excluding the queen's position.
        // row, col = position of queen
        function getAscendingDiagonalCoords(row, col) {
            var startingCoord = getAscendingDiagonal(row, col),
                coordRow,
                coordCol,
                coords = [];

            if (!startingCoord.length) {
                return coords;
            }

            coordRow = startingCoord[0];
            coordCol = startingCoord[1];

            while (coordRow >= 0 && coordCol <= maxGridIdx) {
                if (coordRow !== row && coordCol !== col) {
                    coords.push([coordRow, coordCol])
                }
                coordRow--;
                coordCol++;
            }

            return coords;
        }

        // Get the coordinate set of the row, excluding the queen's position.
        // row, col = position of queen
        function getHorizontalCoords(row, col) {
            var coords = [];

            for (var i = 0; i < gridSize; i++) {
                if (i !== col) {
                    coords.push([row, i]);
                }
            }

            return coords;
        }

        // Get the coordinate set of the column, excluding the queen's position.
        // row, col = position of queen
        function getVerticalCoords(row, col) {
            var coords = [];

            for (var i = 0; i < gridSize; i++) {
                if (i !== row) {
                    coords.push([i, col]);
                }
            }

            return coords;
        }

        // Get the tiles affected by placing a queen
        // row, col = position of queen
        function getAffectedTileCoords(row, col) {
            var coords = [],
                coordFuncs = [
                    getHorizontalCoords,
                    getVerticalCoords,
                    getDescendingDiagonalCoords,
                    getAscendingDiagonalCoords
                ];

            coordFuncs.forEach((func) => {
                coords = coords.concat(func(row, col));
            });

            return coords;
        }

        // Checks to see if the grid is completely filled
        this.isFilled = function () {
            var tileStates = getTiles(true);

            return (tileStates.indexOf(0) === -1);
        };

        // Checks to see if the grid is solved.
        // Solved = contains exactly gridSize number of queens
        this.isSolved = function () {
            var tileStates = getTiles(true),
                numQueens = 0;

            tileStates.forEach(
                (x) => { if (x === 2) numQueens++; }
            );

            return numQueens === gridSize;
        };

        // TESTING PURPOSES ONLY
        if (runningTests) {
            // The presence of these things indicates testing
            this.getTiles = getTiles;
            this.setTileState = setTileState;
            this.getDescendingDiagonal = getDescendingDiagonal;
            this.getAscendingDiagonal = getAscendingDiagonal;
            this.getDescendingDiagonalCoords = getDescendingDiagonalCoords;
            this.getAscendingDiagonalCoords = getAscendingDiagonalCoords;
            this.getHorizontalCoords = getHorizontalCoords;
            this.getVerticalCoords = getVerticalCoords;
            this.getAffectedTileCoords = getAffectedTileCoords;
        }
    }

    if (runningTests) {
        exports.Grid = Grid;
    }

    return Grid;
})();



