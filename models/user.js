class User {
    constructor(name, gender, password, email, admin, birth, country, photo, id) {
        this.id = id;
        this.name = name;
        this.gender = gender;
        this.password = password;
        this.email = email;
        this.admin = admin;
        this.birth = birth;
        this.country = country;
        this.photo = photo;
        this.register = new Date();
    }

    loadFromJson(json) {
        for (let item in json) {
            this[item] = json[item];
        }
    }

    static getSessionUsers() {
        let users = []
        let localUser = localStorage.getItem('users')
        if (localUser) {
            users = JSON.parse(localUser);
        }

        return users;
    }

    static newId() {

        let lastId = parseInt(localStorage.getItem('lastId'));

        if (!lastId) {
            lastId = 0;
        }

        lastId++;

        localStorage.setItem('lastId', lastId)

        return lastId;
    }

    save() {
        let users = User.getSessionUsers();

        if (this.id > 0) {

            users.map(user => {

                if (user.id == this.id) {
                    Object.assign(user, this)
                }

                return user;

            });

        } else {
            this.id = User.newId();
            users.push(this);
        }

        localStorage.setItem('users', JSON.stringify(users));

        return this;
    }

    remove(){
        let users = User.getSessionUsers();

        users.forEach((user, index) => {
            if(this.id == user.id) {
                users.splice(index, 1);
            }
        });

        localStorage.setItem('users', JSON.stringify(users));
    }
}