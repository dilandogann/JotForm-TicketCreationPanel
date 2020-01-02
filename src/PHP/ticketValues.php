<?php

include('db_connect.php');

$response = array();
$myTicketfields = [];
$username = "";
if (isset($_POST['username'])) {

    $username = $_POST['username'];
}

$sqlSelectTicket = "SELECT * from ticketsubmissionvalues WHERE username='$username' ";
$resultSelectTicket = mysqli_query($conn, $sqlSelectTicket);

if (mysqli_affected_rows($conn) > 0) {

    while ($row = mysqli_fetch_assoc($resultSelectTicket)) {
        $intgId = $row["integrationId"];
        $myObj = new stdClass();
        $myObj->values = $row["ticketInformation"];
        $myObj->createdAt = $row["createdAt"];
        $myObj->form = $row["formName"];

        $sqlSelectFile = "SELECT * from integrations where id='$intgId'";
        $resultSelectFile = mysqli_query($conn, $sqlSelectFile);

        if (mysqli_affected_rows($conn) > 0) {
            if ($rowIntg = mysqli_fetch_assoc($resultSelectFile)) {
                $myObj->file = $rowIntg["file"];
                $myObj->intg = $rowIntg["name"];
            }
        }
        $myTicketfields[] = $myObj;
    }
}
$response = array(

    'ticketfields' => $myTicketfields,

);

echo json_encode($response);
