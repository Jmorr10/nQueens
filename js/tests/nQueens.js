/*
 * Author: Joseph Morris
 * Summary: n Queens Game class test suite.
 * Last Modified: 07/13/2016 23:45
 */

var assert = require("assert"),
    nQueens = require("../nQueens.js");

require("mock-local-storage");
describe("nQueens Game", function () {

    var game;

    before(function () {
        game = new nQueens.Game();
    });

    it("can start the game timer", function (done) {
        this.timeout(3000);
        game.runGameTimer();
        setTimeout(done, 431);
    });

    it("can stop the game timer and get elapsed time", function () {
        game.runGameTimer(true);
        assert.equal(game.getGameTimeElapsed().toFixed(2), 0.43);
    });

    it("can save and load settings", function () {
        var savedSettings,
            oldSettings = game.getSettings(),
            newSettings = {
                gridSize: 9,
                bestTime: 0.431,
                solutionsFound: 10
            };

        game.saveSettings(newSettings);
        savedSettings = game.getSettings();
        assert.equal(savedSettings.gridSize, 9);
        assert.equal(savedSettings.bestTime, 0.431);
        assert.equal(savedSettings.solutionsFound, 10);

        // Put our settings back to normal
        game.saveSettings(oldSettings);
    });

    it("can calculate a hash code to find unique solutions", function () {
        assert.equal(game.getTilesHashCode("testing123".split('')), -1943301598);
    });

});