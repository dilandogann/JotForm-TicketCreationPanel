<?php
require '../../vendor/autoload.php';

use Zendesk\API\HttpClient as ZendeskAPI;

include('db_connect.php');

include "../../jotform-api-php/JotForm.php";

$myFields = [];
$message = $formId = $data = $integration = $integrationId = $username = $username = $fields = $formName = "";
$answers = [];
$ticket = [];
$resp = array();

if (isset($_POST['formName'])) {

    $formName = mysqli_real_escape_string($conn, $_POST['formName']);
}
if (isset($_POST['formId'])) {

    $formId = mysqli_real_escape_string($conn, $_POST['formId']);
}

if (isset($_POST['integration'])) {

    $integration = mysqli_real_escape_string($conn, $_POST['integration']);
}

if (isset($_POST['apiKey'])) {

    $apiKey = $_POST['apiKey'];
}

if (isset($_POST['username'])) {

    $username = $_POST['username'];
}


function getAnswer($value, $submission)
{

    $qidIndex = strrpos($value, "_", 0);
    $qid = substr($value, 0, $qidIndex); //4
    $sublabelindex = strrpos($value, "/", 0); //0
    $answerField = "";
    $answer = "";
    if ($sublabelindex > 0) {
        $answerField = substr($value, $sublabelindex + 1);
        $answer = strip_tags($submission["answers"][$qid]["answer"][$answerField]);
    } else {
        if (isset($submission["answers"][$qid]["prettyFormat"]) != null) {
            $answer = strip_tags($submission["answers"][$qid]["prettyFormat"]);
        } else {
            $answer = strip_tags($submission["answers"][$qid]["answer"]);
        }
    }
    return $answer;
}

function getAuthanticationValues($integrationId, $conn, $autharray, $username)
{

    $sqlSelectAuthantication = "SELECT * FROM authanticationrequirements where integrationId='$integrationId' ";
    $resultSelectAuthantication = mysqli_query($conn, $sqlSelectAuthantication);

    if (mysqli_affected_rows($conn) > 0) {
        while ($row = mysqli_fetch_assoc($resultSelectAuthantication)) {

            $requirementId = $row["id"];
            $requirementname = $row["requirement"];

            $sqlSelectAuthanticationValues = "SELECT * FROM authanticationrequirementvalues where integrationId='$integrationId' AND requirementId='$requirementId'  AND username='$username' ";
            $resultSelectAuthanticationValues = mysqli_query($conn, $sqlSelectAuthanticationValues);

            if (mysqli_affected_rows($conn) > 0) {

                if ($rowAuthValue = mysqli_fetch_assoc($resultSelectAuthanticationValues)) {

                    foreach (array_keys($autharray) as $key)
                        if ($key == $requirementname) {
                            $autharray[$key] = $rowAuthValue["value"];
                        }
                }
            }
        }
    }
    return $autharray;
}

$sql = " SELECT * FROM ticketfields  WHERE formId='$formId' AND integrationId IN (SELECT id from integrations where name='$integration') ";


$result = mysqli_query($conn, $sql);


