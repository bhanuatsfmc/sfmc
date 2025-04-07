<html>
<head>
  <style>
    body, a, input, td, th {font-family:sans-serif; font-size:12px;}
  </style>
</head>
<body style="font-family:sans-serif;">

<script runat="server">

  Platform.Load("core","1");

    // Configuration
    var batchSize = 50;
    var dateFormat = "yyyy-MM-dd";
    
    // Get request parameters
  //  var startDate = Platform.Request.GetFormField("startDate");
  //  var endDate = Platform.Request.GetFormField("endDate");
  //  var currentPage = Number(Platform.Request.GetFormField("page") || 1);
      var startDate = "2025-03-01";
    var endDate = "2025-03-30";
    var currentPage = 1;
    var sdate = "SendDate";
    // Initialize response variables
    var sends = [];
    var totalCount = 0;
    var totalPages = 0;
    
    // Main processing
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
            
            var result = prox.retrieve("DataExtensionObject[" + deName + "]", cols, filter, options);
            sends = result.Results;
            totalCount = result.TotalCount;
            totalPages = Math.ceil(totalCount / batchSize);
            
        } catch (e) {
  Platform.Response.Write("<br><br>e: " + Stringify(e));
    
        }
    }
</script>
</body>
</html>
