// Form Variables
let projectName = '';
let employeeName = '';
let loadingDate;
let shippingDate;

// JobRoot variable
const jobRoot = new JobRoot();

//ID tracker
let NEXTID = 0;
let NEXTROOM = 0;

// Variable used to delete item by ID using bootstrap modal
let selectedButton = '';

//QR Scanner
let html5QrcodeScanner;
let lastScan = '';

//QR Scanner Beep sound
var beepSound = new Audio('beep.mp3');

const currentDate = new Date();

/**
 * Setup function for initializing the QR code scanner API
 * And assigning it to he html container
 */
function setup() {
  createCanvas(0, 0);

  // Initialize new QRcode scanner and set configs
  startQR();

  //Load any session list
  loadSession();
}

/**
 * After a successful QR code scan, the information is passed to here
 * @param {*} decodedText The text from the QR code object
 * @param {*} decodedResult The Scanned QR Code Object
 */
function onScanSuccess(decodedText, decodedResult) {
  //Make a beep sound when a new item is scanned
  if (!(lastScan == decodedText)) {
    beepSound.play();
  }
  let scannedItem = document.getElementById('scannedItem');
  scannedItem.textContent = 'Last scanned item: ' + decodedText;
  lastScan = decodedText;
}

function addScannedItem() {
  if (lastScan.length > 0) addListItem(lastScan);
  let scannedItem = document.getElementById('scannedItem');
  scannedItem.textContent = 'Last scanned item: ';
  lastScan = '';
}

function stopQR() {
  html5QrcodeScanner.stop();

  //Set QR reader height to 0;
  let qrReader = document.getElementById('qr-reader');
  qrReader.setAttribute('style', 'width=0px; height=0px;');
}

function startQR() {
  // Initialize new QRcode scanner and set configs
  html5QrcodeScanner = new Html5Qrcode("qr-reader");
  const config = { fps: 10, qrbox: { width: 600, height: 400 } };

  // Use rear camera as default
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    config,
    onScanSuccess
  );
  
  //Set QR reader height and width;
  let qrReader = document.getElementById('qr-reader');
  qrReader.setAttribute('style', 'width=600px; height=400px;');
}

function addProduct(product) {
  //Check if project exists in jobroot:
  let project = jobRoot.findProject(product.projectName);
  if (project == null) {
    project = new Project(product.projectName);
    jobRoot.addProject(project);
  }
  //Check if room exists in project
  let room = project.findRoom(product.room);
  if (room == null) {
    room = new Room(product.room, NEXTROOM);
    project.addRoom(room);
    NEXTROOM ++;
  } 
  //Add product to room
  room.addProduct(product);
}

