class Room{

    constructor(roomName, id){
        this.name = roomName;
        this.roomProducts = [];
        this.productCount = 0;
        this.roomID = id;
        this.hideContents = false;
    }

    addProduct(product) {
        this.roomProducts.push(product);
        this.roomProducts.sort((a,b) => a.getItemPrefix().localeCompare(b.getItemPrefix()));
        this.productCount ++;
    }

    getProducts() {
        return this.roomProducts;
    }

    getHeaderText() {
        if (this.hideContents) {
            return this.name + ' \u2192'
        } else {
            return this.name + ' \u2193'
        }
    }

    removeProductById(id){
       this.roomProducts = this.roomProducts.filter(product => product.id != id);

       //Update productCount
       this.productCount = this.roomProducts.length;
    }

    getProductCount() {
        return this.productCount;
    }

    toggleVisibility() {
        if (this.hideContents) {
            this.hideContents = false;
        } else {
            this.hideContents = true;
        }
    }

    //Used for showAll()
    setVisible() {
        this.hideContents = false;
    }
}