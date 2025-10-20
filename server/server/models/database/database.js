import sql from 'mssql/msnodesqlv8.js';
import dotenv from 'dotenv';
import { userTablesQuery } from './user-tables-query.js';
import { nutritionTablesQuery } from './nutrition-tables-query.js';
import { chatTablesQuery } from './chat-tables-query.js';
import { adminQuery } from './admin-query.js';
import { communityTablesQuery } from './community-tables-query.js';
import { trainingQuery } from './training-query.js';

dotenv.config();

export default class Database {
    static pool;
    static sqlConnection = {
        connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=The_Kratos_Hub;Trusted_Connection=Yes;'
    }

    static async init() {
        try {
            // Ensuring The_Kratos_Hub DB exist
            const masterConnection = {
                connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=master;Trusted_Connection=Yes;'
            };
            const masterPool = await sql.connect(masterConnection);
            await masterPool.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'The_Kratos_Hub')
                BEGIN
                    CREATE DATABASE [The_Kratos_Hub];
                END
            `);

            // Closing and destroying master connection
            await masterPool.close();

            // Initializing DB pool
            if (!Database.pool) {
                Database.pool = await sql.connect(Database.sqlConnection);
            }

            // Ensuring The_Kratos_Hub tables exist
            const queryString = userTablesQuery() + "\n" + nutritionTablesQuery() + "\n" + 
            chatTablesQuery() + "\n" + adminQuery() + "\n" + communityTablesQuery() + "\n" + trainingQuery();
            await Database.pool.request().query(queryString);

            // Return connection info
            const connectionInformation = Database.parseConnectionString(Database.sqlConnection.connectionString);
            return connectionInformation;
        } catch (err) {
            console.error("Database connection/init error:", err);
            throw new Error(`Database connection/init error: ${err}`);
        }
    }

    static getPool() {
        if (!Database.pool) {
            throw new Error("Server failed to connect to the database.\nError: DB connection failed.");
        }
        return Database.pool;
    }

    static getRequest(transaction = null) {
        return transaction ? transaction.request() : Database.pool.request();
    }

    static addInput(request, name, type, value) {
        request.input(name, type, value ?? null);
    }

    static async runTransaction(func) {
        const transaction = new sql.Transaction(Database.pool);
        try {
            await transaction.begin();
            const result = await func(transaction);
            await transaction.commit();
            return result;
        } catch (err) {
            try { await transaction.rollback(); } catch (rollbackErr) {
                console.error("Rollback error:", rollbackErr);
            }
            throw err;
        }
    }

    static parseConnectionString(connStr) {
        const toCamelCase = (str) =>
            str.toLowerCase().replace(/[_\s](\w)/g, (_, c) => c.toUpperCase());

        return connStr
            .split(';')
            .filter(Boolean)
            .map(pair => pair.split('='))
            .reduce((acc, [key, value]) => {
                acc[toCamelCase(key.trim())] = value?.trim();
                return acc;
            }, {});
    }
}