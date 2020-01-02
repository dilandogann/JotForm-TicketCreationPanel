<?php

include('db_connect.php');

$myFields = [];
$myOptions = [];
$myReq = [];
$operation = $name = $description = $file = $integration = $formId = "";
$response = array();

if (isset($_POST['operation'])) {

  $operation = $_POST['operation'];
}

if (isset($_POST['integration'])) {

  $integration = $_POST['integration'];
}

if (isset($_POST['formId'])) {

  $formId = $_POST['formId'];
}


if ($operation == "all") {
  $sql = "SELECT name,description,file from integrations group by name ";

  $result = mysqli_query($conn, $sql);


  while ($row = mysqli_fetch_assoc($result)) {

    $myObj = new stdClass();
    $myObj->name = $row["name"];
    $myObj->description = $row["description"];
    $myObj->file = $row['file'];

    $myFields[] = $myObj;
  }
  $response = array(
    'fields' => $myFields,
  );
  echo json_encode($response);
}


if ($operation == "one") {

  $getIntegrationSql = "SELECT * from integrations where name='$integration' ";
  $resultIntegrationSql = mysqli_query($conn, $getIntegrationSql);

  if (mysqli_affected_rows($conn) > 0) {

    while ($row = mysqli_fetch_assoc($resultIntegrationSql)) {

      $name = $row["name"];
      $description = $row["description"];
      $file = $row['file'];
      $integrationId = $row["id"];

      $getIntegrationFieldsSql = "SELECT * from integrationfields where integrationId='$integrationId' ";
      $IntegrationFieldsSqlResult = mysqli_query($conn, $getIntegrationFieldsSql);

      if (mysqli_affected_rows($conn) > 0) {

        while ($row = mysqli_fetch_assoc($IntegrationFieldsSqlResult)) {

          $myObj = new stdClass();
          $myObj->field = $row["field"];
          $myObj->inputType = $row["inputType"];
          $myObj->fieldId = $row["id"];
          $fieldId = $row["id"];


          $sqlGetSelectedValueForField = "SELECT * from ticketfields  where formId='$formId' AND integrationId='$integrationId' AND fieldId='$fieldId' ";
          $resultGetSelectedValueForField = mysqli_query($conn, $sqlGetSelectedValueForField);
          if ($rowvalueforfield = mysqli_fetch_assoc($resultGetSelectedValueForField)) {
            $myObj->value = $rowvalueforfield["value"];
          } else {
            $myObj->value = "";
          }
          $myFields[] = $myObj;
        }
      }
      foreach ($myFields as $field) {

        if ($field->inputType == "Radio") {

          $fieldId = $field->fieldId;
          $getRadioFieldsSql = "SELECT * from  radiofieldoptions where fieldId='$fieldId' ";
          $radioFieldsSqlResult = mysqli_query($conn, $getRadioFieldsSql);

          while ($row = mysqli_fetch_assoc($radioFieldsSqlResult)) {

            $sqlSelectFieldName = "SELECT * from integrationfields where Id='$fieldId' ";
            $resultSelectField = mysqli_query($conn, $sqlSelectFieldName);
            $rowForField = mysqli_fetch_assoc($resultSelectField);

            $myObj = new stdClass();
            $myObj->field = $rowForField["field"];
            $myObj->fieldoption = $row["fieldoption"];
            $myOptions[] = $myObj;
          }
        }
      }
    }

    $getIntegrationReqSql = "SELECT * from authanticationrequirements where integrationId='$integrationId' ";
    $resultIntegrationReqSql = mysqli_query($conn, $getIntegrationReqSql);

    if (mysqli_affected_rows($conn) > 0) {

      while ($rowReq = mysqli_fetch_assoc($resultIntegrationReqSql)) {
        $myObj = new stdClass();
        $myObj->text = $rowReq["requirement"];
        $reqId = $rowReq["id"];

        $getReqSelectedValue = "SELECT * from authanticationrequirementvalues where integrationId='$integrationId' AND requirementId='$reqId'";
        $resultReqSelectedValue = mysqli_query($conn, $getReqSelectedValue);

        if ($rowReqValue = mysqli_fetch_assoc($resultReqSelectedValue)) {
          $myObj->value = $rowReqValue["value"];
        } else {
          $myObj->value = "";
        }
        $myReq[] = $myObj;
      }
    }
  }

  $response = array(
    'name' => $name,
    'description' => $description,
    'file' => $file,
    'fields' => $myFields,
    'options' => $myOptions,
    'requirements' => $myReq
  );

  echo json_encode($response);
}
