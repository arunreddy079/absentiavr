const Excel = require('exceljs');

var nanp_filename = "./nanp/nanp.xlsx";
var number_regions_9xx = {};
var number_regions_8xx = {};
var number_regions_7xx = {};
var number_regions_6xx = {};

function readWorkSheet(worksheet) {

  var number_regions = {};

  worksheet.eachRow(function (row, rowNumber) {
    if (rowNumber !== 1) {

      var num = "" + row.getCell(1).value;
      var reg = row.getCell(3).value;
      number_regions[num] = reg;
    } else {}
  });
  return number_regions;

}

var readFile = function () {
  var workbook_nanp = new Excel.Workbook();
  var result = workbook_nanp.xlsx.readFile(nanp_filename)
    .then(function () {
      var worksheet_9xx = workbook_nanp.getWorksheet("9xxx");
      var worksheet_8xx = workbook_nanp.getWorksheet("8xxx");
      var worksheet_7xx = workbook_nanp.getWorksheet("7xxx");
      var worksheet_6xx = workbook_nanp.getWorksheet("6xxx");
      var xx9 = readWorkSheet(worksheet_9xx);
      var xx8 = readWorkSheet(worksheet_8xx);
      var xx7 = readWorkSheet(worksheet_7xx);
      var xx6 = readWorkSheet(worksheet_6xx);
      return [xx9, xx8, xx7, xx6]
    });
  return result;
}

var compareNumber = function (numbers_to_compare, number_regions_9xx, number_regions_8xx, number_regions_7xx, number_regions_6xx) {
  var regions = [];
  for (var i = 0; i < numbers_to_compare.length; i++) {
    var number = "" + numbers_to_compare[i];
    var region = "empty";
    if (number.startsWith('9')) {
      region = compareWithRegex(number, number_regions_9xx);
    } else if (number.startsWith('8')) {
      region = compareWithRegex(number, number_regions_8xx);
    } else if (number.startsWith('7')) {
      region = compareWithRegex(number, number_regions_7xx);
    } else if (number.startsWith('6')) {
      region = compareWithRegex(number, number_regions_6xx);
    }
    regions.push(region);
  }
  return regions;
}

function compareWithRegex(number, numbers) {

  return numbers[number.slice(0, 4)];
}

// exported inorder to use them in app.js
module.exports = {
  compareNumber: compareNumber,
  readFile: readFile,
  number_regions_9xx: number_regions_9xx,
  number_regions_8xx: number_regions_8xx,
  number_regions_7xx: number_regions_7xx,
  number_regions_6xx: number_regions_6xx
};