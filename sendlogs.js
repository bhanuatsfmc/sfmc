<head>
  <style>
    body, a, input, td, th {font-family:sans-serif; font-size:12px;}
  </style>
</head>
<body style="font-family:sans-serif;">

<script runat="server">

  Platform.Load("core","1");

  var debug = false;

  try {

    var prox = new Script.Util.WSProxy();
    var mids = [536006542];

    if (debug) {
      Write("<br>mids: " + Stringify(mids));
    }

    Write("<table border='1'>");
    Write("<tr>");
    Write("<th>MID</th>");
    Write("<th>Automation Name</th>");
    Write("<th>Status</th>");
    Write("</tr>");

    for (i = 0; i < mids.length; i++) {

      var mid = mids[i];
      prox.setClientId({"ID": mid});
      var obj = "Automation";

      var cols = ["ProgramID","CustomerKey","Status","Name"];

      // The only supported operators for the Automation object are: IN, EQUALS. Complex filter is not supported.
      // https://developer.salesforce.com/docs/atlas.en-us.mc-apis.meta/mc-apis/automation.htm

      var filter = {
          Property: "Status"
          , SimpleOperator: "IN"
          , Value: [-1,0,1,2,3,4,5,6,7,8]
      };

      var opts = null;
      var props = null;

      var moreObjs = true;
      var reqID = null;

      while (moreObjs) {

          moreObjs = false;

          var objs = reqID == null ? prox.retrieve(obj, cols, filter, opts, props) : prox.getNextBatch(obj, reqID);

          if (objs != null) {

              moreObjs = objs.HasMoreRows;
              reqID = objs.RequestID;

              for (var j = 0; j < objs.Results.length; j++) {

                var automationObj = objs.Results[j];

                var statusDsc = "";

                switch (automationObj.Status) {
                  case -1: statusDsc = "Error"; break;
                  case  0: statusDsc = "Building Error"; break;
                  case  1: statusDsc = "Building"; break;
                  case  2: statusDsc = "Ready"; break;
                  case  3: statusDsc = "Running"; break;
                  case  4: statusDsc = "Paused"; break;
                  case  5: statusDsc = "Stopped"; break;
                  case  6: statusDsc = "Scheduled"; break;
                  case  7: statusDsc = "Awaiting Trigger"; break;
                  case  8: statusDsc = "Inactive Trigger"; break;
                }

                Write("<tr>");
                Write("<td>" + mid + "</td>");
                Write("<td>" + automationObj.Name + "</td>");
                Write("<td>" + statusDsc + "</td>");
                Write("</tr>");

              }

          }


      }

      prox.resetClientIds();

    }

    Write("</table>");

  } catch (e) {

    if (debug) {
      Platform.Response.Write("<br><br>e: " + Stringify(e));
    }

  }
</script>
</body>
</html>
