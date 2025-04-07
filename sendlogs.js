<html>
<head>
  <title>Send Data Viewer</title>
  <style>
    body, input, td, th {
      font-family: sans-serif;
      font-size: 14px;
    }
    form {
      text-align: center;
      margin-top: 20px;
    }
    input[type="date"] {
      padding: 5px;
      margin: 0 10px;
    }
    input[type="submit"] {
      padding: 6px 12px;
    }
    table {
      width: 80%;
      margin: 20px auto;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
    }
    th {
      background-color: #f2f2f2;
    }
    .pagination {
      text-align: center;
      margin-top: 20px;
    }
    .pagination a {
      margin: 0 5px;
      text-decoration: none;
      padding: 5px 10px;
      border: 1px solid #ccc;
      background: #f9f9f9;
    }
    .pagination a.active {
      background: #0070d2;
      color: white;
      border-color: #0070d2;
    }
  </style>
</head>
<body>

<script runat="server">
Platform.Load("core", "1.1.1");

try {
    // Configuration
    var deName = "YourDataExtensionName"; // Replace with your DE name
    var pageSize = 10;
    
    // Get parameters from URL
    var startDateStr = Request.GetQueryStringParameter("startDate");
    var endDateStr = Request.GetQueryStringParameter("endDate");
    var currentPage = parseInt(Request.GetQueryStringParameter("page") || 1);
    
    // Form (always render)
    Write("<form method='get'>");
    Write("Start Date: <input type='date' name='startDate' value='" + (startDateStr || "") + "' required />");
    Write("End Date: <input type='date' name='endDate' value='" + (endDateStr || "") + "' required />");
    Write("<input type='submit' value='Filter' />");
    Write("</form>");

    // Only process if both dates are provided
    if (startDateStr && endDateStr) {
        var proxy = new Script.Util.WSProxy();
        var cols = ["SendID", "EmailName", "SendDate", "Subject"];
        
        // Create filter for date range
        var filter = {
            Property: "SendDate",
            SimpleOperator: "between",
            Value: [startDateStr + "T00:00:00", endDateStr + "T23:59:59"]
        };
        
        // Pagination options
        var options = {
            BatchSize: pageSize,
            Page: currentPage
        };
        
        // Retrieve data using WSProxy
        var result = proxy.retrieve("DataExtensionObject[" + deName + "]", cols, filter, options);
        
        if (result && result.Results) {
            var totalCount = result.TotalCount;
            var totalPages = Math.ceil(totalCount / pageSize);
            var rows = result.Results;
            
            Write("<h3 style='text-align:center;'>Filtered Results</h3>");
            Write("<p style='text-align:center;'>Showing records from " + startDateStr + " to " + endDateStr + "</p>");

            if (rows.length > 0) {
                // Display table
                Write("<table><thead><tr><th>SendID</th><th>Email Name</th><th>Send Date</th><th>Subject</th></tr></thead><tbody>");
                for (var i = 0; i < rows.length; i++) {
                    var row = rows[i];
                    Write("<tr>");
                    Write("<td>" + (row.SendID || "") + "</td>");
                    Write("<td>" + (row.EmailName || "") + "</td>");
                    Write("<td>" + (row.SendDate || "") + "</td>");
                    Write("<td>" + (row.Subject || "") + "</td>");
                    Write("</tr>");
                }
                Write("</tbody></table>");

                // Pagination controls
                if (totalPages > 1) {
                    var baseUrl = Request.URL.split('?')[0];
                    var queryParams = "startDate=" + startDateStr + "&endDate=" + endDateStr;
                    
                    Write("<div class='pagination'>");
                    
                    // Previous link
                    if (currentPage > 1) {
                        Write("<a href='" + baseUrl + "?" + queryParams + "&page=" + (currentPage - 1) + "'>&laquo; Previous</a>");
                    }
                    
                    // Page numbers
                    for (var p = 1; p <= totalPages; p++) {
                        if (p == currentPage) {
                            Write("<a class='active' href='#'>" + p + "</a>");
                        } else {
                            Write("<a href='" + baseUrl + "?" + queryParams + "&page=" + p + "'>" + p + "</a>");
                        }
                    }
                    
                    // Next link
                    if (currentPage < totalPages) {
                        Write("<a href='" + baseUrl + "?" + queryParams + "&page=" + (currentPage + 1) + "'>Next &raquo;</a>");
                    }
                    
                    Write("</div>");
                }
            } else {
                Write("<p style='text-align:center;'>No records found in the selected date range.</p>");
            }
        } else {
            Write("<p style='text-align:center;'>No data available for the selected criteria.</p>");
        }
    }
} catch (ex) {
    Write("<p style='color:red;'>Error: " + Stringify(ex.message || ex) + "</p>");
}
</script>

</body>
</html>
