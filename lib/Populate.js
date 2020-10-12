let Realm = require('realm')
const bson = require('bson')

const SERVER = `https://raw.githubusercontent.com/philipperemy/name-dataset/master/names_dataset/first_names.all.txt`

const PersonSchema = {
    name: 'Dictionary',
    properties: {
        _id: "objectId",
        _partition: "string?",
        name: 'string',
        status: 'bool'
    },
    primaryKey: '_id'
}

const startDB = async () => {
    console.log('startDB [init]')

    const appConfig = {
        id: `hello-dojbh`,
        timeout: 10000,
        app: {
            name: 'hello',
            version: '0',
        },
    }

    let CFG =  {
        schema: [PersonSchema],
        sync: {
            user: undefined,
            partitionValue: `hello-dojbh`,
        },
    }

    try{
        let app = new Realm.App(appConfig)

        Realm.App.Sync.setLogger(app, (lvl, msg) =>
            console.log(`[logs]  ${lvl} -> ${msg}` ))

        const creds = Realm.Credentials
        let anonymous = creds.anonymous()
        const newUser = await app.logIn(anonymous);
        CFG.sync.user = newUser

        console.log('realm Open')
        let realm = await Realm.open(CFG)
        // console.log('[begin] delete')
        // deleteAll(realm)
        // console.log('[end] delete')

        console.log('startDB [end]')
        return realm
    }catch(error){
        console.log('Fatal: ', error)
    }


    console.log('startDB [end]')
    return undefined
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
                realm.create('Dictionary',{
                    name,
                    status: false,
                    _partition: 'person-dojbh',
                    _id: new bson.ObjectId()
                })
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


        let dbSize = realm.objects('Dictionary').length
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

const Persons = async function() {
    console.log('Person [init]')

    let realm = await startDB()
    console.log('realm --> ', realm)

    if(realm === undefined)
        return [{key: 'Nothing'}]
    //let populate = await Populate(realm)
    let peoples = []

    return function(query) {
        try{
            console.log('Persons: init')
            let list = []
            let realmQuery = `name BEGINSWITH "${query}"`
            console.log('query: ', query, ' realm: ', realmQuery)

            if(query === '' || query === undefined)
                list = realm.objects('Dictionary')
            else
                list = realm.objects('Dictionary').filtered(realmQuery)

            console.log('Persons found: ', list.length)

            //peoples = list.map(person =>
            //   Object.assign({key: person.name}) )

            console.log('Persons: end')
            return list
        }catch(error){
            console.log('Error: ', error)
        }
    }

    console.log('Person [end]')
    return [{key: 'Nothing'}]
}

export { Populate, Persons };
