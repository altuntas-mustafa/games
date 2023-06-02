import React, { useEffect, useState } from 'react';

const SnakeGameInstance = () => {
  const COLS = 26;
  const ROWS = 26;

  const EMPTY = 0;
  const SNAKE = 1;
  const FRUIT = 2;

  const LEFT = 0;
  const UP = 1;
  const RIGHT = 2;
  const DOWN = 3;

  const KEY_LEFT = 37;
  const KEY_UP = 38;
  const KEY_RIGHT = 39;
  const KEY_DOWN = 40;

  let canvas;
  let ctx;
  let keystate;
  let frames;
  let score;
  let grid;
  let snake;

  const [isGameRunning, setIsGameRunning] = useState(false);

  useEffect(() => {
    if (isGameRunning) {
      initializeGame();
      gameLoop();
    }

    return () => {
      setIsGameRunning(false);
    };
  }, [isGameRunning]);

  const initializeGame = () => {
    canvas = document.createElement('canvas');
    canvas.width = COLS * 20;
    canvas.height = ROWS * 20;
    ctx = canvas.getContext('2d');

    document.body.appendChild(canvas);

    ctx.font = '12px Helvetica';

    frames = 0;
    keystate = {};
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    init();
  };

  const handleKeyDown = (evt) => {
    keystate[evt.keyCode] = true;
  };

  const handleKeyUp = (evt) => {
    delete keystate[evt.keyCode];
  };

  const init = () => {
    score = 0;

    grid = {
      width: null,
      height: null,
      _grid: null,

      init: function (d, c, r) {
        this.width = c;
        this.height = r;

        this._grid = [];
        for (let x = 0; x < c; x++) {
          this._grid.push([]);
          for (let y = 0; y < r; y++) {
            this._grid[x].push(d);
          }
        }
      },

      set: function (val, x, y) {
        this._grid[x][y] = val;
      },

      get: function (x, y) {
        return this._grid[x][y];
      },
    };

    snake = {
      direction: null,
      last: null,
      _queue: null,

      init: function (d, x, y) {
        this.direction = d;

        this._queue = [];
        this.insert(x, y);
      },

      insert: function (x, y) {
        this._queue.unshift({ x: x, y: y });
        this.last = this._queue[0];
      },

      remove: function () {
        return this._queue.pop();
      },
    };

    grid.init(EMPTY, COLS, ROWS);

    const sp = { x: Math.floor(COLS / 2), y: ROWS - 1 };
    snake.init(UP, sp.x, sp.y);
    grid.set(SNAKE, sp.x, sp.y);

    setFood();
  };

  const setFood = () => {
    const empty = [];
    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y < grid.height; y++) {
        if (grid.get(x, y) === EMPTY) {
          empty.push({ x: x, y: y });
        }
      }
    }
    const randpos = empty[Math.floor(Math.random() * empty.length)];
    grid.set(FRUIT, randpos.x, randpos.y);
  };

  const gameLoop = () => {
    update();
    draw();
    if (isGameRunning) {
      window.requestAnimationFrame(gameLoop);
    }
  };

  const update = () => {
    frames++;

    if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
      snake.direction = LEFT;
    }
    if (keystate[KEY_UP] && snake.direction !== DOWN) {
      snake.direction = UP;
    }
    if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
      snake.direction = RIGHT;
    }
    if (keystate[KEY_DOWN] && snake.direction !== UP) {
      snake.direction = DOWN;
    }

    if (frames % 5 === 0) {
      let nx = snake.last.x;
      let ny = snake.last.y;

      switch (snake.direction) {
        case LEFT:
          nx--;
          break;
        case UP:
          ny--;
          break;
        case RIGHT:
          nx++;
          break;
        case DOWN:
          ny++;
          break;
      }

      if (
        nx < 0 ||
        nx >= grid.width ||
        ny < 0 ||
        ny >= grid.height ||
        grid.get(nx, ny) === SNAKE
      ) {
        return init();
      }

      if (grid.get(nx, ny) === FRUIT) {
        score++;
        setFood();
      } else {
        const tail = snake.remove();
        grid.set(EMPTY, tail.x, tail.y);
      }

      grid.set(SNAKE, nx, ny);
      snake.insert(nx, ny);
    }
  };

  const draw = () => {
    const tw = canvas.width / grid.width;
    const th = canvas.height / grid.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y < grid.height; y++) {
        const squareX = x * tw;
        const squareY = y * th;

        // Draw the square
        ctx.fillStyle = '#fff';
        ctx.fillRect(squareX, squareY, tw, th);

        // Draw the border line
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(squareX, squareY, tw, th);

        // Draw the content (snake, fruit)
        switch (grid.get(x, y)) {
          case SNAKE:
            ctx.fillStyle = '#0ff';
            ctx.fillRect(squareX, squareY, tw, th);
            break;
          case FRUIT:
            ctx.fillStyle = '#f00';
            ctx.fillRect(squareX, squareY, tw, th);
            break;
        }
      }
    }
    ctx.fillStyle = '#000';
    ctx.fillText('SCORE: ' + score, 10, canvas.height - 10);
  };

  useEffect(() => {
    setIsGameRunning(true);
    return () => {
      setIsGameRunning(false);
    };
  }, []);

  return <></>;
};

export default SnakeGameInstance;
