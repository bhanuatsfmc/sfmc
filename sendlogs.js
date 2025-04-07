<html>
<head>
  <title>Send Data Viewer</title>
  <style>
    body, a, input, td, th {font-family:sans-serif; font-size:12px;}
    table {border-collapse: collapse; width: 100%;}
    th, td {border: 1px solid #ddd; padding: 8px; text-align: left;}
    th {background-color: #f2f2f2;}
    .error {color: red;}
    .pagination {margin-top: 20px;}
  </style>
</head>
<body>

<script runat="server">
  Platform.Load("core","1.1.1");
  
  try {
    // Configuration - make sure these match your environment
    var deName = "send_pro"; // Add your actual DE name here
    var batchSize = 50;
    var dateFormat = "yyyy-MM-dd";
    
    // Using hardcoded values for testing
    var startDate = "2025-03-01";
    var endDate = "2025-03-30";
    var currentPage = 1;
    var dateField = "SendDate"; // Field name in your DE
    
    // Initialize response variables
    var sends = [];
    var totalCount = 0;
    var totalPages = 0;
    var errorMessage = "";
    
    // Main processing
    if (startDate && endDate) {
      var proxy = new Script.Util.WSProxy();
      var cols = ["SendID", "EmailName", "SendDate", "Subject"];
      
      // Proper filter construction
      var filter = {
        Property: dateField,
        SimpleOperator: "between",
        Value: [startDate + "T00:00:00", endDate + "T23:59:59"]
      };
      
      var options = {
        BatchSize: batchSize,
        Page: currentPage
      };
      
      // Corrected WSProxy call with proper DataExtensionObject syntax
      var result = proxy.retrieve("DataExtensionObject[" + deName + "]", cols, filter, options);
      
      if (result && result.Results) {
        sends = result.Results;
        totalCount = result.TotalCount;
        totalPages = Math.ceil(totalCount / batchSize);
      } else {
        errorMessage = "No results found for the specified date range.";
      }
    }
    
  } catch (e) {
    errorMessage = "Error: " + Stringify(e.message || e);
  }
</script>

<h1>Send Data Report</h1>

<!-- Display error if any -->
<script runat="server">
  if (errorMessage) {
    Write('<div class="error">' + errorMessage + '</div>');
  }
</script>

<!-- Date range display -->
<div>
  <strong>Date Range:</strong> 
  <script runat="server">Write(startDate + " to " + endDate);</script>
</div>

<!-- Results table -->
<script runat="server">
  if (sends.length > 0) {
    Write('<table>');
    Write('<tr><th>Send ID</th><th>Email Name</th><th>Send Date</th><th>Subject</th></tr>');
    
    for (var i = 0; i < sends.length; i++) {
      var send = sends[i];
      Write('<tr>');
      Write('<td>' + (send.SendID || '') + '</td>');
      Write('<td>' + (send.EmailName || '') + '</td>');
      Write('<td>' + (send.SendDate || '') + '</td>');
      Write('<td>' + (send.Subject || '') + '</td>');
      Write('</tr>');
    }
    
    Write('</table>');
    
    // Pagination info
    Write('<div class="pagination">');
    Write('Showing page ' + currentPage + ' of ' + totalPages + ' (Total records: ' + totalCount + ')');
    Write('</div>');
  } else if (!errorMessage) {
    Write('<p>No send data found for the specified criteria.</p>');
  }
</script>

</body>
</html>
