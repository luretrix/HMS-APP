<?php
// save.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$data = file_get_contents("php://input");
if (!$data) {
  http_response_code(400);
  echo json_encode(["status" => "error", "message" => "No data received"]);
  exit;
}

if (file_put_contents("machines.json", $data)) {
  echo json_encode(["status" => "success", "message" => "Saved"]);
} else {
  http_response_code(500);
  echo json_encode(["status" => "error", "message" => "Failed to write file"]);
}
?>