if (mysqli_affected_rows($conn) > 0) {

    //echo "Fields are saved";


    while ($row = mysqli_fetch_assoc($result)) {

        $integrationId = $row["integrationId"];
        $fieldId = $row["fieldId"];
        $sqlSelectField = "SELECT * from integrationfields where id='$fieldId' ";
        $resultSelectField = mysqli_query($conn, $sqlSelectField);
        if (mysqli_affected_rows($conn) > 0) {

            if ($rowFieldValue = mysqli_fetch_assoc($resultSelectField)) {

                $Obj = new stdClass();
                $Obj->field = $rowFieldValue["field"];
                $Obj->value = $row["value"];
                $Obj->inputType = $row["inputType"];
                $myFields[] = $Obj;
            }
        }
    }


    $jotformAPI = new JotForm($apiKey);

    $submissions = $jotformAPI->getFormSubmissions($formId);

    foreach ($submissions as $submission) {

        $submissionId = $submission["id"];

        $sqlGetSubmission = " SELECT * FROM createdtickets WHERE submissionId='$submissionId' AND integrationId='$integrationId' AND formId='$formId' ";
        $resultGetSubmission = mysqli_query($conn, $sqlGetSubmission);

        if (mysqli_affected_rows($conn) == 1) {

            echo "Ticket already exist\n";
        } else {

            foreach ($myFields as $field) {
                $answer = "";
                $inputType = $field->inputType;
                if ($inputType == "Text") {
                    $selectedFields = $field->value;
                    $flag = true;
                    while ($flag == true) {
                        if (strpos($selectedFields, '{') !== false) {
                            $phaIndex = strrpos($selectedFields, "{", 0);
                            if ($phaIndex != 0) {
                                $answer = $answer . substr($selectedFields, 0, $phaIndex);
                            }
                            $closeIndex = strrpos($selectedFields, "}", 0);
                            $length = $closeIndex - $phaIndex - 1;
                            $question = substr($selectedFields, $phaIndex + 1, $length);
                            $subanswer = getAnswer($question, $submission);
                            $answer = $answer . $subanswer;

                            if ($closeIndex + 1 < strlen($selectedFields)) {
                                $selectedFields = substr($selectedFields, $closeIndex + 1, strlen($selectedFields));
                            } else {
                                $flag = false;
                            }
                        } else {

                            $textField = $selectedFields;
                            $answer = $answer . $textField;
                            $flag = false;
                        }
                    }
                } else if ($inputType == "Dropdown") {
                    $value = $field->value;
                    $answer = getAnswer($value, $submission);
                } else {
                    $answer = $field->value;
                }

                $myObj = new stdClass();
                $myObj->field = $field->field;
                $myObj->answer = $answer;
                $answers[] = $myObj;
            }

            $ticket_data = array();
            $answer_array = array();
            foreach ($answers as $ticketValues) {

                if (($integration == "Freshdesk") && ((string) $ticketValues->field == "priority" || (string) $ticketValues->field == "status"))
                    $answer_array = array((string) $ticketValues->field => (int) $ticketValues->answer);
                else
                    $answer_array = array((string) $ticketValues->field => (string) $ticketValues->answer);
                $ticket_data = array_merge($ticket_data, $answer_array);
            }


            if ($integration == "Freshdesk") {


                $autharray = array("Domain" => "", "Api Key" => "", "Password" => "");

                $autharray = getAuthanticationValues($integrationId, $conn, $autharray,  $username);

                $ticket_data = json_encode($ticket_data);
                var_dump($ticket_data);
                $domain = $autharray["Domain"];
                $apiKey = $autharray["Api Key"];
                $password = $autharray["Password"];

                $url = "https://$domain.freshdesk.com/api/v2/tickets";
                $ch = curl_init($url);
                $header[] = "Content-type: application/json";
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
                curl_setopt($ch, CURLOPT_HEADER, true);
                curl_setopt($ch, CURLOPT_USERPWD, "$apiKey:$password");
                curl_setopt($ch, CURLOPT_POSTFIELDS, $ticket_data);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $server_output = curl_exec($ch);
                $info = curl_getinfo($ch);
                $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
                $headers = substr($server_output, 0, $header_size);
                $response = substr($server_output, $header_size);
                var_dump($response);
                var_dump($info);
                if ($info['http_code'] == 201) {

                    echo "Ticket created successfully, the response is given below \n";
                    echo "Response Headers are \n";
                    echo $headers . "\n";
                    echo "Response Body \n";
                    echo "$response \n";
                    $date = "";
                    foreach (preg_split("/((\r?\n)|(\r\n?))/", $headers) as $line) {
                        if (strpos($line, 'date:') !== false) {
                            $dateValues = explode(" ", $line);
                            for ($i = 1; $i < 5; $i++)
                                $date = $date . " " . $dateValues[$i];
                        }
                    }
                    $data = json_decode($response);
                    $ticketId = $data->id;

                    $sql = "INSERT INTO ticketsubmissionvalues(username,formName,submissionId,integrationId,ticketId,ticketInformation,createdAt)
                    VALUES ('$username','$formName','$submissionId','$integrationId','$ticketId','$ticket_data','$date')";


                    if (mysqli_query($conn, $sql)) {
                        //echo 'Ticket succesfully added to freshdesk ticket';
                        $message = "Ticket created succesfully";
                    } else {
                        //echo 'Query error:' . mysqli_error($conn);
                        $message = "Ticket didnt created successfully to freshdesk ticket";
                    }

                    $sql = "INSERT INTO createdtickets(username,formName,integrationId,ticketId,submissionId,formId) VALUES ('$username','$formName','$integrationId','$ticketId','$submissionId','$formId')";

                    if (mysqli_query($conn, $sql)) {
                        //echo 'Ticket succesfully added to ticketSubmission table';
                    } else {
                        //echo 'Query error:' . mysqli_error($conn);
                    }
                } else {
                    if ($info['http_code'] == 404) {
                        echo "Error, Please check the end point \n";
                    } else {
                        echo "Error, HTTP Status Code : " . $info['http_code'] . "\n";
                        echo "Headers are " . $headers;
                        echo "Response are " . $response;
                    }
                }
                curl_close($ch);
            }


            if ($integration == "Zendesk") {

                $autharray = array("Subdomain" => "", "API Token" => "", "Username" => "");

                $autharray = getAuthanticationValues($integrationId, $conn, $autharray, $username);
                $Subdomain = $autharray["Subdomain"];
                echo "Subdomain:" . $Subdomain . "\n";
                $token = $autharray["API Token"];
                echo "api token:" . $token . "\n";
                $user = $autharray["Username"];
                echo "username:" . $user . "\n";
                print_r($ticket_data);
                $client = new ZendeskAPI($Subdomain);
                $client->setAuth('basic', ['username' => $user, 'token' => $token]);
                try {
                    echo "hello";
                    // Create a new ticket
                    $newTicket = $client->tickets()->create($ticket_data);
                    $message = "Ticket created succesfully";
                    //Show result
                    //echo "<pre>";
                    //print_r($newTicket);
                    //echo "</pre>";
                    $date = $newTicket->ticket->created_at;
                    $ticketId = $newTicket->ticket->id;
                    $dateValues = explode("-", $date);
                    $dateValues[2] = substr($dateValues[2], 0, 2);
                    $date = "";
                    for ($i = 0; $i < 3; $i++)
                        $date = $date .  $dateValues[$i];
                    $datetime = DateTime::createFromFormat('Ymd', $date);
                    $month = $datetime->format('M');
                    $day = $datetime->format('D');
                    $created_at = "";
                    $created_at = $created_at . $day . ", " . $dateValues[2] . " " . $month . " " . $dateValues[0];
                    $ticket_data = json_encode($ticket_data);
                    $sql = "INSERT INTO ticketsubmissionvalues(username,formName,submissionId,integrationId,ticketId,ticketInformation,createdAt)
                    VALUES ('$username','$formName','$submissionId','$integrationId','$ticketId','$ticket_data','$created_at')";


                    if (mysqli_query($conn, $sql)) {
                        //echo 'Ticket succesfully added to zendesk ticket';
                        $message = "Ticket created succesfully";
                    } else {
                        //echo 'Query error:' . mysqli_error($conn);
                        $message = "Ticket didnt created successfully";
                    }

                    $sql = "INSERT INTO createdtickets(username,formName,integrationId,ticketId,submissionId,formId) VALUES ('$username','$formName','$integrationId','$ticketId','$submissionId','$formId')";



                    if (mysqli_query($conn, $sql)) {
                        //echo 'Ticket succesfully added to ticketSubmissionzendesk table';
                    } else {
                        //echo 'Query error:' . mysqli_error($conn);
                    }
                } catch (\Zendesk\API\Exceptions\ApiResponseException $e) {
                    //echo $e->getMessage() . '</br>';
                }
            }
        }

        $answers = [];
    }
} else {

    //echo "Fields are empty";
}


$resp = array(
    'fields' => $ticket,
);

echo json_encode($resp);
