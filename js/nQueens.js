/*
 * Author: Joseph Morris
 * Summary: n Queens Game class.
 * Last Modified: 07/17/2016 12:39
 */

var nQueens = nQueens || {};
nQueens.Game = (function () {

    var runningTests = (typeof module !== "undefined" && module.exports != null);

    var STORAGE_PATH = "JRMSoftworks.BG.nQueens",
        MIN_GRID_SIZE = 8,
        MAX_GRID_SIZE = 12,
        MIN_TILE_DIMEN = 36,
        MIN_SCREEN_WIDTH = 320;

    // Separates jQuery selectors from the code for ease of maintenance.
    var BOARD_ID = "#board",
        QUEENS_PLACED = "#game-queens-placed",
        OPTIONS = "#options",
        GRID_SIZE_SELECTOR = "#grid-size-selector",
        CLEAR_ACHIEVEMENTS_CHECKED = '#clear-achievements:checked',
        ROW_TEMPLATE = "#row-template",
        COL_TEMPLATE = "#col-template",
        MODAL_GAME_OVER = "#game-over-modal",
        MODAL_NEW_BEST_TIME = "#modal-new-best-time",
        MODAL_TIME_TAKEN = "#modal-time-taken",
        MODAL_UNIQUE_SOLUTION = "#modal-unique-solution",
        MODAL_SOLUTIONS_FOUND = "#modal-solutions-found",
        MODAL_ENCOURAGEMENT = "#modal-encouragement-text",
        MODAL_OPTIONS = "#options-modal",
        MODAL_HELP = "#help-modal";

    // Provides default values for the settings saved in local storage
    var defaults = {
        gridSize: 8,
        bestTime: {
            "8": 9999,
            "9": 9999,
            "10": 9999,
            "11": 9999,
            "12": 9999
        },
        solutionsFound: {
            "8": [],
            "9": [],
            "10": [],
            "11": [],
            "12": []
        }
    };

    // Create commonly used jQuery objects for easy reference
    var board = $(BOARD_ID),
        queensPlaced = $(QUEENS_PLACED),
        rowTemplate = $(ROW_TEMPLATE),
        colTemplate = $(COL_TEMPLATE),
        gameOverTemplate = $(MODAL_GAME_OVER),
        newBestTimeTemplate = $(MODAL_NEW_BEST_TIME),
        timeTakenTemplate = $(MODAL_TIME_TAKEN),
        uniqueSolutionTemplate = $(MODAL_UNIQUE_SOLUTION),
        solutionsFoundTemplate = $(MODAL_SOLUTIONS_FOUND),
        encouragementTemplate = $(MODAL_ENCOURAGEMENT),
        optionsTemplate = $(MODAL_OPTIONS),
        helpTemplate = $(MODAL_HELP);

    function globalInit() {
        //Listeners
        $(window).on("resize", function () {
            var width = board.width();
            board.height(width);
        });

        $("body").on("hidden.bs.modal", function (ev) {
            var el = $(ev.target);
            el.remove();
        });
    }

    // Declaration of the main game class.
    function nQueensGame() {
        var currentSettings,
            grid,
            gridSize, // Convenience accessor
            gameTime,
            currentNumQueens,
            totalNumQueens;

        // Gets settings from localStorage. If not found, loads defaults
        // and saves those defaults to localStorage.
        function initSettings() {
            var settings,
                disabledSizes = getDisabledGridSizes();

            // Note to self: change to null to reset settings
            currentSettings = getSettings();
            settings = (currentSettings != null) ? currentSettings : defaults;

            if (settings === defaults) {
                saveSettings(defaults);
            } else {
                if (disabledSizes.indexOf(settings.gridSize) !== -1) {
                    settings.gridSize = defaults.gridSize;
                }
            }

            currentSettings = settings;
        }

        // Initializes the game by:
        //      1. Loading current settings
        //      2. Generating the board
        //      3. Initializing game variables
        // * Exposes function to public after declaration to allow private members to call without prefix.
        function reset() {
            initSettings();

            gridSize = currentSettings.gridSize;
            initBoard();

            grid = new nQueens.Grid(gridSize);
            gameTime = {"start": 0, "end": 0};
            totalNumQueens = gridSize;
            currentNumQueens = 0;

            queensPlaced.text("0");
        }
        this.reset = reset; // Expose to public

        // Generates the board given a size and adds event listeners
        function initBoard() {
            if (!runningTests) {
                var clickEvent = "click.nQueens";

                generateBoard();

                board.removeClass('hidden')
                     .height(board.width())
                     .off(clickEvent)
                     .on(clickEvent, ".tile", tileClickHandler);
            }
        }

        // Generates board of given size and adds it to the DOM.
        function generateBoard() {
            var rows = $([]);

            for (var r = 0; r < gridSize; r++) {
                var rowTemp = rowTemplate[0].innerHTML.replace(/@rowNum/, r.toString()),
                    row = $([]).add(rowTemp);

                for (var c = 0; c < gridSize; c++) {
                    var colTemp = colTemplate[0].innerHTML.replace(/@colNum/, c.toString()),
                        col = $([]).add(colTemp);

                    col.data("row", r)
                       .data("col", c);

                    row.first().append(col);
                }

                rows = rows.add(row);
            }

            board.empty()
                 .append(rows);
        }

        // Handles the tile click event.
        function tileClickHandler() {
            var el = $(this),
                row = el.data("row"),
                col = el.data("col"),
                affectedTiles;

            if (el.hasClass("dot")) {
                // Tiles that have been affected by other queens cannot be clicked
                return false;
            }

            // Clicked tile is now a queen
            el.addClass("queen");

            affectedTiles = grid.placeQueen(row, col);
            affectedTiles = tileCoordsToJQuery(affectedTiles);
            affectedTiles.addClass("dot");

            currentNumQueens++;
            queensPlaced.text(currentNumQueens.toString());

            if (grid.isFilled()) {
                gameOver();
            }

            if (gameTime.start === 0) {
                // Only start the timer when the player's first move has been completed.
                runGameTimer();
            }
        }

        // Converts tile coords to the jQuery objects they represent
        function tileCoordsToJQuery(tiles) {
            var jQTiles = $([]);
            for (var i = 0, j = tiles.length; i < j; i++) {
                var tile = tiles[i],
                    row = ".row-" + tile[0].toString(),
                    col = ".col-" + tile[1].toString(),
                    jQTile = $([row, col].join(" "));

                if (jQTile.length > 0) {
                    jQTiles = jQTiles.add(jQTile);
                }
            }

            return jQTiles;
        }

        // Ends the game and checks for achievement conditions
        function gameOver() {
            runGameTimer(true);

            if (currentNumQueens === currentSettings.gridSize && grid.isSolved()) {

                var hashCode = getTilesHashCode(grid.getTiles(true)), // Hash solution for comparison
                    solutionsArray = getSolutionsArray(),
                    timeTaken = getGameTimeElapsed(),
                    currentBestTime = getBestTime(),
                    uniqueSolution = false,
                    newBestTime = false;

                if (solutionsArray.indexOf(hashCode) === -1) {
                    uniqueSolution = true;
                    pushToSolutionsArray(hashCode);
                }

                if (timeTaken < currentBestTime) {
                    newBestTime = true;
                    setBestTime(timeTaken);
                }

                // Save our progress if any stats changed
                if (uniqueSolution || newBestTime) {
                    saveSettings(currentSettings);
                }

                // Display solved dialogue
                showGameOverModal(true, timeTaken, uniqueSolution, newBestTime);
            } else {
                // Display try again dialogue
                showGameOverModal(false, timeTaken, uniqueSolution, newBestTime);
            }
        }

        // Converts the grid's tiles to a string, which is then hashed.
        function getTilesHashCode(tiles) {
            var hash = 0,
                tileString = tiles.join('');

            // We are going to mirror Java's implementation of hashCode
            // The prime we will be using is 31.
            // ((hash << 5) - hash) + charCodePoint === hash * 31 + charCodePoint
            for (var i = 0, j = tileString.length; i < j; i++) {
                var charCodePoint = tileString.toString().codePointAt(i);
                hash = ((hash << 5) - hash) + charCodePoint;
                // Convert to 32-bit integer by chopping off anything above 32 bits;
                hash |= 0;
            }

            return hash;
        }

        // Creates our game over modal and adds appropriate content, then shows the modal.
        function showGameOverModal(won, timeTaken, uniqueSolution, newBestTime) {
            var modal = fromTemplate(gameOverTemplate),
                modalBody = modal.find('.modal-body'),
                headerText = (won) ? "Success!" : "Try Again";

            modal.find('#game-result')
                 .text(headerText);

            if (won) {
                var timeText = (newBestTime) ? fromTemplate(newBestTimeTemplate) : fromTemplate(timeTakenTemplate),
                    solutionText = (uniqueSolution) ? fromTemplate(uniqueSolutionTemplate) :
                        fromTemplate(solutionsFoundTemplate);

                timeText.find(".time-taken")
                        .text(timeTaken.toString());

                solutionText.find(".solutions-found")
                            .text(getSolutionsArray().length.toString());

                modalBody.append(timeText)
                         .append(solutionText);
            } else {
                var encouragementText = fromTemplate(encouragementTemplate);
                modalBody.append(encouragementText);
            }

            $("body").append(modal);

            modal.modal({
                backdrop: 'static'
            });
            modal.modal('show');
        }

        // Convenience function that creates a jQuery object from a template
        function fromTemplate(jQTemplate) {
            return $([]).add(jQTemplate[0].innerHTML);
        }

        // Starts/Stops the game timer.
        function runGameTimer(stopTimer) {
            var key = (stopTimer) ? "end" : "start";
            gameTime[key] = Date.now();
        }

        // Calculates the time elapsed during the game.
        function getGameTimeElapsed() {
            return (gameTime.end - gameTime.start) / 1000;
        }

        function getBestTime() {
            return currentSettings.bestTime[currentSettings.gridSize.toString()];
        }

        function getSolutionsArray() {
            return currentSettings.solutionsFound[currentSettings.gridSize.toString()];
        }

        function setBestTime(val) {
            currentSettings.bestTime[currentSettings.gridSize.toString()] = val;
        }

        function pushToSolutionsArray(val) {
            currentSettings.solutionsFound[currentSettings.gridSize.toString()].push(val);
        }

        function getSettings() {
            return JSON.parse(localStorage.getItem(STORAGE_PATH));
        }

        function saveSettings(settings) {
            if (settings) {
                localStorage.setItem(STORAGE_PATH, JSON.stringify(settings));
            }
        }

        this.showOptions = function showOptions() {
            var modal = fromTemplate(optionsTemplate),
                disabledSizes = getDisabledGridSizes();


            $("body").append(modal);
            modal.find("#grid" + currentSettings.gridSize.toString())
                 .closest('label')
                 .button("toggle");

            if (disabledSizes.length !== 0) {
                modal.find("#grid-sizes-disabled")
                     .addClass("force-show");
            }

            for (var i = MIN_GRID_SIZE; i <= MAX_GRID_SIZE; i++) {
                if (disabledSizes.indexOf(i) !== -1) {
                    modal.find("#grid" + i.toString())
                         .closest('label')
                         .addClass("disabled alert-danger");
                }
            }

            modal.modal({
                backdrop: 'static'
            });
            modal.modal('show');
        };

        function getDisabledGridSizes() {
            var screenWidth = $(window).width(),
                screenHeight = $(window).height(),
                widthIncreases = Math.floor((screenWidth - MIN_SCREEN_WIDTH) / MIN_TILE_DIMEN),
                heightIncreases = Math.floor(((screenHeight - MIN_SCREEN_WIDTH) - (screenHeight * 0.25)) / MIN_TILE_DIMEN),
                maxIncrease = Math.min(widthIncreases, heightIncreases),
                disabled = [];

            maxIncrease = (maxIncrease < 0) ? 0 : maxIncrease;

            for (var i = MIN_GRID_SIZE; i <= MAX_GRID_SIZE; i++) {
                if (!(i <= defaults.gridSize + maxIncrease)) {
                    disabled.push(i);
                }
            }

            return disabled;
        }

        this.applyOptions = function applyOptions() {
            var modal = $(OPTIONS),
                gridSizeSelected = $(GRID_SIZE_SELECTOR).find("input:checked").closest("label"),
                gridSize = +gridSizeSelected.text() || currentSettings.gridSize,
                clearAchievements = (modal.find(CLEAR_ACHIEVEMENTS_CHECKED).length > 0),
                resetNeeded = false;

            modal.modal('hide');

            if (gridSize !== currentSettings.gridSize) {
                currentSettings.gridSize = gridSize;
                resetNeeded = true;
            }

            if (clearAchievements) {
                currentSettings.bestTime = defaults.bestTime;
                currentSettings.solutionsFound = defaults.solutionsFound;
                resetNeeded = true;
            }

            if (resetNeeded) {
                saveSettings(currentSettings);
                reset();
            }
        };

        this.showHelp = function showHelp() {
            var modal = fromTemplate(helpTemplate);

            $("body").append(modal);

            modal.modal({
                backdrop: 'static'
            });
            modal.modal('show');
        };

        if (runningTests) {
            this.runGameTimer = runGameTimer;
            this.getGameTimeElapsed = getGameTimeElapsed;
            this.saveSettings = saveSettings;
            this.getSettings = getSettings;
            this.getTilesHashCode = getTilesHashCode;
        }

        reset();
    }

    // TODO: Remove for production!
    if (runningTests) {
        $ = function (val) { return val; };
        nQueens.Grid = require('./nQueens.Grid.js').Grid;
        queensPlaced = {'text': function () {}};
    }

    // TESTING PURPOSES ONLY
    if (runningTests)  {
        exports.Game = nQueensGame;
    } else {
        // Only call global init in browser.
        globalInit();
    }

    return nQueensGame;

})();