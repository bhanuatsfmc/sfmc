<!-- Inside the existing <script runat="server"> block -->
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

    var retrieved = ws.retrieve("Send", props, filter, options);
    var allResults = retrieved.Results || [];
    var totalRecords = allResults.length;

    // Manual pagination
    var totalPages = Math.ceil(totalRecords / pageSize);
    var startIndex = (currentPage - 1) * pageSize;
    var pagedResults = allResults.slice(startIndex, startIndex + pageSize);

    Write("<div id='ajaxContent'>");

    if (pagedResults.length > 0) {
      Write("<table class='table table-bordered table-striped'>");
      Write("<thead class='table-light'><tr>");
      Write("<th>Send ID</th><th>Email Name</th><th>Subject</th><th>Send Date</th><th>From Name</th><th>From Address</th>");
      Write("</tr></thead><tbody>");

      for (var i = 0; i < pagedResults.length; i++) {
        var send = pagedResults[i];
        Write("<tr>");
        Write("<td>" + send.ID + "</td>");
        Write("<td>" + send.EmailName + "</td>");
        Write("<td>" + send.EmailSubject + "</td>");
        Write("<td>" + send.SendDate + "</td>");
        Write("<td>" + send.FromName + "</td>");
        Write("<td>" + send.FromAddress + "</td>");
        Write("</tr>");
      }

      Write("</tbody></table>");

      // Pagination
      if (totalPages > 1) {
        Write("<nav><ul class='pagination'>");
        for (var p = 1; p <= totalPages; p++) {
          var active = (p == currentPage) ? " active" : "";
          Write("<li class='page-item" + active + "'><a href='#' class='page-link' data-page='" + p + "'>" + p + "</a></li>");
        }
        Write("</ul></nav>");
      }

    } else {
      Write("<div class='alert alert-warning text-center'>No sends found for this date range.</div>");
    }

    Write("</div>");
  }

} catch (e) {
  Write("<div class='alert alert-danger'>Error: " + Stringify(e) + "</div>");
}
</script>
