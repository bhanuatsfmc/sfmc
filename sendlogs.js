<html>
<head>
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
  </style>
</head>
<body>

<script runat="server">
Platform.Load("core", "1");

try {
    var deKey = Request.GetQueryStringParameter("deKey") || "F16FC2FB-F8FD-4137-B97C-6814278847E7";
    var startDateStr = Request.GetQueryStringParameter("startDate");
    var endDateStr = Request.GetQueryStringParameter("endDate");
    var currentPage = parseInt(Request.GetQueryStringParameter("page") || "1", 10);
    var pageSize = 10;

    // Form (always render)
    Write("<form method='get'>");
    Write("<input type='hidden' name='deKey' value='" + deKey + "' />");
    Write("Start Date: <input type='date' name='startDate' value='" + (startDateStr || "") + "' required />");
    Write("End Date: <input type='date' name='endDate' value='" + (endDateStr || "") + "' required />");
    Write("<input type='submit' value='Filter' />");
    Write("</form>");

    // Only process if both dates are provided
    if (startDateStr && endDateStr) {
        var startDate = new Date(startDateStr + "T00:00:00");
        var endDate = new Date(endDateStr + "T23:59:59");

        var de = DataExtension.Init(deKey);
        var allRows = de.Rows.Retrieve() || [];

        var filtered = [];

        // Filter rows
        for (var i = 0; i < allRows.length; i++) {
            var row = allRows[i];
            var sendDateStr = row["SendDate"];
            if (!sendDateStr) continue;

            try {
                var rowDate = new Date(sendDateStr);
                if (rowDate >= startDate && rowDate <= endDate) {
                    filtered.push(row);
                }
            } catch (errDate) {
                continue;
            }
        }

        var total = filtered.length;
        var totalPages = Math.ceil(total / pageSize);
        var startIndex = (currentPage - 1) * pageSize;
        var pageRows = filtered.slice(startIndex, startIndex + pageSize);

        Write("<h3 style='text-align:center;'>Filtered Results</h3>");
        Write("<p style='text-align:center;'>Showing records from " + startDateStr + " to " + endDateStr + "</p>");

        if (pageRows.length > 0) {
            Write("<table><thead><tr><th>SendID</th><th>Email Name</th><th>Send Date</th><th>Subject</th></tr></thead><tbody>");
            for (var j = 0; j < pageRows.length; j++) {
                var row = pageRows[j];
                Write("<tr>");
                Write("<td>" + (row["SendID"] || "") + "</td>");
                Write("<td>" + (row["EmailName"] || "") + "</td>");
                Write("<td>" + (row["SendDate"] || "") + "</td>");
                Write("<td>" + (row["Subject"] || "") + "</td>");
                Write("</tr>");
            }
            Write("</tbody></table>");

            // Only show pagination if more than one page
            if (totalPages > 1) {
                var baseUrl = Request.GetUrl();
                function makeLink(pageNum) {
                    return baseUrl + "?deKey=" + deKey + "&startDate=" + startDateStr + "&endDate=" + endDateStr + "&page=" + pageNum;
                }

                Write("<div class='pagination'>");
                if (currentPage > 1) {
                    Write("<a href='" + makeLink(currentPage - 1) + "'>&laquo; Previous</a>");
                }
                for (var p = 1; p <= totalPages; p++) {
                    Write("<a href='" + makeLink(p) + "'>" + p + "</a>");
                }
                if (currentPage < totalPages) {
                    Write("<a href='" + makeLink(currentPage + 1) + "'>Next &raquo;</a>");
                }
                Write("</div>");
            }
        } else {
            Write("<p style='text-align:center;'>No records found in the selected date range.</p>");
        }
    }

} catch (ex) {
    Write("<p style='color:red;'>Error: " + Stringify(ex) + "</p>");
}
</script>

</body>
</html>
