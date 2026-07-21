import xlsx from 'xlsx';
import path from 'path';

const filePath = path.resolve('../Brief RSE 2026.xlsx');
const workbook = xlsx.readFile(filePath);

console.log('Sheets:', workbook.SheetNames);

workbook.SheetNames.forEach(sheetName => {
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`\n--- Sheet: ${sheetName} ---`);
  if (data.length > 0) {
    console.log('Columns:', data[0]);
  }
});
