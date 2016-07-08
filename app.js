var fs = require('fs');
var readline = require('readline');
var os = require('os');
var request = require('request');

var count1 = 1;
var count2 = 1;

var fWrite1 = fs.createWriteStream('output1.out', {
    flags: 'a',
    defaultEncoding: 'utf8',
    autoClose: true
});

var fWrite2 = fs.createWriteStream('output2.out', {
    flags: 'a',
    defaultEncoding: 'utf8',
    autoClose: true
});

var filedata = fs.readFileSync('file.in', 'utf8').split(/\r?\n/ig);
console.log(filedata);


function writeItem_setting(imgurl, data) {
	data = data.split(',');
	fWrite1.write("================BQ" + (count1++) +
		"=================" + os.EOL);
    fWrite1.write(os.EOL);
	fWrite1.write("    case '" + data[0] + "':" + os.EOL);
	fWrite1.write("        $img_url = '" + imgurl + "';" + os.EOL);
	fWrite1.write("        $img = imagecreatefromjpeg($img_url);" + os.EOL);
    fWrite1.write("        $font_size = " + (data[1]/4*3) + ";" + os.EOL);
    fWrite1.write("        $color = imagecolorallocatealpha($img, " +
    	data[2] + ", " + data[3] + ", " + data[4] + ", 0);" + os.EOL);
    fWrite1.write("        $font_family = 'font/" + data[5] + ".ttf';" + os.EOL);
    if (data[6] == 'r') {
    	fWrite1.write("        $x = " + data[7] + " - getBoxWidth($font_size, $font_family, $name);" + os.EOL);
    } else {
    	fWrite1.write("        $x = " + data[7] + ";" + os.EOL);
    }
    fWrite1.write("        $y = " + data[8] + ";" + os.EOL);
    fWrite1.write("        break;" + os.EOL);
    fWrite1.write(os.EOL);
}

function writeItem_preview(imgurl, data) {
	data = data.split(',');
	fWrite2.write("================BQ" + (count2++) +
		"=================" + os.EOL);
    fWrite2.write(os.EOL);
    fWrite2.write("                        array(" + os.EOL);
    fWrite2.write("                            'value' => '" + data[0] + "'," + os.EOL);
    fWrite2.write("                            'text' => '" + data[0] + "'," + os.EOL);
    fWrite2.write("                            'img' => '" + imgurl + "'"+ os.EOL);
    fWrite2.write("                        )," + os.EOL);
    fWrite2.write(os.EOL);
}


/*

接口的url删掉了，所以无法直接运行

*/

function createRequest_setting(index) {
	return request.post('我就是接口url', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(index+":"+body);
			result = JSON.parse(body);
			imgurl = result['pic'].replace(/http:\/\/m1/, 'http://m2');
			writeItem_setting(imgurl, filedata[index-1]);
		}
	});
}

function createRequest_preview(index) {
	return request.post('我就是接口url', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			result = JSON.parse(body);
			imgurl = result['pic'].replace(/http:\/\/m1/, 'http://m2');
			writeItem_preview(imgurl, filedata[index-1]);
		}
	});
}


for (var i = 1; i <= 15; i++) {
	setTimeout(function(x) {
		return function() {
			var r = createRequest_setting(x);
			var form = r.form();
			form.append('upload', fs.createReadStream("生成图/" + x + ".jpg"));
		}
	}(i), 1000);
	setTimeout(function(x) {
		return function() {
			var r = createRequest_preview(x);
			var form = r.form();
			form.append('upload', fs.createReadStream("预览图/" + x + ".jpg"));
		}
	}(i), 1000);
}

