<html>
<head>
  <style>
    body, a, input, td, th {font-family:sans-serif; font-size:12px;}
    table {width: 80%; margin: 20px auto; border-collapse: collapse;}
    th, td {border: 1px solid #ccc; padding: 8px;}
    th {background-color: #f2f2f2;}
  </style>
</head>
<body style="font-family:sans-serif;">

<script runat="server">
  Platform.Load("core", "1");

  // Configuration
  var batchSize = 50;
  var dateFormat = "yyyy-MM-dd";
  var startDate = "2025-03-01";
  var endDate = "2025-03-30";
  var currentPage = 1;
  var sdate = "SendDate";
  var deName = "send_pro_Copy"; // <-- 🔧 Replace with your actual DE name

  var sends = [];
  var totalCount = 0;
  var totalPages = 0;

  if (startDate && endDate) {
    try {
      var proxy = new Script.Util.WSProxy();
      var cols = ["SendID", "EmailName", "SendDate", "Subject"];
      var filter = {
        Property: sdate,
        SimpleOperator: "between",
        Value: [startDate + "T00:00:00", endDate + "T23:59:59"]
      };
      var options = {
        BatchSize: batchSize,
        Page: currentPage
      };

      var result = proxy.retrieve("DataExtensionObject[" + deName + "]", cols, filter, options);

      if (result && result.Results) {
        sends = result.Results;
        totalCount = result.TotalCount || sends.length;
        totalPages = Math.ceil(totalCount / batchSize);
      }

    } catch (e) {
      Write("<p style='color:red;'>Error: " + Stringify(e) + "</p>");
    }
  }

  // Render Output
  if (sends.length > 0) {
    Write("<table>");
    Write("<thead><tr><th>SendID</th><th>Email Name</th><th>Send Date</th><th>Subject</th></tr></thead><tbody>");

    for (var i = 0; i < sends.length; i++) {
      var props = sends[i].Properties;
      Write("<tr>");
      Write("<td>" + props.Property("SendID") + "</td>");
      Write("<td>" + props.Property("EmailName") + "</td>");
      Write("<td>" + props.Property("SendDate") + "</td>");
      Write("<td>" + props.Property("Subject") + "</td>");
      Write("</tr>");
    }

    Write("</tbody></table>");
    Write("<p style='text-align:center;'>Page " + currentPage + " of " + totalPages + "</p>");
  } else {
    Write("<p style='text-align:center;'>No records found between " + startDate + " and " + endDate + "</p>");
  }

</script>

</body>
</html>
