// Import required modules
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

// Define columns for each table
const tableColumns = {
    'CityWalkSchedule': [
        { title: 'EmployeeName', primary: true, type: 'TEXT_NUMBER' },
        { title: 'LeadStatus', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeIn', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeOut', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Incentive', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Notes', primary: false, type: 'TEXT_NUMBER' }
    ],
    'EpicSchedule': [
        { title: 'EmployeeName', primary: true, type: 'TEXT_NUMBER' },
        { title: 'LeadStatus', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeIn', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeOut', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Incentive', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Notes', primary: false, type: 'TEXT_NUMBER' }
    ],
    'IOASchedule': [
        { title: 'EmployeeName', primary: true, type: 'TEXT_NUMBER' },
        { title: 'LeadStatus', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeIn', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeOut', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Incentive', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Notes', primary: false, type: 'TEXT_NUMBER' }
    ],
    'NotParkBasedSchedule': [
        { title: 'EmployeeName', primary: true, type: 'TEXT_NUMBER' },
        { title: 'LeadStatus', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeIn', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeOut', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Incentive', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Notes', primary: false, type: 'TEXT_NUMBER' }
    ],
    'VolcanoBaySchedule': [
        { title: 'EmployeeName', primary: true, type: 'TEXT_NUMBER' },
        { title: 'LeadStatus', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeIn', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeOut', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Incentive', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Notes', primary: false, type: 'TEXT_NUMBER' }
    ],
    'USFSchedule': [
        { title: 'EmployeeName', primary: true, type: 'TEXT_NUMBER' },
        { title: 'LeadStatus', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeIn', primary: false, type: 'TEXT_NUMBER' },
        { title: 'TimeOut', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Incentive', primary: false, type: 'TEXT_NUMBER' },
        { title: 'Notes', primary: false, type: 'TEXT_NUMBER' }
    ]
};

// Function to create a new sheet with specified columns
async function createSmartsheetForTable(tableName, columns) {
    try {
        // Create sheet payload
        const payload = {
            name: `${tableName} - ${getCurrentDateTime()}`,
            columns: columns
        };

        // Set up request headers
        const headers = {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
        };

        // Make POST request to create sheet within workspace
        const response = await axios.post(`https://api.smartsheet.com/2.0/workspaces/${WORKSPACE_ID}/sheets`, payload, { headers });
        
        console.log(`New Smartsheet for table ${tableName} created with ID:`, response.data.result.id);

        // Return the Smartsheet ID
        return response.data.result.id;
    } catch (error) {
        console.error(`Error creating Smartsheet for table ${tableName}:`, error.response.data);
        throw error; // Rethrow the error to handle it elsewhere if needed
    }
}

// Function to get current date and time in a formatted string
const getCurrentDateTime = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// Function to fetch data from the database
const queryDatabase = (query) => {
    return new Promise((resolve, reject) => {
        connection.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// Create a connection to the database
const connection = mysql.createConnection(dbConfig);

// Attempt to connect to the database
connection.connect(async (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    
    console.log('Database connection successful');
    
    try {
        // Define tables to fetch data from
        const tables = ['CityWalkSchedule', 'EpicSchedule', 'IOASchedule', 'NotParkBasedSchedule', 'VolcanoBaySchedule', 'USFSchedule'];

        // Iterate over tables and create Smartsheets
        for (const table of tables) {
            // Get columns for the current table
            const columns = tableColumns[table];
            
            // Create Smartsheet with columns
            const sheetId = await createSmartsheetForTable(table, columns);
            
            // Fetch data from database
            const results = await queryDatabase(`SELECT * FROM ${table}`);
            
            // Check if there are results
            if (results && results.length > 0) {
                // Log retrieved data to console
                console.log(`Data retrieved from table ${table}:`, results);
                
                // Extract data rows
                const data = results.map(row => Object.values(row));
                
                // Update Smartsheet with fetched data
                await updateSmartsheet(sheetId, data);
            } else {
                console.log(`No data found in table ${table}, skipping update of Smartsheet`);
            }
        }
        
        // Close the connection when done
        connection.end();
    } catch (error) {
        console.error('Error:', error);
        connection.end(); // Close the connection in case of error
    }
});

// Function to update existing Smartsheet with data
async function updateSmartsheet(sheetId, data) {
    async function updateSmartsheet(sheetId, data) {
        try {
            const headers = {
                'Authorization': `Bearer ${API_TOKEN}`,
                'Content-Type': 'application/json'
            };
            
            const payload = {
                rows: data.map(row => ({
                    toBottom: true,
                    cells: row.map(value => ({ value }))
                }))
            };
    
            const response = await axios.post(`https://api.smartsheet.com/2.0/sheets/${sheetId}/rows`, payload, { headers });
    
            console.log(`Data updated in Smartsheet with ID ${sheetId}`);
        } catch (error) {
            console.error(`Error updating data in Smartsheet with ID ${sheetId}:`, error.response.data);
        }
    }
}
