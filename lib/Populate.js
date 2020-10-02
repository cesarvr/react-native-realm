let Realm = require('realm')

const SERVER = `https://raw.githubusercontent.com/philipperemy/name-dataset/master/names_dataset/first_names.all.txt`

const PersonSchema = {
    name: 'Person',
    properties: {
        name: 'string'
    }
}

class Timing {
    start() {
        this.start = new Date().getTime()
    }

    end() {
        this.end = new Date().getTime() - this.start
        console.log('Time Lapse: ', this.end, 'ms')
    }
}

let T = new Timing()

function updateFromServer(URL){
    console.log('updateFromServer: init')
    let non_block = fetch(URL)
        .then(resp => resp.text())
        .then(txt => txt.split('\n'))
        .then(lst => lst.filter(txt => txt !=='--------------------'))
    console.log('updateFromServer: end')
    return non_block
}

function loadPersonsOnDB(realm, persons){
    console.log('loadPersonsOnDB: init')
//    T.start()

    if(persons.length > 0 || !Array.isArray(persons)) {
        console.log('Loading...')
        realm.write(() => {
            persons.forEach(name =>
                realm.create('Person',{name})
            )

        })
        //T.end()
        console.log('loadPersonsOnDB: end')
    }
}

function deleteAll(realm) {
    console.log('cleaning DB')
    realm.write(() => {
        realm.deleteAll()
    })
    console.log('db cleared...')
}



async function Populate(realm){
    try{
        console.log('Populate: init')

        deleteAll(realm)

        let dbSize = realm.objects('Person').length
        let isEmpty = dbSize  === 0

        console.log('records:', dbSize)
        let persons;

        if( isEmpty ){
            persons = await updateFromServer(SERVER)
            loadPersonsOnDB(realm, persons)
        }else
            console.log('There is one already...continue...')

        console.log('Populate: end')
        return persons

    }catch(error){
        console.log('Error: ', error)
    }

    console.log('Populate: end')
}

const TT = () => Realm.open({schema: [PersonSchema]})
    .then(realm => realm.objects('Person') )
    .then(persons => persons.map(person => Object.assign({key: person.name}) ))



const Persons = async function() {

    let realm = await Realm.open({schema: [PersonSchema]})
    let populate = await Populate(realm)
    let peoples = []

    return function(query) {
        try{
            console.log('Persons: init')
            let list = []
            let realmQuery = `name BEGINSWITH "${query}"`
            console.log('query: ', query, ' realm: ', realmQuery)

            if(query === '' || query === undefined)
                list = realm.objects('Person')
            else
                list = realm.objects('Person').filtered(realmQuery)

            console.log('Persons found: ', list.length)

            peoples = list.map(person =>
                Object.assign({key: person.name}) )

            return peoples
        }catch(error){
            console.log('Error: ', error)
        }
    }
    console.log('Persons: end')
    return [{key: 'Nothing'}]
}

export { Populate, Persons };
