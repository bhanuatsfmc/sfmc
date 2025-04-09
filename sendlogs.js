<!DOCTYPE html>
<html>
<head>
    <title>DE Filter UI</title>
    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <style>
        body { padding: 30px; font-family: sans-serif; }
        .table th, .table td { vertical-align: middle; }
        .loading { display: none; text-align: center; font-weight: bold; padding: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="mb-4 text-center">Filter Data Extension Records</h2>

        <!-- Filter Form -->
        <form id="filterForm" class="row g-3 justify-content-center mb-4">
            <input type="hidden" name="deKey" value="Send" />
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
            <!-- Results will be injected here -->
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

    <!-- SSJS Output -->
    <div style="display:none;">
        <script runat="server">
        Platform.Load("core", "1");

        var deKey = Request.GetQueryStringParameter("deKey");
        var startDateStr = Request.GetQueryStringParameter("startDate");
        var endDateStr = Request.GetQueryStringParameter("endDate");
        var currentPage = parseInt(Request.GetQueryStringParameter("page") || "1", 10);
        var pageSize = 10;

        if (startDateStr && endDateStr && deKey) {
            try {
                var startDate = new Date(startDateStr + "T00:00:00");
                var endDate = new Date(endDateStr + "T23:59:59");

                var de = DataExtension.Init(deKey);
                var allRows = de.Rows.Retrieve() || [];

                var filtered = [];

                for (var i = 0; i < allRows.length; i++) {
                    var row = allRows[i];
                    var sendDateStr = row["SendDate"];
                    if (!sendDateStr) continue;

                    try {
                        var rowDate = new Date(sendDateStr);
                        if (rowDate >= startDate && rowDate <= endDate) {
                            filtered.push(row);
                        }
                    } catch (errDate) { continue; }
                }

                var total = filtered.length;
                var totalPages = Math.ceil(total / pageSize);
                var startIndex = (currentPage - 1) * pageSize;
                var pageRows = filtered.slice(startIndex, startIndex + pageSize);

                Write("<div id='ajaxContent'>");

                if (pageRows.length > 0) {
                    Write("<table class='table table-bordered table-striped'>");
                    Write("<thead class='table-light'><tr><th>SendID</th><th>Email Name</th><th>Send Date</th><th>Subject</th></tr></thead><tbody>");
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

                    // Pagination UI
                    if (totalPages > 1) {
                        Write("<nav><ul class='pagination justify-content-center'>");
                        for (var p = 1; p <= totalPages; p++) {
                            var active = (p == currentPage) ? " active" : "";
                            Write("<li class='page-item" + active + "'><a href='#' class='page-link' data-page='" + p + "'>" + p + "</a></li>");
                        }
                        Write("</ul></nav>");
                    }
                } else {
                    Write("<div class='alert alert-warning text-center'>No records found in the selected date range.</div>");
                }

                Write("</div>");

            } catch (ex) {
                Write("<div class='alert alert-danger'>Error: " + Stringify(ex) + "</div>");
            }
        }
        </script>
    </div>
</body>
</html>
