<?php

// respose에 error메세지를 출력
// error_reporting(E_ALL);
// ini_set("display_errors", 1);

require "/var/www/html/vendor/JWT.php";

if ( !file_exists ("upload.ini") )
{
	http_response_code(500);
	print('upload.ini file is not exists');
	return;
}

$json_a = json_decode(file_get_contents("upload.ini"), true);
$init_json = (array) $json_a;
$key = "secretKey";

$directory = $_POST[directory];
$init_directory = $init_json[directory][$directory];

if($init_directory == null) {
	http_response_code(500);
	print("Error:Can not setting value '$directory'");
	return;
}

$name = $directory."/";

if($init_directory[Authorization] == true)
{	
	$header = apache_request_headers();
	$authorization = str_replace("Bearer ", "", $header[Authorization]);
	$jwt = (array) (JWT::decode($authorization, $key, array('HS256')));
	$name = $name.$jwt[fk_kids];
}

if ($_FILES)
{
	var_dump($_FILES['filename']['type']);
	switch($_FILES['filename']['type'])
	{
		case 'image/jpg':
		case 'image/jpeg': $ext='jpg'; break;
		case 'image/gif': $ext='gif';  break;
		case 'image/png': $ext='png';  break;
		default:
				http_response_code(500);
				print("Error:Invaild_extension");
				return;
	}
	$name = $name.".".$ext;
	$success = move_uploaded_file ($_FILES['filename']['tmp_name'], $name);

	if($success == 0)
	{
		http_response_code(500);	
		print ("Error:can not found filename");
		return;
	}
	print ("Success! name : $name");
}
else
{
	print ("Error");
}
?>
