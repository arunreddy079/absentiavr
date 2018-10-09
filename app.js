var app = require('express')();
var ss = require('socket.io-stream');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var bodyParser = require('body-parser');
var multer = require('multer');
var Excel = require('exceljs');
var nanp = require('./nanp/nanp-script');
var rimraf = require('rimraf');

app.set('trust proxy', true)

app.use('/', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

app.use('/', express.static(__dirname + '/public'));



// multer setup
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + "/uploads")
    },
    filename: function (req, file, cb) {
        cb(null, __dirname + '/uploads/' + (req.ip.split(':')[req.ip.split(':').length - 1]) + ".xlsx");
    }
});
var upload = multer({
    storage: storage
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 3000);

app.post('/upload', upload.single('file'), function (req, res) {

    // console.log("hello");

    function find_regions() {
        // console.log("in function");
        var input_filename = __dirname + "/uploads/" + req.ip.split(':')[req.ip.split(':').length - 1] + '.xlsx';
        var phone_numbers = [];
        var workbook = new Excel.Workbook();
        var column_num = parseInt(req.body.column, 10);
        var num_list = workbook.xlsx.readFile(input_filename)
            .then(function () {


                var worksheet = workbook.getWorksheet("Sheet1");

                worksheet.eachRow(function (row, rowNumber) {
                    if (rowNumber !== 1) {

                        let num = "" + row.getCell(column_num).value;
                        phone_numbers.push(num);

                    } else {}
                });

                var xx9 = [];
                var xx8 = [];
                var xx7 = [];
                var xx6 = [];

                var result_regions = nanp.readFile().then((result) => {
                    xx9 = result[0];
                    xx8 = result[1];
                    xx7 = result[2];
                    xx6 = result[3];
                    var res = nanp.compareNumber(phone_numbers, xx9, xx8, xx7, xx6);
                    return res;
                });
                return result_regions;
            });
        return num_list;
    }


    find_regions().then((result_regions) => {

        var workbook = new Excel.Workbook();

        var final_excel = workbook.xlsx.readFile(__dirname + "/uploads/" + req.ip.split(':')[req.ip.split(':').length - 1] + '.xlsx')
            .then(function () {

                var k = 2;
                for (var i = 0; i < result_regions.length; i++) {

                    var worksheet = workbook.getWorksheet("Sheet1");
                    var row = worksheet.getRow(k);
                    row.getCell(2).value = result_regions[i];
                    k++;
                }

                workbook.xlsx.writeFile(__dirname + "/uploads/" + req.ip.split(':')[req.ip.split(':').length - 1] + '_output.xlsx').then(() => {

                    res.sendFile(__dirname + "/download.html");

                });
            });

    });
});

io.on('connection', function (socket) {
    ss(socket).on('file', function (stream) {
        fs.createReadStream(__dirname + '/uploads/' + socket.handshake.address.split(':')[socket.handshake.address.split(':').length - 1] + '_output.xlsx').pipe(stream);
    });
});