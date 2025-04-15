class Project {
    constructor(projectName) {
        this.name = projectName;
        this.projectRooms = [];
        this.roomCount = 0;
        this.hideContents = false;
    }

    addRoom(room) {
        this.projectRooms.push(room);
        this.projectRooms.sort((a, b) => a.name.localeCompare(b.name));
        this.roomCount = this.roomCount +1;
    }

    getRooms() {
        return this.projectRooms;
    }

    findRoom(roomName) {
        return this.projectRooms.find(room => room.name === roomName) || null;
    }

    getAllProducts() {
        return this.projectRooms.flatMap(room => room.getProducts());
    }

    getAllRooms() {
        return this.projectRooms;
    }

    removeProductById(id) {
        for (const room of this.projectRooms){
            room.removeProductById(id);
        }

        //Remove any empty rooms
        this.projectRooms = this.projectRooms.filter(room => room.getProductCount() > 0);

        //Update room count
        this.roomCount = this.projectRooms.length;
    }

    hideContents() {
        this.hideContents = true;
    }

    showContents() {
        this.hideContents = false;
    }

    toggleRoomByID(id) {
        for (const room of this.projectRooms){
            if (room.roomID == id) room.toggleVisibility();
        }
    }

    showAll() {
        for (const room of this.projectRooms){
            room.setVisible();
        }
    }

    getProductCount() {
        let productCount = 0;

        for (const room of this.projectRooms){
            productCount += room.getProductCount();
        }

        return productCount;
    }

    getRoomCount() {
        return this.roomCount;
    }
}