class JobRoot {
    constructor(){
        this.projects = [];
    }

    addProject(project) {
        this.projects.push(project);
        this.projects.sort((a, b) => a.name.localeCompare(b.name));
    }

    getProjects() {
        return this.projects;
    }

    findProject(projectName) {
        return this.projects.find(project => project.name === projectName) || null;
    }

    getAllProducts() {
        return this.projects.flatMap(project => project.getAllProducts());
    }

    getAllJobs() {
        return this.projects;
    }

    toggleRoomByID(id) {
        for (const project of this.projects){
            project.toggleRoomByID(id);
        }
    }

    showAll() {
        for (const project of this.projects){
            project.showAll();
        }
    }

    removeProductById(id){
        for (let project of this.projects){
            project.removeProductById(id);
        }

        //Remove any empty projects
        this.projects = this.projects.filter(project => project.getRoomCount() > 0);
    }
}