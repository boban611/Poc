const socket = new WebSocket('ws://localhost:3000');

    // Grid dimensions
    const rows = 5;
    const cols = 8;

    // Store the current grid mapping
    let gridMapping = {};

    // Create the grid
    const gridContainer = $('#grid');
    const messageContainer = $('#msgs');
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
      const data= JSON.parse(event.data);
      if(data?.type === "msg"){
        //msg data
        const messageData = data.data;
        messageContainer.empty();

        for(let i = 0; i < messageData.length; i++){
          const msg = messageData[i];
          const p = $(`<p>guest${msg.guestIndex}: ${msg.msg}</p>`);
          messageContainer.append(p);
        }

      }
      else{
        //grid data
        const newGridMapping = data;
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
      }   
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

    $('#sendMsg').click(() => {
      const text = $('#msg').val();
      // console.log("message: ", text);
      const data = { 
        type: 'msg1',
        msg: text
      }
      socket.send(JSON.stringify(data));
    })