function rebuildList(){
  let list = document.getElementById("item-list");
  //Clear current list
  list.textContent = '';

  // Get all projects
  let projectArray = jobRoot.getAllJobs();

  projectArray.forEach(project => {
    //Add list item for project header
    let projectHeader = document.createElement('li');
    projectHeader.id = 'li-' + project.name;
    projectHeader.className = "list-group-item d-flex justify-content-between align-items-center list-group-item-success";
    let projectText = document.createTextNode(project.name);
    projectHeader.appendChild(projectText);
    //Room number badge
    let roomCountBadge = document.createElement("span");
    roomCountBadge.className = 'badge badge-pill badge-success';
    let roomCountBadgeText = document.createTextNode('Rooms: ' + project.getRoomCount() + '\t Total Products: ' + project.getProductCount());
    roomCountBadge.appendChild(roomCountBadgeText);
    projectHeader.appendChild(roomCountBadge);

    list.appendChild(projectHeader);

    //Add rooms
    let roomArray = project.getAllRooms();
    roomArray.forEach(room => {
      //Add list item for room header
      let roomHeader = document.createElement('li');
      roomHeader.id = 'r-' + room.roomID;
      roomHeader.className = "list-group-item d-flex justify-content-between align-items-center list-group-item-secondary";
      let roomText = document.createTextNode(room.getHeaderText());
      roomHeader.setAttribute('onClick', 'hideRoom(this.id)');
      roomHeader.appendChild(roomText);
      //Room number badge
      let productCountBadge = document.createElement("span");
      productCountBadge.className = 'badge badge-pill badge-secondary';
      let roomCountBadgeText = document.createTextNode('Products: ' + room.getProductCount());
      productCountBadge.appendChild(roomCountBadgeText);
      roomHeader.appendChild(productCountBadge);

      list.appendChild(roomHeader);

      //If room is not hidden, add all products to the list
      if (!room.hideContents){
        //Add products
        let productArray = room.getProducts();
        let itemIndex = 1; //Used to inumerate list items
        productArray.forEach(product => {
          //Create li element
          let item = document.createElement("li");
          item.id = "li" + product.id;
          item.className = `list-group-item d-flex justify-content-between align-items-center py-1 product`;
          //item.setAttribute('onClick', 'testClick()');
          if (!(product.projectName.toLocaleLowerCase().includes(projectName.toLocaleLowerCase()))) item.classList.add('list-group-item-warning');
          let dText = document.createTextNode(itemIndex + ') ' + product.itemNumber);
          item.appendChild(dText);
          //Remove item button
          let removeBtn = document.createElement("span");
          removeBtn.id = product.id;
          removeBtn.className = 'badge badge-pill badge-danger btn invisible';
          removeBtn.setAttribute('data-toggle', 'modal');
          removeBtn.setAttribute('data-target', '#removeModal');
          removeBtn.onclick = function () {
            removeClick(this.id);
          };
          let bText = document.createTextNode("X");
          removeBtn.appendChild(bText);
          item.appendChild(removeBtn);
          //Add li element to list
          list.appendChild(item);
          itemIndex ++;
        });
      }
    });
  });

  //Save list to session storage
  saveSession();
}

function hideRoom(id) {
  let roomHeader = document.getElementById(id);
  jobRoot.toggleRoomByID(id.slice(2)); // slice(2) removes the 'r-' protion of the id
  rebuildList();
}

function toggleProductEdit() {
  let products = document.querySelectorAll('li.product > span');
  for (let product of products) {
    product.classList.toggle('invisible');
  }
}

function addListItem(decodedText) {
  //make new product
  let product = new Product(decodedText, NEXTID);
  NEXTID ++;

  //Add product to jobRoot
  addProduct(product);

  //Rebuild List
  rebuildList();
}

function removeClick(id) {
  selectedButton = id;
  //Change modal to be information for the selected item
  let itemInfo = document.getElementById('li'+id).innerText;
  // Remove the 'X' from the text of the child button
  itemInfo = itemInfo.slice(0,-1);
  let modalBody = document.getElementById('removeModal-body');
  modalBody.textContent = itemInfo;
}

function removeSelectedItem() {
  //
  document.getElementById(selectedButton).remove();
  document.getElementById("li" + selectedButton).remove();
  jobRoot.removeProductById(selectedButton);
  rebuildList();
}

function saveSession() {

  //Save form data to session
  sessionStorage.setItem('projectName', projectName);
  sessionStorage.setItem('employeeName', employeeName);
  sessionStorage.setItem('shippingDate', shippingDate);
  sessionStorage.setItem('loadingDate', loadingDate);

  //Get all products
  let allProducts = jobRoot.getAllProducts();
  let textArray = [];

  //Get scanned text from all products
  for(let product of allProducts){
    textArray.push(product.scannedText);
  }

  //Save list to session
  sessionStorage.setItem('productList', JSON.stringify(textArray));
}

