const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Установка параметров подключения к MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Neltarion158!',
    database: 'zoodb'
};

// Создание пула соединений с базой данных MySQL
const pool = mysql.createPool(dbConfig);

// Маршрут для получения данных
app.get('/get_employee', (req, res) => {
    // Выполнение SQL-запроса для получения данных
    const query = `
    SELECT employee.idEmployee, employee.FullName, DATE_FORMAT(employee.BirthDate, '%d.%m.%Y') AS BirthDate, Post.Name AS Post
    FROM employee
    INNER JOIN Post ON employee.idPost = Post.idPost;
    `;

    // Получение данных из базы данных
    pool.query(query, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка при выполнении SQL-запроса' });
        } else {
            res.json(results);
        }
    });
});
app.get('/get_animal', (req, res) => {
    // Выполнение SQL-запроса для получения данных
    const query = `
    SELECT animal.idAnimal, animal.Nickname, DATE_FORMAT(animal.ArriveDate, '%d.%m.%Y') AS ArriveDate, 
    DATE_FORMAT(animal.BirthDate, '%d.%m.%Y') AS BirthDate, employee.FullName AS Employee
    FROM animal
    JOIN employee ON animal.idEmployee = employee.idEmployee;
    `;

    // Получение данных из базы данных
    pool.query(query, (error, results) => {
        if (error) {
            console.error(error);
            res.status(500).json({ error: 'Ошибка при выполнении SQL-запроса' });
        } else {
            res.json(results);
        }
    });
});



// Маршрут для вставки данных
app.post('/push_data', (req, res) => {
    console.log(req.body);
    const { addedRows, editedRows, deletedRows, tableName } = req.body;
    if (tableName = "animal") {
        addedRows.forEach((row) => {
            const query = `
            INSERT INTO ${tableName} (Nickname, BirthDate, ArriveDate, idEmployee)
            VALUES (?, STR_TO_DATE(?, '%d.%m.%Y'), STR_TO_DATE(?, '%d.%m.%Y'), (SELECT idEmployee FROM employee WHERE Name = ? LIMIT 1));
            `;
            const values = [row.Nickname, row.BirthDate, row.ArriveDate, row.Employee];
            pool.query(query, values, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Ошибка при выполнении SQL-запроса' });
                }
            });
        });
        editedRows.forEach((row) => {
            const query = `
            UPDATE ${tableName}
            SET Nickname = ?,
            BirthDate = str_to_date(?, '%d.%m.%Y'),
            ArriveDate = str_to_date(?, '%d.%m.%Y'),
            idEmployee = (SELECT idEmployee FROM employee WHERE Name = ? LIMIT 1)
            WHERE idAnimal = ?;
            `;

            const values = [row.Nickname, row.BirthDate, row.ArriveDate, row.Employee];

            pool.query(query, values, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Ошибка при выполнении SQL-запроса' });
                }
            });
        });


    }
    else {
        console.log(addedRows);
        if (!addedRows || !Array.isArray(addedRows)) {
            return res.status(400).json({ error: 'Invalid addedRows data' });
        }

        // Выполнение SQL-запроса для вставки данных
        addedRows.forEach((row) => {
            const query = `
            INSERT INTO ${tableName} (FullName, BirthDate, idPost)
            VALUES (?, STR_TO_DATE(?, '%d.%m.%Y'), (SELECT idPost FROM Post WHERE Name = ? LIMIT 1));
          `;

            const values = [row.FullName, row.BirthDate, row.Post];

            // Выполнение запроса на вставку данных
            pool.query(query, values, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Ошибка при выполнении SQL-запроса' });
                }
            });
        });

        editedRows.forEach((row) => {
            const query = `
            UPDATE ${tableName}
            SET FullName = ?,
            BirthDate = str_to_date(?, '%d.%m.%Y'),
            idPost = (SELECT idPost FROM Post WHERE Name = ? LIMIT 1)
            WHERE idEmployee = ?;
            `;

            const values = [row.FullName, row.BirthDate, row.Post, row.idEmployee];

            pool.query(query, values, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Ошибка при выполнении SQL-запроса' });
                }
            });
        });

        deletedRows.forEach((row) => {
            const query = `
            DELETE FROM ${tableName}
            WHERE idEmployee = ?;
            `;
            const value = [row.idEmployee];
            pool.query(query, value, (error) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({ error: 'Ошибка при выполнении SQL-запроса' });
                }
            });
        });
    }


    res.json({ success: true });
});
// Запуск сервера
app.listen(5000, () => {
    console.log('Сервер запущен на порту 5000');
});
