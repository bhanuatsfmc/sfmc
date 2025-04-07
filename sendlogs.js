<!DOCTYPE html>
<html>
<head>
  <title>Send Report - WSProxy Filter</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

  <style>
    body { padding: 30px; font-family: sans-serif; }
    .table th, .table td { vertical-align: middle; }
    .pagination { justify-content: center; }
    .loading { text-align: center; font-weight: bold; padding: 10px; display: none; }
  </style>
</head>
<body>

<div class="container">
  <h2 class="mb-4 text-center">Send Report</h2>

  <!-- Filter Form -->
  <form id="filterForm" class="row g-3 justify-content-center mb-4">
    <div class="col-auto">
      <label class="form-label">Start Date</label>
      <input type="date" class="form-control" name="startDate" required />
    </div>
    <div class="col-auto">
      <label class="form-label">End Date</label>
      <input type="date" class="form-control" name="endDate" required />
    </div>
    <div class="col-auto align-self-end">
      <button type="submit" class="btn btn-primary">Filter</button>
    </div>
  </form>

  <div id="resultsArea">
    <!-- AJAX content will load here -->
  </div>
</div>

<script>
  function fetchResults(page = 1) {
    const formData = $("#filterForm").serialize() + "&page=" + page;
    $("#resultsArea").html('<div class="loading">Loading...</div>');

    $.get(window.location.href, formData, function (data) {
      const html = $(data).find("#ajaxContent").html();
      $("#resultsArea").html(html);
    });
  }

  $("#filterForm").on("submit", function (e) {
    e.preventDefault();
    fetchResults(1);
  });

  $(document).on("click", ".page-link", function (e) {
    e.preventDefault();
    const page = $(this).data("page");
    fetchResults(page);
  });
</script>

<!-- Server-side SSJS block -->
<div style="display:none;">
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

        var options = { BatchSize: 2500 };
        var response = ws.retrieve("Send", props, filter, options);
        var results = response && response.Results ? response.Results : [];

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

          // Pagination controls
          if (totalPages > 1) {
            Write("<nav><ul class='pagination'>");
            for (var p = 1; p <= totalPages; p++) {
              var active = (p === currentPage) ? " active" : "";
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
</div>

</body>
</html>
