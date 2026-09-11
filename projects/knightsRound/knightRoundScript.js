const form = document.getElementById('knight-round-form');
const resultBox = document.getElementById('test-result');
const boardWrapper = document.getElementById('board-output');
const listWrapper = document.getElementById('list-output');
const boardGrid = document.getElementById('knight-board');
const solutionList = document.getElementById('solution-list');
const toggleBoardButton = document.getElementById('toggle-board');
const toggleListButton = document.getElementById('toggle-list');

let pyodideInstance = null;

function parseSolutionString(solution) {
  if (typeof solution !== 'string') {
    return null;
  }

  const matches = [...solution.matchAll(/\((\d+),\s*(\d+)\)/g)];

  if (!matches.length) {
    return null;
  }

  return matches.map((match) => ({
    column: Number(match[1]),
    row: Number(match[2]),
  }));
}

function renderBoard(boardSize, moves) {
  const moveMap = new Map();

  moves.forEach((move, index) => {
    moveMap.set(`${move.column},${move.row}`, index);
  });

  boardGrid.style.gridTemplateColumns = `repeat(${boardSize}, minmax(32px, 1fr))`;
  boardGrid.innerHTML = '';

  for (let row = 0; row < boardSize; row += 1) {
    for (let column = 0; column < boardSize; column += 1) {
      const cell = document.createElement('div');
      const step = moveMap.get(`${column},${row}`);

      cell.className = 'board-cell';

      if (step !== undefined) {
        cell.textContent = step;
        cell.classList.add('filled');
      }

      boardGrid.appendChild(cell);
    }
  }
}

function updateToggleButtons() {
  if (!toggleBoardButton || !toggleListButton) {
    return;
  }

  const boardHidden = boardWrapper.classList.contains('hidden');
  const listHidden = listWrapper.classList.contains('hidden');

  toggleBoardButton.textContent = boardHidden ? 'Show board' : 'Hide board';
  toggleListButton.textContent = listHidden ? 'Show raw list' : 'Hide raw list';
}

function setupToggleButtons() {
  if (toggleBoardButton) {
    toggleBoardButton.addEventListener('click', () => {
      boardWrapper.classList.toggle('hidden');
      updateToggleButtons();
    });
  }

  if (toggleListButton) {
    toggleListButton.addEventListener('click', () => {
      listWrapper.classList.toggle('hidden');
      updateToggleButtons();
    });
  }

  updateToggleButtons();
}

async function getPyodide() {
  if (!window.loadPyodide) {
    return null;
  }

  if (!pyodideInstance) {
    pyodideInstance = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });
  }

  return pyodideInstance;
}

async function solveKnightTour(boardSize, startColumn, startRow) {
  const pyodide = await getPyodide();

  if (!pyodide) {
    return 'Pyodide is not loaded yet. Please refresh the page or add the Pyodide script.';
  }

  const scriptPath = '../../projects/knightsRound/git/TourDuCavalier.py';
  const response = await fetch(scriptPath);

  if (!response.ok) {
    throw new Error(`Unable to load the Python solver (${response.status}).`);
  }

  const source = await response.text();

  await pyodide.runPythonAsync(source);

  const result = pyodide.runPython(`setUpAndSolves(${boardSize}, ${startColumn}, ${startRow})`);

  return result;
}

function clearOutputs() {
  boardGrid.innerHTML = '';
  solutionList.textContent = 'No solution yet.';
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const boardSize = Number(document.getElementById('board-size').value);
    const startColumn = Number(document.getElementById('start-column').value);
    const startRow = Number(document.getElementById('start-row').value);

    if (!Number.isInteger(boardSize) || boardSize < 1 || boardSize > 31) {
      resultBox.textContent = 'Board size must be an integer between 1 and 31.';
      clearOutputs();
      return;
    }

    if (!Number.isInteger(startColumn) || !Number.isInteger(startRow)) {
      resultBox.textContent = 'Start column and row must be integers.';
      clearOutputs();
      return;
    }

    resultBox.textContent = 'Solving...';

    try {
      const solution = await solveKnightTour(boardSize, startColumn, startRow);

      if (typeof solution === 'string' && solution.startsWith('Wrong value')) {
        resultBox.textContent = 'Invalid input values. Please try again.';
        clearOutputs();
        return;
      }

      const moves = parseSolutionString(solution);

      if (!moves) {
        resultBox.textContent = solution || 'No solution found.';
        clearOutputs();
        solutionList.textContent = solution || 'No solution found.';
        return;
      }

      renderBoard(boardSize, moves);
      solutionList.textContent = solution;
      resultBox.textContent = `Solution found for a ${boardSize} × ${boardSize} board starting at (${startColumn}, ${startRow}).`;
    } catch (error) {
      resultBox.textContent = `Unable to solve the board: ${error.message}`;
      clearOutputs();
    }
  });
}

setupToggleButtons();
clearOutputs();