function loadSession() {
  // Load form data
  projectName = sessionStorage.getItem('projectName') || '';
  employeeName = sessionStorage.getItem('employeeName') || '';
  shippingDate = sessionStorage.getItem('shippingDate') || '';
  loadingDate = sessionStorage.getItem('loadingDate') || '';

  // Update the form inputs, if they exist
  if (document.getElementById('projectName')) {
    document.getElementById('projectName').value = projectName;
    document.getElementById('employeeName').value = employeeName;
    document.getElementById('shippingDate').value = shippingDate;
    document.getElementById('loadingDate').value = loadingDate;
  }

  // Update report values
  document.getElementById('reportProjectName').textContent = 'Project Name: ' + projectName;
  document.getElementById('reportEmployeeName').textContent = 'Loaded By: ' + employeeName;
  document.getElementById('reportShippingDate').textContent = 'Shipping On: ' + shippingDate;
  document.getElementById('reportLoadingDate').textContent = 'Loaded On: ' + loadingDate;

  // Get product list from session
  const sessionList = sessionStorage.getItem('productList');

  if (sessionList) {
    const textArray = JSON.parse(sessionList);
    for (let scannedText of textArray) {
      addListItem(scannedText);
    }
  }

}


function saveList() {
  //Un-hide all products and print page
  jobRoot.showAll();
  rebuildList();
  window.print();
}

function updateForm() {
  // Get variables form form inputs
  projectName = document.getElementById('projectName').value;
  employeeName = document.getElementById('employeeName').value;
  shippingDate = document.getElementById('shippingDate').value;
  loadingDate = document.getElementById('loadingDate').value;

  //Update report values
  let reportProjectName = document.getElementById('reportProjectName').textContent = 'Project Name: '+projectName;
  let reportEmployeeName = document.getElementById('reportEmployeeName').textContent = 'Loaded By: '+employeeName;
  let reportShippingDate = document.getElementById('reportShippingDate').textContent = 'Shipping On: '+shippingDate;
  let reportLoadingDate = document.getElementById('reportLoadingDate').textContent = 'Loaded On: '+loadingDate;

  //Rebuild list
  rebuildList();
}

function exportList() {
  //Get all products
  let allProducts = jobRoot.getAllProducts();
  let textArray = [];

  //Get scanned text from all products
  for(let product of allProducts){
    textArray.push(product.scannedText);
  }

  //Turn array into paragraph of scanned items
  let fileContent = textArray.join('\n');

  // Create a blob from the text
  const blob = new Blob([fileContent], { type: 'text/plain' });

  // Create a temporary link element
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Shipping Report.txt';

  // Trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Optionally, revoke the blob URL after download
  URL.revokeObjectURL(link.href);
}

//Function to load dummy text
function loadExample() {
  let dummyNumber = Math.floor(Math.random() * 6);
  let dummyNames = [
    'PROJECT: MONTVUE PARCEL 7 - BUILDING A	ROOM: KITCHEN 2 - BUILDING A - TYPE B1 - SHAKER	ITEM NUMBER: B1-04-W2-B2-DW', 
    'PROJECT: MONTVUE PARCEL 7 - BUILDING A	ROOM: KITCHEN 2 - BUILDING A - TYPE B1 - SHAKER	ITEM NUMBER: B1-03-W1-B1-BLIND', 
    'PROJECT: MONTVUE PARCEL 7 - BUILDING A	ROOM: KITCHEN 2 - BUILDING A - TYPE B1	ITEM NUMBER: B1-02-W1-B2-SINK', 
    'PROJECT: MONTVUE PARCEL 7 - BUILDING A	ROOM: KITCHEN 2 - BUILDING A - TYPE B1	ITEM NUMBER: B1-01-W1-B1', 
    'PROJECT: MONTVUE PARCEL 7 - BUILDING A	ROOM: TYPE B1 VANITIES - SHAKER	ITEM NUMBER: B1 - VANITY - MAIN - RIGHT',
    'PROJECT: Base 10	ROOM: TYPE B1 VANITIES - SHAKER	ITEM NUMBER: B1 - VANITY - MAIN - LEFT'
    ];
  let dummy = dummyNames[dummyNumber]
  addListItem(dummy);
}

function draw(){

}

