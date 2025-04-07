<html>
<head>
  <style>
    body, a, input, td, th {font-family:sans-serif; font-size:12px;}
    table {width: 80%; margin: 20px auto; border-collapse: collapse;}
    th, td {border: 1px solid #ccc; padding: 8px;}
    th {background-color: #f2f2f2;}
  </style>
</head>
<body>

<script runat="server">
  Platform.Load("core", "1");

  // Get URL params
  var deKey = Request.GetQueryStringParameter("deKey") || "F16FC2FB-F8FD-4137-B97C-6814278847E7"; // Default
  var startDateStr = Request.GetQueryStringParameter("startDate") || "2025-02-01";
  var endDateStr = Request.GetQueryStringParameter("endDate") || "2025-03-31";
  var currentPage = parseInt(Request.GetQueryStringParameter("page") || "1");
  var pageSize = 10;

  // Convert to Date objects
  var startDate = new Date(startDateStr + "T00:00:00");
  var endDate = new Date(endDateStr + "T23:59:59");

  var de = DataExtension.Init(deKey);
  var allRows = de.Rows.Retrieve();

  var filtered = [];

  // Manual filtering
  for (var i = 0; i < allRows.length; i++) {
    var rowDate = new Date(allRows[i]["SendDate"]);
    if (rowDate >= startDate && rowDate <= endDate) {
      filtered.push(allRows[i]);
    }
  }

  var total = filtered.length;
  var totalPages = Math.ceil(total / pageSize);
  var startIndex = (currentPage - 1) * pageSize;
  var pageRows = filtered.slice(startIndex, startIndex + pageSize);

  // Render
  Write("<h3 style='text-align:center;'>Filtered Results</h3>");
  Write("<p style='text-align:center;'>Records from " + startDateStr + " to " + endDateStr + " (Page " + currentPage + " of " + totalPages + ")</p>");

  if (pageRows.length > 0) {
    Write("<table><thead><tr><th>SendID</th><th>Email Name</th><th>Send Date</th><th>Subject</th></tr></thead><tbody>");

    for (var j = 0; j < pageRows.length; j++) {
      var row = pageRows[j];
      Write("<tr>");
      Write("<td>" + row["SendID"] + "</td>");
      Write("<td>" + row["EmailName"] + "</td>");
      Write("<td>" + row["SendDate"] + "</td>");
      Write("<td>" + row["Subject"] + "</td>");
      Write("</tr>");
    }

    Write("</tbody></table>");

    // Pagination Links
    var baseUrl = Request.GetUrl();
    function makeLink(pageNum) {
      return baseUrl + "?deKey=" + deKey + "&startDate=" + startDateStr + "&endDate=" + endDateStr + "&page=" + pageNum;
    }

    Write("<div style='text-align:center; margin-top:20px;'>");
    if (currentPage > 1) {
      Write("<a href='" + makeLink(currentPage - 1) + "'>Previous</a> ");
    }
    if (currentPage < totalPages) {
      Write(" <a href='" + makeLink(currentPage + 1) + "'>Next</a>");
    }
    Write("</div>");

  } else {
    Write("<p style='text-align:center;'>No records found.</p>");
  }
</script>

</body>
</html>
