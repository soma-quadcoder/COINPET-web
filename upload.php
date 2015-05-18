<?php

//respose에 error메세지를 출력
//error_reporting(E_ALL);
//ini_set("display_errors", 1);

require "./vendor/firebase/php-jwt/Firebase/PHP-JWT/Authentication/JWT.php";
require "./vendor/eventviva/php-image-resize/src/ImageResize.php";

function print_error($message)
{
	http_response_code(500);
	print('{"Error":"'.$message.'"}');
	exit();
}

if ( !file_exists ("upload.ini") )
{
	print_error('upload.ini file is not exists');
}

$json_a = json_decode(file_get_contents("upload.ini"), true);
$init_json = (array) $json_a;
$key = "secretKey";

$directory = $_POST[directory];
$init_directory = $init_json[directory][$directory];

if($init_directory == null)
	print_error("Invalid_directory");

$name = $directory."/";


if($init_directory[Authorization] == true)
{	
	$header = apache_request_headers();
	$authorization = str_replace("Bearer ", "", $header[Authorization]);
	$jwt = (array) (JWT::decode($authorization, $key, array('HS256')));

	$length = count($init_directory[Authorization]);

	$isAuth = false;
	foreach($init_directory[Authorization] as $value)
	{
		if(	$value == "kids" && $jwt[fk_kids] ) {
			$isAuth = true;
			$name = $name.$jwt[fk_kids];
			break;
		}
		else if( $value == "parents" && $jwt[fk_parents] ) {
			$isAuth = true;
			$fk_kids = $_POST[fk_kids];
			if( !$fk_kids )
			{
				print_error("Invalid_fk_kids");
			}


			// need to check parents_has_kids table
			$name = $name.$fk_kids;
			break;
		}
		else if ($value == "admin" && $jwt[fk_admin] ) {
			$isAuth = true;
			$fk_kids = $_POST[fk_kids];
			if( !$fk_kids )
				print_error("Invalid_fk_kids");

			$name = $name.$fk_kids;
			break;
		}
	}

	if( $isAuth == false )
		print_error("Invaild_token");
}
else
{
}

if ($_FILES)
{
	switch($_FILES['filename']['type'])
	{
		case 'image/jpg':
		case 'image/jpeg': $ext='jpg'; break;
		case 'image/gif': $ext='gif';  break;
		case 'image/png': $ext='png';  break;
		default:
				print_error('{"Error":"Invalid_file"}');
	}
	$name = $name.".".$ext;

	if($_POST[width] || $_POST[height])
	{
		use \Eventviva\ImageResize;
		/*
		$image = new ImageResize($_FILES['filename']['tmp_name']);

		if($_POST[width])
			$image->resizeToWidth($_POST[width]);
		if($_POST[height])
			$image->resizeToHeight($_POST[height]);

		$image->save($_FILES['filename']['tmp_name']);
		*/
	}

	$success = move_uploaded_file ($_FILES['filename']['tmp_name'], $name);

	if($success == 0)
	{
		http_response_code(500);	
		print ('{"Error":"Fail_write"}');
		return;
	}
	print ('{"filename":"'.$name.'"}');
}
else
{
	print ('{"Error":"No_file"}');
}
?>
