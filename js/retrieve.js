const mysql = require('mysql');
const smartsheet = require('smartsheet');

// Connect to SQL database
const connection = mysql.createConnection({
  host: 'your_host',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database'
});

connection.connect();

// Retrieve data from SQL database
connection.query('SELECT * FROM your_table', function (error, results, fields) {
  if (error) throw error;

  // Format data for Smartsheet
  const rows = results.map(result => {
    return {
      toTop: true,
      cells: [
        { value: result.EmployeeName },
        { value: result.LeadStatus },
        { value: result.TimeIn },
        { value: result.TimeOut },
        { value: result.Incentive },
        { value: result.Notes }
      ]
    };
  });

  // Connect to Smartsheet API
  const smartsheetClient = smartsheet.createClient({
    accessToken: 'your_access_token'
  });

  // Import data into Smartsheet
  smartsheetClient.sheets.addRows({
    sheetId: 'your_sheet_id',
    rows: rows
  })
  .then(() => {
    console.log('Data imported successfully to Smartsheet.');
  })
  .catch(err => {
    console.error('Error importing data to Smartsheet:', err);
  });
});

connection.end();
