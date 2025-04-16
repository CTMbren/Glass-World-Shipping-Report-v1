class Product{

    constructor(scannedText, id){
        this.scannedText = scannedText;
        let tokens = scannedText.match(/PROJECT:\s*(.+?)\tROOM:\s*(.*?)\tITEM NUMBER:\s*(.*)/);
        this.projectName = tokens[1];
        this.room = tokens[2];
        this.itemNumber = tokens[3];
        this.scannedText = scannedText;
        this.id = id;
    }

    info() {
        return(`Room: ${this.room} Item: ${this.itemNumber}`);
    }

    verbose() {
        return(this.scannedText);
    }

    getItemPrefix() {
        const match = this.itemNumber.match(/^(\d+)_/);
        return match ? parseInt(match[1], 10) : this.itemNumber;
    }

}