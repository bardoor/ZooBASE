var table;
var jsonData;
var deletedRows = [];    // Массив удаленных строк
var addedRows = [];      // Массив добавленных строк
var editedRows = [];     // Массив измененных строк
var tableName;

document.getElementById('employeeBase').addEventListener("click", function () {
  tableName = "employee"
  fetch('http://localhost:5000/get_employee')
    .then(response => response.json())
    .then(jsonData => {

      // Добавление должностей в выпадающее меню таблицы
      var positions = [...new Set(jsonData.map(item => item.Post))];
      // Инициализация Tabulator и передача данных JSON в таблицу
      table = new Tabulator("#main-table", {
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 25,
        paginationSizeSelector: [8, 10, 15, 25, 35, 50, 100],
        movableColumns: true,
        data: jsonData,
        paginationCounter: "rows",
        selectable: true,
        columns: [
          { title: "ID", field: "idEmployee", visible: false },
          { title: "ФИО", field: "FullName", editor: "input", headerFilter: "input" },
          {
            title: "Должность", field: "Post", editor: "list",
            headerFilter: true, headerFilterParams: {
              values: {
                "": "Не выбрано",
                ...positions.reduce((obj, position) => ({ ...obj, [position]: position }), {})
              }
            },
            editorParams: { values: positions.reduce((obj, position) => ({ ...obj, [position]: position }), {}) }
          },
          {
            title: "Дата рождения", field: "BirthDate", hozAlign: "center", sorter: "date",
            sorterParams: { format: "dd.MM.yyyy", alignEmptyValues: "top" },
            editor: "date",
            editorParams: {
              min: "01.01.1900", // the minimum allowed value for the date picker
              format: "dd.MM.yyyy", // the format of the date value stored in the cell
              elementAttributes: {
                title: "slide bar to choose option" // custom tooltip
              }
            },
            headerFilter: "input"
          }
        ],
      });

      table.on("cellEdited", function (cell) {
        var row = cell.getRow().getData();
        if (!editedRows.includes(row)) {
          editedRows.push(row);
        }
        document.getElementById("apply-btn").removeAttribute("disabled");
      });

      table.on("rowAdded", function (row) {
        var rowData = row.getData();
        if (!addedRows.includes(rowData)) {
          addedRows.push(rowData);
        }
      });

      table.on("rowDeleted", function (row) {
        var rowData = row.getData();
        if (!deletedRows.includes(rowData)) {
          deletedRows.push(rowData);
        }
      });


    })
    .catch(error => {

    });
});

document.getElementById('animalBase').addEventListener("click", function () {
  tableName = "animal";
  fetch('http://localhost:5000/get_animal')
    .then(response => response.json())
    .then(jsonData => {

      var employeeNames = [...new Set(jsonData.map(item => item.Employee))];

      // Инициализация Tabulator и передача данных JSON в таблицу
      table = new Tabulator("#main-table", {
        layout: "fitColumns",
        pagination: "local",
        paginationSize: 25,
        paginationSizeSelector: [8, 10, 15, 25, 35, 50, 100],
        movableColumns: true,
        data: jsonData,
        paginationCounter: "rows",
        selectable: true,
        columns: [
          { title: "ID", field: "idAnimal", visible: false },
          { title: "Кличка", field: "Nickname", editor: "input", headerFilter: "input" },
          {
            title: "Кипер", field: "Employee", editor: "list",
            headerFilter: true, headerFilterParams: {
              values: {
                "": "Не выбрано",
                ...employeeNames.reduce((obj, name) => ({ ...obj, [name]: name }), {})
              }
            },
            editorParams: { values: employeeNames.reduce((obj, name) => ({ ...obj, [name]: name }), {}) }
          },

          {
            title: "Дата рождения", field: "BirthDate", hozAlign: "center", sorter: "date",
            sorterParams: { format: "dd.MM.yyyy", alignEmptyValues: "top" },
            editor: "date",
            editorParams: {
              min: "01.01.1900", // the minimum allowed value for the date picker
              format: "dd.MM.yyyy", // the format of the date value stored in the cell
              elementAttributes: {
                title: "slide bar to choose option" // custom tooltip
              }
            },
            headerFilter: "input"
          },
          {
            title: "Дата приезда", field: "ArriveDate", hozAlign: "center", sorter: "date",
            sorterParams: { format: "dd.MM.yyyy", alignEmptyValues: "top" },
            editor: "date",
            editorParams: {
              min: "01.01.1900", // the minimum allowed value for the date picker
              format: "dd.MM.yyyy", // the format of the date value stored in the cell
              elementAttributes: {
                title: "slide bar to choose option" // custom tooltip
              }
            },
            headerFilter: "input"
          }
        ],
      });

      table.on("cellEdited", function (cell) {
        var row = cell.getRow().getData();
        if (!editedRows.includes(row)) {
          editedRows.push(row);
        }
        document.getElementById("apply-btn").removeAttribute("disabled");
      });

      table.on("rowAdded", function (row) {
        var rowData = row.getData();
        if (!addedRows.includes(rowData)) {
          addedRows.push(rowData);
        }
      });

      table.on("rowDeleted", function (row) {
        var rowData = row.getData();
        if (!deletedRows.includes(rowData)) {
          deletedRows.push(rowData);
        }
      });

    })
    .catch(error => {
      console.log(error.toString());
    });
});

document.getElementById('add-btn').addEventListener("click", function () {
  table.addRow({}, true);
});

document.getElementById('del-btn').addEventListener("click", function () {
  var selectedRows = table.getSelectedRows();
  selectedRows.forEach(function (row) {
    row.delete(); // Удалить строку, содержащую выбранную ячейку
  });
});

document.getElementById('apply-btn').addEventListener("click", function () {

  // Удаляем из добавленных и изменённых элементов те, что были впоследствии удалены
  const deletedIdsArray = deletedRows.map(deletedRow => deletedRow.idEmployee);

  addedRows = addedRows.filter(addedRow => {
    // Проверяем, содержится ли элемент в editedRows по idEmployee
    return !editedRows.some(editedRow => editedRow.idEmployee === addedRow.idEmployee);
  });
  editedRows = editedRows.filter(editedRow => !deletedIdsArray.includes(editedRow.idEmployee));

  console.log("Удаленные строки:", deletedRows);
  console.log("Добавленные строки:", addedRows);
  console.log("Измененные строки:", editedRows);

  const data = {
    addedRows: addedRows,
    editedRows: editedRows,
    deletedRows: deletedRows,
    tableName: tableName
  };

  fetch('http://localhost:5000/push_data', {
    method: 'POST', // Используйте нужный HTTP метод
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        console.log("Успешно");
      } else {
        console.log("безуспешно");
      }
    })
    .catch(error => {
      console.log("Ошибка отправки данных на сервер " + error);
    });

  document.getElementById("apply-btn").setAttribute("disabled", "disabled");
});

$(document).ready(function () {
  $('.mdb-select').materialSelect();
});