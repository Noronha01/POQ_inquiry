const sheet_id = '1pNOb0Bbsz410BD_7jUf-G0tH15AB6momF7_RsyevqmA';
const sheet_name = encodeURIComponent("inquiry_data");
const sheet_url = `https://docs.google.com/spreadsheets/d/${sheet_id}/gviz/tq?tqx=out:csv&sheet=${sheet_name}`;

fetch(sheet_url)
  .then((response) => response.text())
  .then((csvText) => handleResponse(csvText));

function handleResponse(csvText) {
  let sheetObjects = csvToObjects(csvText);
  // sheetObjects is now an Array of Objects
  console.log(sheetObjects);
  // ADD CODE HERE
}

function csvToObjects(csv) {
  const csvRows = csv.split("\n");
  const propertyNames = csvSplit(csvRows[0]);
  let objects = [];
  for (let i = 1, max = csvRows.length; i < max; i++) {
    let thisObject = {};
    let row = csvSplit(csvRows[i]);
    for (let j = 0, max = row.length; j < max; j++) {
      thisObject[propertyNames[j]] = row[j];
      // BELOW 4 LINES WILL CONVERT DATES IN THE "ENROLLED" COLUMN TO JS DATE OBJECTS
      // if (propertyNames[j] === "Enrolled") {
      //   thisObject[propertyNames[j]] = new Date(row[j]);
      // } else {
      //   thisObject[propertyNames[j]] = row[j];
      // }
    }
    objects.push(thisObject);
  }
  return objects;
}

function csvSplit(row) {
  return row.split(",").map((val) => val.substring(1, val.length - 1));
}