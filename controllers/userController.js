class UserController {
    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formElUpdate = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.onEditUser();
        this.onSubmit();
        this.selectAllUsers();
    }

    onEditUser() {
        document.querySelector('.btn-cancel-edition').addEventListener('click', () => {
            this.showFormCreate();
        });

        this.formElUpdate.addEventListener('submit', event => {

            event.preventDefault();

            let btn = this.formElUpdate.querySelector('[type=submit]');
            btn.disabled = true;

            let user = this.getInfoUser(this.formElUpdate);

            let index = this.formElUpdate.dataset.trIndex;


            //verificando qual linha está sendo alterada
            let tr = this.tableEl.rows[index];

            //pegando os valores da linha antes de editar
            let userOld = JSON.parse(tr.dataset.user);

            user = Object.assign({}, userOld, user);

            console.log('user ', userOld.id);

            this.getPhoto(this.formElUpdate).then(
                (content) => {
                    if (!user.id) {
                        user.id = userOld.id;
                    }

                    user.gender = userOld.gender;

                    if (!user.photo) {
                        user.photo = userOld.photo;
                    } else {
                        user.photo = content;
                    }

                    let newUser = new User();

                    newUser.loadFromJson(user);

                    newUser.save();

                    this.getTr(newUser, tr);

                    this.formElUpdate.reset();

                    this.showFormCreate();

                    this.updateUsers();

                    btn.disabled = false;

                }, (e) => {
                    console.error(e);
                }
            );

        });
    }

    onSubmit() {

        this.formEl.addEventListener('submit', event => {

            event.preventDefault();

            let btn = this.formEl.querySelector('[type=submit]');

            let user = this.getInfoUser(this.formEl);

            if (user == false) { // f.constructor.name
                return false;
            }

            btn.disabled = true;

            this.getPhoto(this.formEl).then(
                (content) => {

                    user.photo = content;

                    this.addRowToTable(user);

                    btn.disabled = false;

                    this.formEl.reset();

                    user.save();

                }, (e) => {
                    console.error(e);
                }
            );

        })
    }

    selectAllUsers() {
        let users = User.getSessionUsers();
        users.forEach(line => {
            let user = new User();
            user.loadFromJson(line);
            this.addRowToTable(user);
        });
    }


    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
                if (item.name == 'photo') {
                    return item;
                }
            });

            let file = elements[0].files[0];

            fileReader.onload = () => {
                resolve(fileReader.result);
            }

            fileReader.onerror = (error) => {
                reject(error);
            }

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/photo1.png');
            }

        });
    }

    getInfoUser(formEl) {

        let user = {};

        let formIsValid = true;

        //operador Spread para transformar o Object em um Array, permitindo que ele seja iterado
        [...formEl.elements].forEach(field => {

            //encontra o elemento pai do campo em questão e adiciona uma nova class a ele 
            if (['name', 'password', 'email'].indexOf(field.name) > -1 && field.value == '') {

                formIsValid = false;
                field.parentElement.classList.add('has-error');

            }

            if (field.name == 'gender') {

                if (field.checked) {
                    user[field.name] = field.value;
                }

            } else if (field.name == 'admin') {

                user[field.name] = field.checked;

            } else {

                user[field.name] = field.value;

            }
        })

        if (!formIsValid) {
            return false;
        } else {
            [...formEl.elements].forEach(field => {
                field.parentElement.classList.remove('has-error');
            });
        }

        return new User(
            user.name,
            user.gender,
            user.password,
            user.email,
            user.admin,
            user.birth,
            user.country,
            user.photo
        );
    }

    addRowToTable(dataUser) {

        let tr = this.getTr(dataUser)

        this.tableEl.appendChild(tr);

        this.updateUsers();

    }

    getTr(dataUser, tr = null) {

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML =
            `<td>
                <img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm">
            </td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${dataUser.admin ? 'Sim' : 'Não'}</td>
            <td>${Uteis.getDateFormated(dataUser.register)}</td>
            <td>
                <button type="button" class="btn-edit btn btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn-remove btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>`;

        this.addEventTr(tr);

        return tr;
    }



    addEventTr(tr) {

        tr.querySelector('.btn-remove').addEventListener('click', () => {

            if (confirm('Deseja realmente apagar o usuário?')) {

                let user = new User();

                user.loadFromJson(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateUsers();
            }

        });

        tr.querySelector('.btn-edit').addEventListener('click', () => {

            let user = JSON.parse(tr.dataset.user);

            this.formElUpdate.dataset.trIndex = tr.sectionRowIndex;

            for (let name in user) {

                let field = this.formElUpdate.querySelector(`[name='${name}']`);

                if (field) {

                    if (field.type == 'file') continue;

                    if (field.type == "checkbox") {
                        field.checked = user[name];
                    }

                    if (field.type == 'radio') {
                        if (user[name] == 'Homem')
                            this.formElUpdate.querySelector('#exampleInputGenderM').checked = 1;
                        else
                            this.formElUpdate.querySelector('#exampleInputGenderF').checked = 1;
                        continue;
                    }

                    field.value = user[name];
                }

            }

            this.formElUpdate.querySelector('.photo').src = user['photo'];

            this.showFormEdit();
        });
    }

    showFormEdit() {

        document.querySelector('#form-edit-user').style.display = 'block';
        document.querySelector('#form-create-user').style.display = 'none';

    }

    showFormCreate() {

        document.querySelector('#form-edit-user').style.display = 'none';
        document.querySelector('#form-create-user').style.display = 'block';

    }

    updateUsers() {
        // console.dir(this.tableEl); console.dir exibe o objeto no console

        let numberUsers = 0;

        let numberAdmin = 0;

        //acessar o .children de um elemento permite acessar os filhos dela
        [...this.tableEl.children].forEach(element => {

            let tr = JSON.parse(element.dataset.user);

            if (tr.admin) numberAdmin++;

            numberUsers++;
        });

        document.querySelector('#users').innerHTML = numberUsers;
        document.querySelector('#admin-users').innerHTML = numberAdmin;
    }
}