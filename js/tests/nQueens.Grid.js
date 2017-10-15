/*
 * Author: Joseph Morris
 * Summary: n Queens Grid class test suite.
 * Last Modified: 07/17/2016 12:37
 */

var assert = require("assert"),
    nQueens = require("../nQueens.Grid.js");

describe("nQueens Grid", function() {

    var grid;

    beforeEach(function () {
        grid = new nQueens.Grid(8);
    });

    it("creates a multi-dimensional array of specified size", function () {
        assert.equal(grid.getTiles().length, 8);
        assert.equal(grid.getTiles(true).length, 64); // Should be size^2
    });

    it("can set the state at the specified coordinates", function () {
        grid.setTileState(0, 0, 2);
        assert.equal(grid.getTiles(true)[0], 2);
    });

    it("can determine if it is filled", function () {
        assert.equal(grid.isFilled(), false);
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                grid.setTileState(i, j, 1); // Fill the grid with non-zeroes
            }
        }
        assert.equal(grid.isFilled(), true);
    });

    it("can determine if it is solved", function () {
        /* For the sake of simplicity, a grid is considered "solved" if it
            contains the same number of queens as its grid size. No other
            constraints are enforced due to the blocking mechanism of the
            click/touch event handlers. TODO: Add more to this, such as a "see me".
         */
        assert.equal(grid.isSolved(), false);
        for(var i = 0; i < 8; i++) {
            grid.setTileState(0, i, 2);
        }
        assert.equal(grid.isSolved(), true);
    });

    it("can calculate the starting coordinate of the descending diagonal given a row and col", function () {
        // First, test the exceptions to our formula.
        assert.deepEqual(grid.getDescendingDiagonal(7, 0), []);
        assert.deepEqual(grid.getDescendingDiagonal(0, 7), []);

        // Test a point where the starting coord. === the queen's coord.
        // Then a point where the queen is opposite the starting coord.
        assert.deepEqual(grid.getDescendingDiagonal(0, 0), [0, 0]);
        assert.deepEqual(grid.getDescendingDiagonal(7, 7), [0, 0]);

        // difference >= 0 and difference < 0
        assert.deepEqual(grid.getDescendingDiagonal(3, 1), [2, 0]);
        assert.deepEqual(grid.getDescendingDiagonal(2, 6), [0, 4]);
    });

    it("can calculate the starting coordinate of the ascending diagonal given a row and col", function () {
        // Again, test the exceptions first
        assert.deepEqual(grid.getAscendingDiagonal(0, 0), []);
        assert.deepEqual(grid.getAscendingDiagonal(7, 7), []);

        // Reflexive and opposite
        assert.deepEqual(grid.getAscendingDiagonal(7, 0), [7, 0]);
        assert.deepEqual(grid.getAscendingDiagonal(0, 7), [7, 0]);

        // sum < gridSize - 1 and sum >= gridSize - 1
        assert.deepEqual(grid.getAscendingDiagonal(3, 1), [4, 0]);
        assert.deepEqual(grid.getAscendingDiagonal(2, 6), [7, 1]);
    });

    it("can get the coordinate set of the descending diagonal", function () {
        // Test our exceptions first
        assert.deepEqual(grid.getDescendingDiagonalCoords(7,0), []);
        assert.deepEqual(grid.getDescendingDiagonalCoords(0,7), []);

        // Random point
        assert.deepEqual(grid.getDescendingDiagonalCoords(4,2), [[2,0], [3,1], [5,3], [6,4], [7,5]]);

    });

    it("can get the coordinate set of the ascending diagonal", function () {
        // Again, exceptions first
        assert.deepEqual(grid.getAscendingDiagonalCoords(0,0), []);
        assert.deepEqual(grid.getAscendingDiagonalCoords(7,7), []);

        // Same random point
        assert.deepEqual(grid.getAscendingDiagonalCoords(4,2), [[6,0], [5,1], [3,3],
                                                                [2,4], [1,5], [0,6]]);
    });

    it("can get the coordinate set of the affected tiles in a row", function () {
        // Same random point
        assert.deepEqual(grid.getHorizontalCoords(4,2), [[4,0], [4,1], [4,3], [4,4], [4,5], [4,6], [4,7]]);
    });

    it("can get the coordinate set of the affected tiles in a col", function () {
        // Same random point
        assert.deepEqual(grid.getVerticalCoords(4,2), [[0,2], [1,2], [2,2], [3,2], [5,2], [6,2], [7,2]]);
    });

    it("can determine the tiles affected when placing a queen", function () {
        // Same random point, combined.
        assert.deepEqual(grid.getAffectedTileCoords(4,2), [[4,0], [4,1], [4,3], [4,4], [4,5],
                                                      [4,6], [4,7], [0,2], [1,2], [2,2],
                                                      [3,2], [5,2], [6,2], [7,2], [2,0],
                                                      [3,1], [5,3], [6,4], [7,5], [6,0],
                                                      [5,1], [3,3], [2,4], [1,5], [0,6]]);

        // Test with no ascending diagonal
        assert.deepEqual(grid.getAffectedTileCoords(0,0), [[0,1], [0,2], [0,3], [0,4], [0,5],
                                                           [0,6], [0,7], [1,0], [2,0], [3,0],
                                                           [4,0], [5,0], [6,0], [7,0], [1,1],
                                                           [2,2], [3,3], [4,4], [5,5], [6,6],
                                                           [7,7]]);
        // Test with no descending diagonal
        assert.deepEqual(grid.getAffectedTileCoords(0,7), [[0,0], [0,1], [0,2], [0,3], [0,4],
                                                           [0,5], [0,6], [1,7], [2,7], [3,7],
                                                           [4,7], [5,7], [6,7], [7,7], [7,0],
                                                           [6,1], [5,2], [4,3], [3,4], [2,5],
                                                           [1,6]]);
    });
});