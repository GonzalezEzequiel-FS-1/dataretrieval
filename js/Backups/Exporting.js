const axios = require('axios');
const mysql = require('mysql');

// Database connection configuration
const dbConfig = {
    host: '23.117.213.174',
    port: 3369,
    user: 'Zeke',
    password: 'TrashPanda6000',
    database: 'Health_Services'
};

// Smartsheet API token
const API_TOKEN = 'vwM6AHwhUlFPs5pLk5WIqzt82FSqWkoOeIqyp';
// Workspace ID
const WORKSPACE_ID = '6786735758698372';

// Function to create a new sheet with specified columns
async function createSmartsheetForTable(tableName, columns) {
    try {
        // Define columns for Smartsheet
        const smartsheetColumns = columns.map(column => ({
            title: column,
            primary: column === "Employee Name", // Mark "EmployeeName" as primary
            type: "TEXT_NUMBER" // Assuming all columns are of type TEXT_NUMBER, you can adjust as needed
        }));

        // Create sheet payload
        const payload = {
            name: `${tableName} - ${getCurrentDateTime()}`,
            columns: smartsheetColumns
        };

        // Set up request headers
        const headers = {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        };

        // Make POST request to create sheet within workspace
        const response = await axios.post(`https://api.smartsheet.com/2.0/workspaces/${WORKSPACE_ID}/sheets`, payload, { headers });

        console.log(`New Smartsheet for table ${tableName} created with ID:`, response.data.result.id);
    } catch (error) {
        console.error(`Error creating Smartsheet for table ${tableName}:`, error.response.data);
    }
}

// Function to get current date and time in a formatted string
function getCurrentDateTime() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// Attempt to connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    
    console.log('Database connection successful');
    
    // Define tables and columns
    const tables = [
        { name: 'CityWalk Schedule', columns: ["Employee Name", "Lead Status", "Time In", "Time Out", "Incentive", "Notes"] },
        { name: 'Epic Schedule', columns: ["Employee Name", "Lead Status", "Time In", "Time Out", "Incentive", "Notes"] },
        { name: 'IOA Schedule', columns: ["Employee Name", "Lead Status", "Time In", "Time Out", "Incentive", "Notes"] },
        { name: 'Not Park Based Schedule', columns: ["Employee Name", "Lead Status", "Time In", "Time Out", "Incentive", "Notes"] },
        { name: 'Volcano Bay Schedule', columns: ["Employee Name", "Lead Status", "Time In", "Time Out", "Incentive", "Notes"] },
        { name: 'USF Schedule', columns: ["Employee Name", "Lead Status", "Time In", "Time Out", "Incentive", "Notes"] }
    ];

    // Iterate over tables and create Smartsheets
    tables.forEach(table => {
        createSmartsheetForTable(table.name, table.columns);
    });

    // Close the connection when done
    connection.end();
});
