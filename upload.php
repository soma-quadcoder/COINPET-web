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

if($init_directory[Authorization] == true)
{	
	$name = $directory."/";
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
			
			// Non-need to check parents_has_kids table

			$name = $name.$fk_kids;
			break;
		}
	}

	if( $isAuth == false )
		print_error("Invaild_token");
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
	if( $name )
		$name = $name.".".$ext;
	else
		$name = $directory."/".$_FILES['filename']['name'];

	$image = new Eventviva\ImageResize($_FILES['filename']['tmp_name']);

	$width = $image->getDestWidth();
	$height = $image->getDestHeight();

	if($_POST[width])
		$width = $_POST[width];

	if($_POST[height])
		$height = $_POST[height];

	if($init_directory[width])
		$witdh = $init_directory[width];

	if($init_directory[height])
		$height = $init_directory[height];

	$image->resize($width, $height);

	$crop = json_decode($_POST[crop], true);
	
	if ($_POST[crop])
	{
		if ( ! ($crop[width] && $crop[height]) )
		{
			print_error ("Invalid_crop_value");
		}
		$crop = json_decode($_POST[crop], true);
		$width = $crop[width];
		$heidht = $crop[height];
	}
		
	if($init_directory[width])
		$width = $init_directory[crop][width];
	if($init_directory[height])
		$height = $init_directory[crop][height];

	$image->crop($width, $height);	
	$success = unlink($_FILES['filename']['tmp_name']);
	$image->save($name);
	$success |= $image->getSuccess();

	if($success == 0)
		print_error ("Fail_write");

	print ('{"filename":"'.$name.'"}');
}
else
{
	print_error ("No_file");
}
?>
