class Uteis {
    static getDateFormated(data) {
        if (data == undefined) data = new Date();
        else if (typeof data == 'string') data = new Date(data);
        else data = new Date();

        return data.toLocaleDateString() + ' - ' + data.getHours() + ':' + data.getMinutes();
    }
}