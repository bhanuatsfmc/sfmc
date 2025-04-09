<!DOCTYPE html>
<html>
<head>
  <title>WSProxy DE Filter</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- jQuery for AJAX functionality -->
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

  <style>
    body { 
      padding: 30px; 
      font-family: sans-serif; 
      background-color: #f8f9fa;
    }
    .table th, .table td { 
      vertical-align: middle; 
    }
    .pagination { 
      justify-content: center; 
      margin-top: 20px;
    }
    .loading { 
      display: none; 
      text-align: center; 
      font-weight: bold; 
      padding: 20px;
      background-color: #f1f1f1;
      border-radius: 5px;
      margin: 20px 0;
    }
    .card {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    .card-header {
      background-color: #0d6efd;
      color: white;
      font-weight: bold;
    }
    .form-container {
      background-color: white;
      padding: 20px;
      border-radius: 5px;
    }
    .results-count {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>

<div class="container">
  <div class="card">
    <div class="card-header text-center">
      <h2 class="mb-0">SSJS Technical Test Scenario</h2>
    </div>
    <div class="card-body">
      <!-- Filter Form -->
      <div class="form-container">
        <form id="filterForm" class="row g-3 justify-content-center mb-4">
          <input type="hidden" name="deKey" value="F16FC2FB-F8FD-4137-B97C-6814278847E7" />
          <div class="col-md-3">
            <label class="form-label">Start Date</label>
            <input type="date" class="form-control" name="startDate" required />
          </div>
          <div class="col-md-3">
            <label class="form-label">End Date</label>
            <input type="date" class="form-control" name="endDate" required />
          </div>
          <div class="col-md-2 align-self-end">
            <button type="submit" class="btn btn-primary w-100">Filter</button>
          </div>
        </form>
      </div>

      <div id="resultsArea">
        <!-- Initial placeholder content -->
        <div class="alert alert-info text-center">
          Please select a date range and click "Filter" to view results.
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  /**
   * Fetches results from the server via AJAX and updates the UI
   * @param {number} page - The page number to fetch (default: 1)
   */
  function fetchResults(page = 1) {
    const formData = $("#filterForm").serialize() + "&page=" + page;
    
    // Show loading indicator
    $("#resultsArea").html('<div class="loading">Loading data... <div class="spinner-border spinner-border-sm" role="status"></div></div>');
    
    // Make AJAX request
    $.get(window.location.href, formData)
      .done(function(data) {
        const html = $(data).find("#ajaxContent").html();
        $("#resultsArea").html(html || '<div class="alert alert-warning">No data received from server.</div>');
      })
      .fail(function(xhr, status, error) {
        $("#resultsArea").html('<div class="alert alert-danger">Error loading data: ' + error + '</div>');
      });
  }

  // Form submission handler
  $("#filterForm").on("submit", function(e) {
    e.preventDefault();
    fetchResults(1); // Always start at page 1 when applying new filters
  });

  // Pagination click handler (using event delegation)
  $(document).on("click", ".page-link", function(e) {
    e.preventDefault();
    const page = $(this).data("page");
    if (page) {
      fetchResults(page);
      // Scroll to results for better UX
      $('html, body').animate({
        scrollTop: $("#resultsArea").offset().top - 20
      }, 200);
    }
  });
</script>

<!-- Server-side processing block (hidden from view) -->
<div style="display:none;">
  <script runat="server">
    Platform.Load("core", "1");

    /**
     * Server-side script to handle data retrieval and pagination
     * Uses WSProxy to query Data Extension with date filtering
     */
    try {
      // Get query parameters
      var deKey = Request.GetQueryStringParameter("deKey");
      var startDateStr = Request.GetQueryStringParameter("startDate");
      var endDateStr = Request.GetQueryStringParameter("endDate");
      var currentPage = parseInt(Request.GetQueryStringParameter("page") || "1", 10);
      var pageSize = 10; // Number of items per page

      // Only proceed if we have all required parameters
      if (startDateStr && endDateStr && deKey) {
        // Format dates for proper filtering
        var startDate = startDateStr + "T00:00:00";
        var endDate = endDateStr + "T23:59:59";

        // Initialize WSProxy
        var ws = new Script.Util.WSProxy();
        
        // Properties we want to retrieve
        var props = ["SendID", "EmailName", "SendDate", "Subject"];
        
        // Create date range filter
        var filter = {
          Property: "SendDate",
          SimpleOperator: "between",
          Value: [startDate, endDate]
        };
        
        // WSProxy options
        var options = {
          BatchSize: 2500 // Retrieve up to 2500 records at once
        };

        // Retrieve data from Data Extension
        var retrieved = ws.retrieve("DataExtensionObject[" + deKey + "]", props, filter, options);
        var allResults = retrieved.Results || [];
        var totalRecords = allResults.length;

        // Calculate pagination values
        var totalPages = Math.ceil(totalRecords / pageSize);
        currentPage = Math.max(1, Math.min(currentPage, totalPages)); // Ensure page is within bounds
        var startIndex = (currentPage - 1) * pageSize;
        var pagedResults = allResults.slice(startIndex, startIndex + pageSize);

        // Begin output
        Write("<div id='ajaxContent'>");
        
        // Results count information
        Write("<div class='results-count'>");
        Write("Showing " + (startIndex + 1) + " to " + Math.min(startIndex + pageSize, totalRecords) + 
              " of " + totalRecords + " total records");
        Write("</div>");

        if (pagedResults.length > 0) {
          // Results table
          Write("<div class='table-responsive'>");
          Write("<table class='table table-bordered table-striped table-hover'>");
          Write("<thead class='table-light'><tr>");
          Write("<th>SendID</th><th>Email Name</th><th>Send Date</th><th>Subject</th>");
          Write("</tr></thead><tbody>");

          // Output each row of data
          for (var i = 0; i < pagedResults.length; i++) {
            var row = pagedResults[i].Properties;
            Write("<tr>");
            Write("<td>" + Stringify(row.Property("SendID")) + "</td>");
            Write("<td>" + Stringify(row.Property("EmailName")) + "</td>");
            Write("<td>" + FormatDate(row.Property("SendDate")) + "</td>");
            Write("<td>" + Stringify(row.Property("Subject")) + "</td>");
            Write("</tr>");
          }

          Write("</tbody></table></div>");

          // Pagination controls if needed
          if (totalPages > 1) {
            Write("<nav aria-label='Page navigation'><ul class='pagination'>");
            
            // Previous page link
            if (currentPage > 1) {
              Write("<li class='page-item'><a class='page-link' href='#' data-page='" + (currentPage - 1) + "' aria-label='Previous'><span aria-hidden='true'>&laquo;</span></a></li>");
            } else {
              Write("<li class='page-item disabled'><span class='page-link'><span aria-hidden='true'>&laquo;</span></span></li>");
            }
            
            // Page number links
            for (var p = 1; p <= totalPages; p++) {
              var active = (p == currentPage) ? " active" : "";
              Write("<li class='page-item" + active + "'><a class='page-link' href='#' data-page='" + p + "'>" + p + "</a></li>");
            }
            
            // Next page link
            if (currentPage < totalPages) {
              Write("<li class='page-item'><a class='page-link' href='#' data-page='" + (currentPage + 1) + "' aria-label='Next'><span aria-hidden='true'>&raquo;</span></a></li>");
            } else {
              Write("<li class='page-item disabled'><span class='page-link'><span aria-hidden='true'>&raquo;</span></span></li>");
            }
            
            Write("</ul></nav>");
          }

        } else {
          // No results message
          Write("<div class='alert alert-warning text-center'>No records found for the selected date range.</div>");
        }

        Write("</div>");
      }
    } catch (e) {
      // Error handling
      Write("<div class='alert alert-danger'>Error processing request: " + Stringify(e.message || e) + "</div>");
    }
    
    /**
     * Helper function to format dates for display
     */
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
