<script runat="server">
Platform.Load("core", "1");

try {
  var startDateStr = Request.GetQueryStringParameter("startDate");
  var endDateStr = Request.GetQueryStringParameter("endDate");
  var currentPage = parseInt(Request.GetQueryStringParameter("page") || "1", 10);
  var pageSize = 10;

  if (startDateStr && endDateStr) {
    var startDate = startDateStr + "T00:00:00";
    var endDate = endDateStr + "T23:59:59";

    var ws = new Script.Util.WSProxy();
    var props = ["ID", "EmailName", "EmailSubject", "SendDate", "FromName", "FromAddress"];
    var filter = {
      Property: "SendDate",
      SimpleOperator: "between",
      Value: [startDate, endDate]
    };

    var options = {
      BatchSize: 2500
    };

    var response = ws.retrieve("Send", props, filter, options);
    var results = response && response.Results ? response.Results : [];

    // Manual pagination
    var totalRecords = results.length;
    var totalPages = Math.ceil(totalRecords / pageSize);
    var startIndex = (currentPage - 1) * pageSize;
    var pageResults = results.slice(startIndex, startIndex + pageSize);

    Write("<div id='ajaxContent'>");

    if (pageResults.length > 0) {
      Write("<table class='table table-bordered table-striped'>");
      Write("<thead class='table-light'><tr>");
      Write("<th>Send ID</th><th>Email Name</th><th>Subject</th><th>Send Date</th><th>From Name</th><th>From Address</th>");
      Write("</tr></thead><tbody>");

      for (var i = 0; i < pageResults.length; i++) {
        var s = pageResults[i];
        Write("<tr>");
        Write("<td>" + (s.ID || "") + "</td>");
        Write("<td>" + (s.EmailName || "") + "</td>");
        Write("<td>" + (s.EmailSubject || "") + "</td>");
        Write("<td>" + (s.SendDate || "") + "</td>");
        Write("<td>" + (s.FromName || "") + "</td>");
        Write("<td>" + (s.FromAddress || "") + "</td>");
        Write("</tr>");
      }

      Write("</tbody></table>");

      if (totalPages > 1) {
        Write("<nav><ul class='pagination justify-content-center'>");
        for (var p = 1; p <= totalPages; p++) {
          var active = (p == currentPage) ? " active" : "";
          Write("<li class='page-item" + active + "'><a href='#' class='page-link' data-page='" + p + "'>" + p + "</a></li>");
        }
        Write("</ul></nav>");
      }

    } else {
      Write("<div class='alert alert-warning text-center'>No sends found in the selected date range.</div>");
    }

    Write("</div>");
  }

} catch (e) {
  Write("<div class='alert alert-danger'>Error: " + Stringify(e) + "</div>");
}
</script>
