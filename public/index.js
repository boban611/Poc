const socket = new WebSocket('ws://localhost:3000');

    // Grid dimensions
    const rows = 50;
    const cols = 80;

    // Store the current grid mapping
    let gridMapping = {};

    // Create the grid
    const gridContainer = $('#grid');
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = $('<div class="cell green"></div>');
        cell.click(() => {
          toggleCellColor(i, j);
        });
        gridContainer.append(cell);
      }
      gridContainer.append('<br>');
    }

    // Toggle cell color and send update to the server
    function toggleCellColor(row, col) {
      const cell = gridContainer.children('div').eq(row * cols + col);
      const isRed = cell.hasClass('red');

      if (isRed) {
        cell.removeClass('red').addClass('green');
      } else {
        cell.removeClass('green').addClass('red');
      }

      gridMapping[`${row},${col}`] = !isRed;
      socket.send(JSON.stringify(gridMapping));
    }

    // Handle grid updates from the server
    socket.addEventListener('message', event => {
      const newGridMapping = JSON.parse(event.data);
      console.log("here: ", newGridMapping);

      // Update the local grid mapping
      gridMapping = newGridMapping;

      // Update the grid based on the new mapping
      gridContainer.children('div').each(function (index) {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const cell = $(this);

        if (gridMapping[`${row},${col}`]) {
          cell.removeClass('green').addClass('red');
        } else {
          cell.removeClass('red').addClass('green');
        }
      });
    });

    // Undo button functionality
    $('#undoBtn').click(() => {
        $.get("http://localhost:3000/undo").then(data => {
            console.log("undo result: ", data);
        })
        .fail(() => {
            alert("undo failed");
        });
    });