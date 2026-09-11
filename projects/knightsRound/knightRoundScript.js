const form = document.getElementById('knight-round-form');
const resultBox = document.getElementById('test-result');

async function solveKnightTour(boardSize, startColumn, startRow) {
  if (!window.loadPyodide) {
    return 'Pyodide is not loaded yet. Please refresh the page or add the Pyodide script.';
  }

  const pyodide = await window.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
  });

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

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const boardSize = Number(document.getElementById('board-size').value);
    const startColumn = Number(document.getElementById('start-column').value);
    const startRow = Number(document.getElementById('start-row').value);

    if (!Number.isInteger(boardSize) || boardSize < 1 || boardSize > 31) {
      resultBox.textContent = 'Board size must be an integer between 1 and 31.';
      return;
    }

    if (!Number.isInteger(startColumn) || !Number.isInteger(startRow)) {
      resultBox.textContent = 'Start column and row must be integers.';
      return;
    }

    resultBox.textContent = 'Solving...';

    try {
      const solution = await solveKnightTour(boardSize, startColumn, startRow);
      resultBox.textContent = solution;
    } catch (error) {
      resultBox.textContent = `Unable to solve the board: ${error.message}`;
    }
  });
}
