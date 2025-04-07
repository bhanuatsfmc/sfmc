<script runat="server">
Platform.Load("core", "1");

try {
    var ws = new Script.Util.WSProxy();
    var props = ["ID", "EmailName", "EmailSubject", "SendDate", "FromName", "FromAddress"];

    var filter = {
        Property: "SendDate",
        SimpleOperator: "between",
        Value: ["2024-03-01T00:00:00", "2024-03-31T23:59:59"]
    };

    var result = ws.retrieve("Send", props, filter);
    var sends = result.Results;

    if (sends && sends.length > 0) {
        Write("<table border='1' cellpadding='5'><tr><th>SendID</th><th>Email Name</th><th>Subject</th><th>Send Date</th><th>From</th></tr>");
        for (var i = 0; i < sends.length; i++) {
            var s = sends[i];
            Write("<tr>");
            Write("<td>" + s.ID + "</td>");
            Write("<td>" + s.EmailName + "</td>");
            Write("<td>" + s.EmailSubject + "</td>");
            Write("<td>" + s.SendDate + "</td>");
            Write("<td>" + s.FromName + " (" + s.FromAddress + ")</td>");
            Write("</tr>");
        }
        Write("</table>");
    } else {
        Write("<p>No send data found in the given date range.</p>");
    }

} catch (e) {
    Write("Error: " + Stringify(e));
}
</script>
