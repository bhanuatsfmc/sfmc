<!DOCTYPE html>
<html>
<head>
    <title>Send Object Filter UI</title>
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
        <h2 class="mb-4 text-center">Filter Send Object Records</h2>

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

        var startDateStr = Request.GetQueryStringParameter("startDate");
        var endDateStr = Request.GetQueryStringParameter("endDate");
        var currentPage = parseInt(Request.GetQueryStringParameter("page") || "1", 10);
        var pageSize = 10;

        if (startDateStr && endDateStr) {
            try {
                var startDate = startDateStr + "T00:00:00";
                var endDate = endDateStr + "T23:59:59";

                // Create WSProxy instance
                var ws = new Script.Util.WSProxy();
                
                // Define properties to retrieve from Send object
                var props = ["ID", "Name", "SendDate", "Subject"];
                
                // Create date range filter
                var filter = {
                    Property: "SendDate",
                    SimpleOperator: "between",
                    Value: [startDate, endDate]
                };
                
                // Set batch size for retrieval
                var options = {
                    BatchSize: 2500
                };

                // Retrieve Send objects
                var retrieved = ws.retrieve("Send", props, filter, options);
                var allResults = retrieved.Results || [];
                var totalRecords = allResults.length;

                // Calculate pagination values
                var totalPages = Math.ceil(totalRecords / pageSize);
                currentPage = Math.max(1, Math.min(currentPage, totalPages)); // Ensure page is within bounds
                var startIndex = (currentPage - 1) * pageSize;
                var pagedResults = allResults.slice(startIndex, startIndex + pageSize);

                Write("<div id='ajaxContent'>");

                if (pagedResults.length > 0) {
                    Write("<table class='table table-bordered table-striped'>");
                    Write("<thead class='table-light'><tr><th>Send ID</th><th>Email Name</th><th>Send Date</th><th>Subject</th></tr></thead><tbody>");
                    
                    // Output each row of data
                    for (var i = 0; i < pagedResults.length; i++) {
                        var row = pagedResults[i];
                        Write("<tr>");
                        Write("<td>" + Stringify(row.ID) + "</td>");
                        Write("<td>" + Stringify(row.Name) + "</td>");
                        Write("<td>" + FormatDate(row.SendDate) + "</td>");
                        Write("<td>" + Stringify(row.Subject) + "</td>");
                        Write("</tr>");
                    }
                    
                    Write("</tbody></table>");

                    // Pagination UI
                    if (totalPages > 1) {
                        Write("<nav><ul class='pagination justify-content-center'>");
                        
                        // Previous page link
                        if (currentPage > 1) {
                            Write("<li class='page-item'><a class='page-link' href='#' data-page='" + (currentPage - 1) + "'>&laquo;</a></li>");
                        }
                        
                        // Page number links
                        for (var p = 1; p <= totalPages; p++) {
                            var active = (p == currentPage) ? " active" : "";
                            Write("<li class='page-item" + active + "'><a class='page-link' href='#' data-page='" + p + "'>" + p + "</a></li>");
                        }
                        
                        // Next page link
                        if (currentPage < totalPages) {
                            Write("<li class='page-item'><a class='page-link' href='#' data-page='" + (currentPage + 1) + "'>&raquo;</a></li>");
                        }
                        
                        Write("</ul></nav>");
                    }
                } else {
                    Write("<div class='alert alert-warning text-center'>No Send records found in the selected date range.</div>");
                }

                Write("</div>");

            } catch (ex) {
                Write("<div class='alert alert-danger'>Error: " + Stringify(ex) + "</div>");
            }
        }

        // Helper function to format dates for display
        function FormatDate(dateStr) {
            if (!dateStr) return "";
            try {
                var date = new Date(dateStr);
                return date.toLocaleDateString() + " " + date.toLocaleTimeString();
            } catch (e) {
                return dateStr;
            }
        }
        </script>
    </div>
</body>
</html>
