import Draw from './Draw';
import CellFactory from './CellFactory';
import { initialOptions } from './helpers';

export default class {
  constructor(grid, options) {
    this.grid = grid;
    this.options = options;
    this.cellFactory = null;
    this.drawInstance = null;
    this.generate();
  }

  generate() {
    this.cellFactory = new CellFactory(
      this.options.cellNum, 
      this.options.coord
    );
    this.drawInstance = new Draw(this.cellFactory.generateCells());
    this.drawInstance.initialDraw(this.grid);
  }

  resetGrid() {
    this.grid.innerHTML = '';
    this.grid.classList.remove('no-click');
    this.drawInstance.destroy();
    this.options =  { ...this.options, ...initialOptions() };
    this.generate();
  }

  getOption(optionName) {
    return this.options[optionName];
  }

  setOption(optionName, optionValue) {
    this.options[optionName] = optionValue;
  }

  updateGrid(elem) {
    const { found, dragged } = this.options;
    if (!dragged) return;
    if (found && elem.classList.contains('block')) return;
    const elemIndex = +elem.getAttribute('coord');
    if (this.options.Shift) {
      this.setOption(
        'endCoord',
        this.drawInstance.drawEnd(elemIndex, this.options.endCoord && this.options.endCoord.coordIndex)
      );
      found && this.redrawAlgo();
    } else if (this.options.Ctrl) {
      this.drawInstance.drawWall(elemIndex);
    } else {
      this.setOption(
        'startCoord',
        this.drawInstance.drawStart(elemIndex, this.options.startCoord && this.options.startCoord.coordIndex)
      );
      found && this.redrawAlgo();
    }
  }

  startAlgo() {
    if (this.getOption('started')) return;
    const { searchFunction, endCoord, startCoord, coord } = this.options;
    if (endCoord && startCoord) {
      this.setOption('started', true);
      this.grid.classList.add('no-click');
      const cells = this.drawInstance.getCells(); 
      const history = searchFunction(
        cells,
        cells[startCoord.coordIndex], 
        cells[endCoord.coordIndex]
      );
      const historyValues = [...history.keys()];
      let endComputed = endCoord.coordIndex;
      this.drawInstance.showAlgo(historyValues, 0, () => {
        this.drawInstance.drawWay(this.grid, history, endComputed, (found) => {
          this.setOption('found', found);
          found && this.grid.classList.remove('no-click');
        });
      });
    }
  }

  generateMazeOnGrid() {
    const cells = this.cellFactory.generateMazeCells(this.drawInstance.getCells());
    this.resetGrid();
    this.drawInstance.drawMaze(this.grid, cells);
  }

  redrawAlgo() {
    const { searchFunction, endCoord, startCoord, coord, found } = this.options;
    if (endCoord && startCoord && found) {
      const cells = this.drawInstance.getCells(); 
      const history = searchFunction(
        cells,
        cells[startCoord.coordIndex], 
        cells[endCoord.coordIndex]
      );
      const historyValues = [...history.keys()];
      let endComputed = endCoord.coordIndex;
      this.drawInstance.clearChecked();
      this.drawInstance.showAlgoNow(historyValues);
      this.drawInstance.drawWayNow(history, endComputed);
    }
  }
} 