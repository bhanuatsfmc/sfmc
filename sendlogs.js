<html>
<head>
  <style>
    body, a, input, td, th {font-family:sans-serif; font-size:12px;}
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
  var deName = "send_pro"; // Replace with your Data Extension name

  // Initialize response variables
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

      // Retrieve data
      var result = proxy.retrieve("DataExtensionObject[" + deName + "]", cols, filter, options);
      
      if (result && result.Results) {
        sends = result.Results;
        totalCount = result.TotalCount || sends.length;
        totalPages = Math.ceil(totalCount / batchSize);
      }

    } catch (e) {
      Platform.Response.Write("<br>Error: " + Stringify(e));
    }
  }

  // Output results for debugging
  Platform.Response.Write("<h1>Results</h1>");
  Platform.Response.Write("<p>Total Count: " + totalCount + "</p>");
  Platform.Response.Write("<p>Total Pages: " + totalPages + "</p>");
</script>
</body>
</html>
