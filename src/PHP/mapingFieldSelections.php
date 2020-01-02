<?php

include('db_connect.php');


$myFields = [];
$integrationfields = $formId = $integration = $json = $requirementfields = $username = "";
$message = "";
$api = "";
$response = array();
if (isset($_POST['formId'])) {
    $formId = mysqli_real_escape_string($conn, $_POST['formId']);
}

if (isset($_POST['integrationfields'])) {
    $integrationfields = $_POST['integrationfields'];
}

if (isset($_POST['requirementfields'])) {
    $requirementfields = $_POST['requirementfields'];
}

if (isset($_POST['integration'])) {
    $integration = $_POST['integration'];
}


if (isset($_POST['username'])) {

    $username = $_POST['username'];
}

$integrationfields = json_decode($_POST['integrationfields'], true);
$requirementfields = json_decode($_POST['requirementfields'], true);

foreach ($integrationfields as $answer) {

    $field = $answer["name"];
    $value = $answer["selected"];
    $inputType = $answer["inputType"];

    if ($value != "") {
        $sqlGetfieldId = "SELECT * from integrationfields where field='$field' AND integrationId IN (select id from integrations where name='$integration') ";
        $resultgetfieldId = mysqli_query($conn, $sqlGetfieldId);


        if (mysqli_affected_rows($conn) > 0) {

            while ($rowField = mysqli_fetch_assoc($resultgetfieldId)) {

                $id = $rowField["id"];
                $integId = $rowField["integrationId"];

                $sqlGetFieldvalue = " SELECT * FROM ticketfields WHERE formId='$formId' AND integrationId='$integId' AND fieldId='$id' ";
                $resultGetFieldvalue = mysqli_query($conn, $sqlGetFieldvalue);


                if ($rowfieldvalue = mysqli_fetch_assoc($resultGetFieldvalue)) {
                    $idField = $rowfieldvalue["id"];

                    $sqlUpdateFieldValue = " UPDATE ticketfields SET value='$value' WHERE id='$idField' ";
                    $resultUpdateFieldvalue = mysqli_query($conn, $sqlUpdateFieldValue);
                } else {
                    $sqlInsertFieldValue = "INSERT INTO ticketfields(formId,integrationId,fieldId,value,inputType) VALUES ('$formId','$integId','$id','$value','$inputType')";
                    $resultInsertFieldvalue = mysqli_query($conn, $sqlInsertFieldValue);
                }
            }
        }
    }
}



foreach ($requirementfields as $req) {

    $name = $req["name"];
    $value = $req["selected"];

    if ($value != "") {
        $sqlSelectEditedReqID = "SELECT * from authanticationrequirements where requirement='$name' AND integrationId IN  (SELECT id from integrations where name='$integration') ";
        $resultSelectEditedReqID = mysqli_query($conn, $sqlSelectEditedReqID);

        if (mysqli_affected_rows($conn) > 0) {

            if ($rowReq = mysqli_fetch_assoc($resultSelectEditedReqID)) {

                $intgId = $rowReq["integrationId"];
                $reqId = $rowReq["id"];

                $sqlGetReqValue = "SELECT * from authanticationrequirementvalues where integrationId='$intgId' AND requirementId='$reqId'AND username='$username' ";
                $resultGetReqValue = mysqli_query($conn, $sqlGetReqValue);

                if ($rowValue = mysqli_fetch_assoc($resultGetReqValue)) {
                    $rowId = $rowValue["id"];
                    $sqlUpdateReqValue = "UPDATE authanticationrequirementvalues set value='$value' where id='$rowId' ";
                    $resultUpdateReqValue = mysqli_query($conn, $sqlUpdateReqValue);
                } else {
                    $sqlInsertReqValue = "INSERT into  authanticationrequirementvalues (username,integrationId,requirementId,value) VALUES('$username','$intgId','$reqId','$value') ";
                    $resultInsertReqValue = mysqli_query($conn, $sqlInsertReqValue);
                }
            }
        }
    }
}
$message = "Ticket fields succesfully added";
$response = array('message' => $message);
echo json_encode($response);
