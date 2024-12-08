document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 9;
    const totalMines = 9;
    const squares = document.querySelectorAll('.square');
    let minesPlaced = false;
    let safeSquares = gridSize * gridSize - totalMines;
    let gameOver = false;

    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');
    const popupClose = document.getElementById('popup-close');
    const clickSound = document.getElementById('click-sound');
    const explosionSound = document.getElementById('explosion-sound');
    const fanfareSound = document.getElementById('fanfare-sound');

    // 爆発音とファンファーレの音量を少し下げる
    explosionSound.volume = 0.5;
    fanfareSound.volume = 0.5;

    popupClose.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    function showPopup(message) {
        popupContent.textContent = message;
        popup.style.display = 'block';
    }

    function playSound(sound) {
        sound.currentTime = 0;
        sound.play();
    }

    function placeMines(excludeIndex) {
        const availableIndexes = Array.from({ length: gridSize * gridSize }, (_, i) => i).filter(i => i !== excludeIndex);
        const randomIndexes = [];

        while (randomIndexes.length < totalMines) {
            const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
            if (!randomIndexes.includes(randomIndex)) {
                randomIndexes.push(randomIndex);
            }
        }

        randomIndexes.forEach(index => {
            squares[index].classList.add('has-dot');
            squares[index].innerHTML = '<div class="dot"></div>';
        });
    }

    function countMinesAround(index) {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        let mineCount = 0;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;

                const newRow = row + i;
                const newCol = col + j;

                if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                    const newIndex = newRow * gridSize + newCol;
                    if (squares[newIndex].classList.contains('has-dot')) {
                        mineCount++;
                    }
                }
            }
        }

        return mineCount;
    }

    function revealSquare(index) {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        if (index >= 0 && index < gridSize * gridSize) {
            const square = squares[index];
            if (!square.classList.contains('clicked')) {
                square.classList.add('clicked');
                if (square.classList.contains('has-dot')) {
                    playSound(explosionSound);
                    showPopup('ゲームオーバー');
                    gameOver = true;
                    squares.forEach((s, i) => {
                        if (!s.classList.contains('clicked')) {
                            s.classList.add('clicked');
                            if (!s.classList.contains('has-dot')) {
                                const mineCount = countMinesAround(i);
                                if (mineCount > 0) {
                                    s.textContent = mineCount;
                                }
                            }
                        }
                    });
                } else {
                    playSound(clickSound);
                    const mineCount = countMinesAround(index);
                    if (mineCount > 0) {
                        square.textContent = mineCount;
                    } else {
                        for (let i = -1; i <= 1; i++) {
                            for (let j = -1; j <= 1; j++) {
                                if (!(i === 0 && j === 0)) {
                                    const newRow = row + i;
                                    const newCol = col + j;
                                    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                                        const newIndex = newRow * gridSize + newCol;
                                        revealSquare(newIndex);
                                    }
                                }
                            }
                        }
                    }
                    safeSquares--;
                    if (safeSquares === 0) {
                        playSound(fanfareSound);
                        showPopup('ゲームクリア');
                        squares.forEach(s => {
                            if (!s.classList.contains('clicked')) {
                                s.classList.add('clicked');
                                s.classList.remove('has-dot');
                            }
                        });
                        gameOver = true;
                    }
                }
            }
        }
    }

    squares.forEach((square, index) => {
        square.addEventListener('click', () => {
            if (!minesPlaced) {
                placeMines(index);
                minesPlaced = true;
            }
            if (!gameOver) {
                revealSquare(index);
            }
        });
    });
});
